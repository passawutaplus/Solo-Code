import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { notifyFreelancer, getFreelancerDisplayName } from "@/server/emailNotify.server";
import { canonicalUrl } from "@/lib/siteUrl";

const TokenSchema = z.object({ token: z.string().uuid() });

// Whitelisted columns — never expose internal/admin-only fields publicly.
const PUBLIC_JOB_COLUMNS =
  "id, share_token, tracking_code, title, client_name, status, current_step, progress_percent, total_amount, deposit_percent, amount_due, deposit_paid, final_paid, payment_info, final_file_url, preview_image_url, watermark_text, unlocked, notes, deadline, start_date, payment_qr_url, updated_at, quotation_id, brief_id";

// ===== Server-side totals (mirror of store/quotations computeTotals) =====
type QItem = { name?: string; unit?: string; quantity?: number; unitPrice?: number };
type QPct = { enabled?: boolean; percent?: number; label?: string };

const num = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : 0);
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function computePublicTotals(q: {
  items?: unknown; addons?: unknown; difficulties?: unknown;
  hidden_cost?: number; discount_value?: number; discount_kind?: string;
  vat_enabled?: boolean; vat_rate?: number; wht_enabled?: boolean; wht_rate?: number;
  deposit_preset?: number;
}) {
  const items = Array.isArray(q.items) ? (q.items as QItem[]) : [];
  const addons = Array.isArray(q.addons) ? (q.addons as QPct[]) : [];
  const diffs = Array.isArray(q.difficulties) ? (q.difficulties as QPct[]) : [];
  const itemsSubtotal = round2(items.reduce((s, it) => s + num(it.unitPrice) * num(it.quantity), 0));
  const addonAmount = round2(addons.filter(a => a.enabled).reduce((s, a) => s + itemsSubtotal * (num(a.percent) / 100), 0));
  const diffAmount = round2(diffs.filter(d => d.enabled).reduce((s, d) => s + itemsSubtotal * (num(d.percent) / 100), 0));
  const preTaxBefore = round2(itemsSubtotal + addonAmount + diffAmount + num(q.hidden_cost));
  const discountAmount = round2(q.discount_kind === "percent"
    ? (preTaxBefore * num(q.discount_value)) / 100
    : num(q.discount_value));
  const preTax = round2(Math.max(0, preTaxBefore - discountAmount));
  const vatAmount = round2(q.vat_enabled ? preTax * (num(q.vat_rate) / 100) : 0);
  const whtAmount = round2(q.wht_enabled ? preTax * (num(q.wht_rate) / 100) : 0);
  const grandTotal = round2(preTax + vatAmount - whtAmount);
  const depositAmount = round2(grandTotal * (num(q.deposit_preset) / 100));
  return { itemsSubtotal, addonAmount, diffAmount, discountAmount, preTax, vatAmount, whtAmount, grandTotal, depositAmount };
}

export const getPublicTrackingJob = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => TokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: job, error } = await supabaseAdmin
      .from("job_trackers")
      .select(PUBLIC_JOB_COLUMNS)
      .eq("share_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!job) return { job: null, events: [], slips: [], quotation: null, brief: null };

    const jobRow = job as unknown as { id: string; quotation_id: string | null; brief_id: string | null };

    const [{ data: events }, { data: slips }] = await Promise.all([
      supabaseAdmin
        .from("job_events")
        .select("id, kind, title, note, image_url, amount, created_at")
        .eq("job_id", jobRow.id)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("job_slips")
        .select("id, slip_url, note, verified, rejected, rejection_reason, uploaded_at")
        .eq("job_id", jobRow.id)
        .order("uploaded_at", { ascending: false }),
    ]);

    // Whitelisted quotation summary (safe for the client viewing this tracker)
    type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
    type PublicItem = { name: string; unit: string; quantity: number; unitPrice: number };
    type PublicMilestone = { id?: string; label: string; date: string | null; percent: number };
    type PublicQuotation = {
      id: string; number: string; project_name: string;
      start_date: string | null; end_date: string | null;
      items: PublicItem[]; milestones: PublicMilestone[];
      payment_terms: string; notes: string; status: string;
      invoice_number: string | null; receipt_number: string | null;
      revisions_count: number; deposit_percent: number;
      vat_enabled: boolean; vat_rate: number; wht_enabled: boolean; wht_rate: number;
      totals: ReturnType<typeof computePublicTotals>;
    };
    let quotation: PublicQuotation | null = null;
    if (jobRow.quotation_id) {
      const { data: q } = await supabaseAdmin
        .from("quotations")
        .select("id, number, project_name, start_date, end_date, items, addons, difficulties, hidden_cost, discount_value, discount_kind, vat_enabled, vat_rate, wht_enabled, wht_rate, deposit_preset, payment_terms, notes, status, milestones, invoice_number, receipt_number, revisions_count")
        .eq("id", jobRow.quotation_id)
        .maybeSingle();
      if (q) {
        const totals = computePublicTotals(q as never);
        quotation = {
          id: q.id,
          number: q.number,
          project_name: q.project_name,
          start_date: q.start_date,
          end_date: q.end_date,
          items: (Array.isArray(q.items) ? q.items : []) as PublicItem[],
          milestones: (Array.isArray(q.milestones) ? q.milestones : []) as PublicMilestone[],
          payment_terms: q.payment_terms ?? "",
          notes: q.notes ?? "",
          status: q.status,
          invoice_number: q.invoice_number,
          receipt_number: q.receipt_number,
          revisions_count: q.revisions_count ?? 0,
          deposit_percent: q.deposit_preset ?? 0,
          vat_enabled: !!q.vat_enabled,
          vat_rate: q.vat_rate ?? 0,
          wht_enabled: !!q.wht_enabled,
          wht_rate: q.wht_rate ?? 0,
          totals,
        };
      }
    }

    // Whitelisted brief summary
    type PublicBrief = {
      id: string; title: string;
      project_overview: Record<string, Json>;
      audience: Record<string, Json>;
      design_direction: Record<string, Json>;
      tech_specs: Record<string, Json>;
      timeline_budget: Record<string, Json>;
      notes: string;
      references: Array<Record<string, Json>>;
    };
    let brief: PublicBrief | null = null;
    if (jobRow.brief_id) {
      const { data: b } = await supabaseAdmin
        .from("design_briefs")
        .select("id, title, project_overview, audience, design_direction, tech_specs, timeline_budget, notes, references")
        .eq("id", jobRow.brief_id)
        .maybeSingle();
      if (b) {
        brief = {
          id: b.id,
          title: b.title,
          project_overview: (b.project_overview ?? {}) as Record<string, Json>,
          audience: (b.audience ?? {}) as Record<string, Json>,
          design_direction: (b.design_direction ?? {}) as Record<string, Json>,
          tech_specs: (b.tech_specs ?? {}) as Record<string, Json>,
          timeline_budget: (b.timeline_budget ?? {}) as Record<string, Json>,
          notes: b.notes ?? "",
          references: (Array.isArray(b.references) ? b.references : []) as Array<Record<string, Json>>,
        };
      }
    }

    return { job, events: events ?? [], slips: slips ?? [], quotation, brief };
  });

