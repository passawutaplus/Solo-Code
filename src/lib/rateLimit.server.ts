import { supabaseAdmin } from "@/integrations/supabase/client.server";

const HOUR_MS = 60 * 60 * 1000;

/** Max anonymous error reports per email per hour. */
export async function isErrorReportRateLimited(opts: {
  userId: string | null;
  contactEmail?: string;
}): Promise<boolean> {
  const since = new Date(Date.now() - HOUR_MS).toISOString();
  const limit = 3;

  if (opts.userId) {
    const { count, error } = await (supabaseAdmin as any)
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("source", "error_page")
      .eq("user_id", opts.userId)
      .gte("created_at", since);
    if (error) {
      console.error("[rateLimit] support_tickets count:", error.message);
      return false;
    }
    return (count ?? 0) >= limit;
  }

  const email = opts.contactEmail?.trim().toLowerCase();
  if (!email) return false;

  const { count, error } = await (supabaseAdmin as any)
    .from("beta_feedback")
    .select("id", { count: "exact", head: true })
    .eq("feature", "error_page")
    .eq("user_email", email)
    .gte("created_at", since);
  if (error) {
    console.error("[rateLimit] beta_feedback count:", error.message);
    return false;
  }
  return (count ?? 0) >= limit;
}
