import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Returns whether the current authenticated user has the admin role. */
export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return { admin: false };
    return { admin: !!data };
  });

/** Admin overview KPIs (counts only — pulls from tables the admin's RLS allows via role widening is NOT applied here; we read aggregate counts via service role). */
export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) return { error: "Forbidden", users: 0, conversations: 0, messages: 0, credits: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ count: users }, { count: conversations }, { count: messages }, { data: credits }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("conversations").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("messages").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("credits").select("balance"),
    ]);
    const creditsTotal = (credits ?? []).reduce((a, r) => a + (r.balance ?? 0), 0);
    return {
      error: null,
      users: users ?? 0,
      conversations: conversations ?? 0,
      messages: messages ?? 0,
      credits: creditsTotal,
    };
  });
