import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PURGE_DAYS = 30;

export const exportUserData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;

    const [profile, clients, quotations, jobs, expenses, incomes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("clients").select("*"),
      supabase.from("quotations").select("*"),
      supabase.from("job_trackers").select("*"),
      supabase.from("finance_expenses").select("*"),
      supabase.from("finance_incomes").select("*"),
    ]);

    return {
      exported_at: new Date().toISOString(),
      user_id: userId,
      profile: profile.data ?? null,
      clients: clients.data ?? [],
      quotations: quotations.data ?? [],
      job_trackers: jobs.data ?? [],
      finance_expenses: expenses.data ?? [],
      finance_incomes: incomes.data ?? [],
      errors: [clients.error, quotations.error, jobs.error, expenses.error, incomes.error]
        .filter(Boolean)
        .map((e) => e!.message),
    };
  });

export const deleteOwnAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ confirm: z.literal("DELETE") }).parse(d))
  .handler(async ({ context }) => {
    const { userId } = context;
    const purgeAfter = new Date(Date.now() + PURGE_DAYS * 86400000).toISOString();
    const warnings: string[] = [];

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    if (roleErr) warnings.push(`user_roles:${roleErr.message}`);

    const { error: updateErr } = await (supabaseAdmin as any)
      .from("profiles")
      .update({
        is_active: false,
        tester_approved: false,
        deactivated_at: new Date().toISOString(),
        deactivated_by: userId,
        purge_after: purgeAfter,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (updateErr) {
      return { ok: false as const, error: `ปิดใช้งานบัญชีไม่สำเร็จ: ${updateErr.message}` };
    }

    try {
      const { error: banErr } = await (supabaseAdmin.auth.admin as any).updateUserById(userId, {
        ban_duration: "876000h",
      });
      if (banErr) warnings.push(`auth_ban:${banErr.message}`);
    } catch (e) {
      warnings.push(`auth_ban:${e instanceof Error ? e.message : String(e)}`);
    }

    return {
      ok: true as const,
      purge_after: purgeAfter,
      warnings,
      message: `บัญชีถูกปิดใช้งานแล้ว ข้อมูลจะถูกลบภายใน ${PURGE_DAYS} วัน`,
    };
  });
