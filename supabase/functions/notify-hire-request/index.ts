import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { enqueueLineNotification } from "../_shared/line-enqueue.ts";
import { corsHeadersForRequest } from "../_shared/cors.ts";

const BodySchema = z.object({
  request_id: z.string().uuid(),
});

const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersForRequest(req), "Content-Type": "application/json" },
  });

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeadersForRequest(req) });
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json(req, { error: "unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.slice("Bearer ".length);
  const { data: claims, error: authErr } = await userClient.auth.getClaims(token);
  if (authErr || !claims?.claims?.sub) return json(req, { error: "unauthorized" }, 401);
  const callerId = claims.claims.sub as string;

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return json(req, { error: "invalid_body" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: hire, error: hireErr } = await admin
    .from("hiring_requests")
    .select("id, freelancer_id, client_id, project_title, client_name, message, deadline, budget_amount")
    .eq("id", body.request_id)
    .maybeSingle();

  if (hireErr || !hire) return json(req, { error: "not_found" }, 404);
  if (hire.client_id !== callerId) return json(req, { error: "forbidden" }, 403);

  const { data: freelancerAuth } = await admin.auth.admin.getUserById(hire.freelancer_id);
  const freelancerEmail = freelancerAuth?.user?.email;
  if (!freelancerEmail) return json(req, { skipped: true, reason: "no_freelancer_email" });

  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, notify_hire, notify_email")
    .eq("user_id", hire.freelancer_id)
    .maybeSingle();

  if (profile?.notify_email === false || profile?.notify_hire === false) {
    return json(req, { skipped: true, reason: "notifications_disabled" });
  }

  const recipientName = escapeHtml(profile?.display_name || "คุณ");
  const projectName = escapeHtml(hire.project_title || "งานจ้างใหม่");
  const clientName = escapeHtml(hire.client_name ?? "ลูกค้า");
  const messageId = crypto.randomUUID();
  const idempotencyKey = `hire-request-${hire.id}`;

  const { data: existing } = await admin
    .from("email_send_log")
    .select("id")
    .eq("message_id", idempotencyKey)
    .maybeSingle();
  if (existing) return json(req, { ok: true, duplicate: true });

  const budgetLine = hire.budget_amount
    ? `งบประมาณ: ฿${Number(hire.budget_amount).toLocaleString("th-TH")}`
    : "";
  const deadlineLine = hire.deadline ? `กำหนดส่ง: ${hire.deadline}` : "";
  const detailRaw = [hire.message, budgetLine, deadlineLine].filter(Boolean).join("\n");
  const detailText = detailRaw;
  const detailHtml = escapeHtml(detailRaw);

  const subject = `[Anthem] มีคำขอจ้างงานใหม่ — ${hire.project_title || "งานจ้างใหม่"}`;
  const text = `สวัสดี ${profile?.display_name || "คุณ"}\n\nมีลูกค้า ${hire.client_name} ส่งคำขอจ้างงาน "${hire.project_title || "งานจ้างใหม่"}" ผ่าน Anthem\n\n${detailText}\n\nเปิดดู: https://solofreelancer.com/dashboard`;
  const html = `<p>สวัสดี ${recipientName}</p><p>มีลูกค้า <strong>${clientName}</strong> ส่งคำขอจ้างงาน <strong>${projectName}</strong> ผ่าน Anthem</p><pre style="white-space:pre-wrap;font-family:inherit">${detailHtml}</pre><p><a href="https://solofreelancer.com/dashboard">เปิด So1o My Desk</a></p>`;

  await admin.from("email_send_log").insert({
    message_id: messageId,
    template_name: "anthem-hire-request",
    recipient_email: freelancerEmail.toLowerCase(),
    status: "pending",
  });

  const { error: queueErr } = await admin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: freelancerEmail,
      from: "So1o Freelancer <noreply@solofreelancer.com>",
      sender_domain: "notify.solofreelancer.com",
      subject,
      html,
      text,
      purpose: "transactional",
      label: "anthem-hire-request",
      idempotency_key: idempotencyKey,
      queued_at: new Date().toISOString(),
    },
  });

  if (queueErr) {
    console.error("[notify-hire-request] enqueue failed", queueErr.message);
    return json(req, { error: "enqueue_failed" }, 500);
  }

  const lineResult = await enqueueLineNotification({
    userId: hire.freelancer_id,
    kind: "anthem_hire",
    body: `${hire.client_name} ส่งคำขอจ้าง — ${hire.project_title || "งานจ้างใหม่"}\n${detailText.slice(0, 200)}`,
    idempotencyKey: `line-hire-${hire.id}`,
  });

  return json(req, { ok: true, line: lineResult });
});
