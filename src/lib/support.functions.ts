import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(1).max(4000),
});

export const createSupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({ user_id: userId, subject: data.subject, protocol: "" })
      .select("id,protocol")
      .single();
    if (error || !ticket) return { error: error?.message || "Failed", ticket: null };
    await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: userId,
      role: "user",
      content: data.message,
    });
    return { error: null, ticket };
  });

const replySchema = z.object({
  ticketId: z.string().uuid(),
  message: z.string().min(1).max(4000),
  asAdmin: z.boolean().optional(),
});

export const replySupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => replySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let role: "user" | "admin" = "user";
    if (data.asAdmin) {
      const { data: roleRow } = await supabase
        .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
      if (roleRow) role = "admin";
    }
    const { error } = await supabase.from("support_messages").insert({
      ticket_id: data.ticketId,
      sender_id: userId,
      role,
      content: data.message,
    });
    if (error) return { error: error.message };
    return { error: null };
  });

const statusSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(["open", "pending", "resolved", "closed"]),
});

export const setTicketStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => statusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("support_tickets").update({ status: data.status }).eq("id", data.ticketId);
    return { error: error?.message ?? null };
  });
