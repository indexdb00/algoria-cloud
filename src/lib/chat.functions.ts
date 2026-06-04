import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LANG_NAMES: Record<string, string> = {
  en: "English", pt: "Portuguese (pt-PT/pt-BR)", es: "Spanish", fr: "French", de: "German", it: "Italian",
};

const sendSchema = z.object({
  conversationId: z.string().uuid().optional(),
  agentSlug: z.string().min(1).max(64),
  message: z.string().min(1).max(8000),
  language: z.enum(["en", "pt", "es", "fr", "de", "it"]).optional(),
});

export const sendAgentMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => sendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      return { error: "AI service not configured. LOVABLE_API_KEY missing.", reply: "", conversationId: null };
    }

    // Load agent
    const { data: agent, error: agentErr } = await supabase
      .from("agents")
      .select("slug,name,system_prompt,cost_per_message")
      .eq("slug", data.agentSlug)
      .single();
    if (agentErr || !agent) return { error: "Agent not found", reply: "", conversationId: null };

    // Check credits
    const { data: creditsRow } = await supabase
      .from("credits")
      .select("balance")
      .eq("user_id", userId)
      .single();
    const balance = creditsRow?.balance ?? 0;
    if (balance < agent.cost_per_message) {
      return { error: "Insufficient credits", reply: "", conversationId: null };
    }

    // Get or create conversation
    let conversationId = data.conversationId ?? null;
    if (!conversationId) {
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({ user_id: userId, agent_slug: agent.slug, title: data.message.slice(0, 60) })
        .select("id")
        .single();
      if (convErr || !conv) return { error: "Could not create conversation", reply: "", conversationId: null };
      conversationId = conv.id;
    }

    // Load prior messages (last 20)
    const { data: history } = await supabase
      .from("messages")
      .select("role,content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Insert user message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "user",
      content: data.message,
    });

    // Call Lovable AI
    const messages = [
      { role: "system", content: agent.system_prompt },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: data.message },
    ];

    let reply = "";
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
        }),
      });
      if (res.status === 429) return { error: "Rate limit exceeded. Please try again shortly.", reply: "", conversationId };
      if (res.status === 402) return { error: "AI workspace credits exhausted. Please add funds.", reply: "", conversationId };
      if (!res.ok) {
        const txt = await res.text();
        console.error("AI gateway error", res.status, txt);
        return { error: "AI service error", reply: "", conversationId };
      }
      const json = await res.json();
      reply = json?.choices?.[0]?.message?.content ?? "";
    } catch (e) {
      console.error("AI call failed", e);
      return { error: "AI service unavailable", reply: "", conversationId };
    }

    if (!reply) reply = "(no response)";

    // Insert assistant message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "assistant",
      content: reply,
    });

    // Deduct credits + log transaction + bump conversation updated_at
    await supabase
      .from("credits")
      .update({ balance: balance - agent.cost_per_message, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    await supabase
      .from("credit_transactions")
      .insert({ user_id: userId, amount: -agent.cost_per_message, reason: `agent:${agent.slug}` });
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return { error: null, reply, conversationId, newBalance: balance - agent.cost_per_message };
  });
