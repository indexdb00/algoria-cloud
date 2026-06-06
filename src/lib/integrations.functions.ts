import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CONNECT_COST = 5;

const schema = z.object({
  integrationId: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  credentials: z.record(z.string().min(1).max(64), z.string().max(2000)),
});

export const connectIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: creditsRow } = await supabase
      .from("credits").select("balance").eq("user_id", userId).single();
    const balance = creditsRow?.balance ?? 0;
    if (balance < CONNECT_COST) {
      return { error: "Insufficient credits", balance };
    }

    const { error: upsertErr } = await supabase
      .from("user_integrations")
      .upsert(
        {
          user_id: userId,
          integration_id: data.integrationId,
          name: data.name,
          credentials: data.credentials,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,integration_id" },
      );
    if (upsertErr) return { error: upsertErr.message, balance };

    await supabase.from("credits")
      .update({ balance: balance - CONNECT_COST, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    await supabase.from("credit_transactions")
      .insert({ user_id: userId, amount: -CONNECT_COST, reason: `integration:connect:${data.integrationId}` });

    return { error: null, balance: balance - CONNECT_COST, cost: CONNECT_COST };
  });

export const disconnectIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ integrationId: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_integrations")
      .delete()
      .eq("user_id", context.userId)
      .eq("integration_id", data.integrationId);
    return { error: error?.message ?? null };
  });