const SlipUploadSchema = z.object({
  token: z.string().uuid(),
  slip_url: z.string().url().max(2048),
  note: z.string().max(500).optional().default(""),
});

export const submitTrackingSlip = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SlipUploadSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: job, error: jErr } = await supabaseAdmin
      .from("job_trackers")
      .select("id, user_id, title, client_name, deposit_paid, final_paid, total_amount, deposit_percent, share_token")
      .eq("share_token", data.token)
      .maybeSingle();
    if (jErr) throw new Error(jErr.message);
    if (!job) throw new Error("Invalid tracking token");

    const { error } = await supabaseAdmin
      .from("job_slips")
      .insert({ job_id: job.id, slip_url: data.slip_url, note: data.note ?? "" });
    if (error) throw new Error(error.message);

    if (job.user_id) {
      const paymentType = !job.deposit_paid ? "deposit" : !job.final_paid ? "final" : "partial";
      const depositAmt = job.total_amount
        ? Math.round(job.total_amount * ((job.deposit_percent ?? 50) / 100))
        : null;
      const amountLabel =
        paymentType === "deposit" && depositAmt != null
          ? `฿${depositAmt.toLocaleString("th-TH")}`
          : job.total_amount
            ? `฿${Math.round(job.total_amount).toLocaleString("th-TH")}`
            : undefined;

      const recipientName = await getFreelancerDisplayName(job.user_id);
      void notifyFreelancer({
        userId: job.user_id,
        templateName: "deposit-received",
        templateData: {
          recipientName,
          clientName: job.client_name ?? "ลูกค้า",
          projectName: job.title ?? "โปรเจกต์",
          paymentType,
          amount: amountLabel,
          note: data.note?.trim() || undefined,
          actionUrl: canonicalUrl("/dashboard?tab=projects"),
        },
        idempotencyKey: `slip-${job.id}-${Date.now().toString(36)}`,
      });
    }

    return { ok: true };
  });

const SlipDeleteSchema = z.object({
  token: z.string().uuid(),
  slip_id: z.string().uuid(),
});

export const deleteTrackingSlip = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SlipDeleteSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: job, error: jErr } = await supabaseAdmin
      .from("job_trackers")
      .select("id")
      .eq("share_token", data.token)
      .maybeSingle();
    if (jErr) throw new Error(jErr.message);
    if (!job) throw new Error("Invalid tracking token");

    // Only allow deletion when slip is still pending (not verified, not rejected)
    const { error } = await supabaseAdmin
      .from("job_slips")
      .delete()
      .eq("id", data.slip_id)
      .eq("job_id", job.id)
      .eq("verified", false)
      .eq("rejected", false);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const SlipReplaceSchema = z.object({
  token: z.string().uuid(),
  slip_id: z.string().uuid(),
  slip_url: z.string().url().max(2048),
});

export const replaceTrackingSlip = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SlipReplaceSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: job, error: jErr } = await supabaseAdmin
      .from("job_trackers")
      .select("id")
      .eq("share_token", data.token)
      .maybeSingle();
    if (jErr) throw new Error(jErr.message);
    if (!job) throw new Error("Invalid tracking token");

    const { error } = await supabaseAdmin
      .from("job_slips")
      .update({ slip_url: data.slip_url, uploaded_at: new Date().toISOString() })
      .eq("id", data.slip_id)
      .eq("job_id", job.id)
      .eq("verified", false)
      .eq("rejected", false);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

