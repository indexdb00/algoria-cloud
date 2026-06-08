import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LANG_NAMES: Record<string, string> = {
  en: "English", pt: "Portuguese (pt-PT/pt-BR)", es: "Spanish", fr: "French", de: "German", it: "Italian",
};

// Aurevia model variants → underlying Lovable AI Gateway model + credit cost multiplier.
const VARIANTS = {
  "v1": { gatewayModel: "google/gemini-3-flash-preview", costMultiplier: 1, paidOnly: false, label: "Aurevia v1.0" },
  "v1.1": { gatewayModel: "google/gemini-2.5-pro", costMultiplier: 2, paidOnly: false, label: "Aurevia Thinking v1.1" },
  "plus": { gatewayModel: "google/gemini-2.5-pro", costMultiplier: 1, paidOnly: true, label: "Aurevia Plus" },
  "claude": { gatewayModel: "anthropic/claude-sonnet-4.5", costMultiplier: 0, paidOnly: false, label: "Claude (admin)" },
} as const;

type Variant = keyof typeof VARIANTS;

const sendSchema = z.object({
  conversationId: z.string().uuid().optional(),
  agentSlug: z.string().min(1).max(64),
  message: z.string().min(1).max(8000),
  language: z.enum(["en", "pt", "es", "fr", "de", "it"]).optional(),
  variant: z.enum(["v1", "v1.1", "plus", "claude"]).optional(),
  imageDataUrl: z.string().max(8_000_000).optional(),
  imageMeta: z.object({
    width: z.number().int().positive().max(20000),
    height: z.number().int().positive().max(20000),
    aspect: z.string().max(16),
  }).optional(),
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

    const variant: Variant = (data.variant ?? "v1");
    const variantSpec = VARIANTS[variant];

    // Load agent
    const { data: agent, error: agentErr } = await supabase
      .from("agents")
      .select("slug,name,system_prompt,cost_per_message")
      .eq("slug", data.agentSlug)
      .single();
    if (agentErr || !agent) return { error: "Agent not found", reply: "", conversationId: null };

    const cost = Math.max(0, Math.round(agent.cost_per_message * variantSpec.costMultiplier));

    // Admin Claude variant bypasses credit check entirely (unlimited admin chat)
    if (variant !== "claude" && cost > 0) {
      const { data: creditsRow } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", userId)
        .single();
      const balance = creditsRow?.balance ?? 0;
      if (balance < cost) {
        return { error: "Insufficient credits", reply: "", conversationId: null };
      }
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

    // Persist user message (text only — we don't store the image binary)
    const persistedUser = data.imageMeta
      ? `${data.message}\n\n_[image attached · ${data.imageMeta.width}×${data.imageMeta.height} · ${data.imageMeta.aspect}]_`
      : data.message;
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "user",
      content: persistedUser,
    });

    // Call Lovable AI
    const langName = LANG_NAMES[data.language ?? "en"] ?? "English";
    const langDirective = `IMPORTANT: Always reply in ${langName}, regardless of the language of the user's message. Use natural, idiomatic ${langName}. Keep brand names, KPIs (ROAS, CPL, CAC, CTR) and technical platform names (Meta Ads, Google Ads, TikTok Ads, BidMachine, GA4, Business Suite) untranslated. Format with concise markdown.`;
    const adPolicyDirective = `AD POLICY GATE: If the user uploaded a creative image, you MUST first validate it for ad use:
1) Required aspect ratios per platform: Meta Feed 1:1 or 4:5; Meta Stories/Reels 9:16; Google Display 1.91:1 or 1:1; YouTube/Video 16:9; TikTok 9:16. The attached image metadata is provided in the user message.
2) If the aspect ratio does not match the platform the user mentioned, REFUSE with the line "❌ REJECTED — aspect ratio mismatch" and tell them the correct ratio and target size.
3) Check the visible content against Meta Ads, Google Ads, TikTok Ads and BidMachine policies (no adult content, no hate, no misleading medical claims, no prohibited financial services, no shock/violence, no illegal goods, no copyrighted characters without rights). If any rule is violated, REFUSE with the line "❌ REJECTED — policy violation" and quote the rule.
4) If everything is OK, proceed and produce a CAMPAIGN block with platform, audience, budget, KPI target and next actions.`;

    const userContent: unknown = data.imageDataUrl
      ? [
          { type: "text", text: data.message + (data.imageMeta ? `\n\n[Attached image metadata: width=${data.imageMeta.width}px, height=${data.imageMeta.height}px, aspect=${data.imageMeta.aspect}]` : "") },
          { type: "image_url", image_url: { url: data.imageDataUrl } },
        ]
      : data.message;

    const messages = [
      { role: "system", content: agent.system_prompt + "\n\n" + langDirective + "\n\n" + adPolicyDirective },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userContent },
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
          model: variantSpec.gatewayModel,
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

    // Deduct credits + log + bump conversation (skip for admin Claude variant)
    let newBalance: number | null = null;
    if (variant !== "claude" && cost > 0) {
      const { data: cr } = await supabase.from("credits").select("balance").eq("user_id", userId).single();
      const currentBalance = cr?.balance ?? 0;
      newBalance = currentBalance - cost;
      await supabase
        .from("credits")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      await supabase
        .from("credit_transactions")
        .insert({ user_id: userId, amount: -cost, reason: `agent:${agent.slug}:${variant}` });
    }
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return { error: null, reply, conversationId, newBalance, costApplied: cost, variant: variantSpec.label };
  });
