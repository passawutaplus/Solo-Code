import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { geminiChat, defaultFastModel } from "@/lib/geminiServer";

const InputSchema = z.object({
  question: z.string().min(1).max(500),
});

const SYSTEM_PROMPT = `คุณคือที่ปรึกษาธุรกิจสำหรับฟรีแลนซ์ไทย ตอบจากข้อมูลจริงที่ให้มาเท่านั้น
- ใช้ภาษาไทย กระชับ เป็นมิตร
- ถ้าข้อมูลไม่พอ บอกตรงๆ ว่าขาดอะไร
- ตอบคำถามเช่น ลูกค้าที่ทำรายได้สูงสุด, ลูกค้าที่ควรทวงเงินก่อน, ยอดค้างชำระ
- อ้างอิงชื่อลูกค้าและตัวเลขจากข้อมูล ห้ามมั่ว`;

export const aiBusinessInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    const [clientsRes, quotationsRes, incomesRes] = await Promise.all([
      context.supabase.from("saved_clients").select("id,name,payment_terms,created_at").eq("user_id", userId),
      context.supabase
        .from("quotations")
        .select(
          "id,number,project_name,client_name,status,due_date,paid_partial,items,addons,difficulties,hidden_cost,discount_value,discount_kind,vat_enabled,vat_rate,wht_enabled,wht_rate,deposit_preset,payment_terms,hourly_days,hourly_hours",
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(80),
      context.supabase
        .from("finance_incomes")
        .select("id,net,gross,source,source_quotation_id,receive_date,category")
        .eq("user_id", userId)
        .order("receive_date", { ascending: false })
        .limit(120),
    ]);

    if (clientsRes.error) throw new Error(clientsRes.error.message);
    if (quotationsRes.error) throw new Error(quotationsRes.error.message);
    if (incomesRes.error) throw new Error(incomesRes.error.message);

    const today = new Date().toISOString().slice(0, 10);

    const revenueByClient = new Map<string, number>();
    for (const inc of incomesRes.data ?? []) {
      const name = (inc.source || "ไม่ระบุ").trim();
      revenueByClient.set(name, (revenueByClient.get(name) ?? 0) + Number(inc.net || inc.gross || 0));
    }

    const topClients = [...revenueByClient.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({ name, total_revenue: total }));

    const overdueQuotations = (quotationsRes.data ?? [])
      .filter((q) => {
        const status = q.status as string;
        if (!["pending_payment", "pending_receipt"].includes(status)) return false;
        if (!q.due_date) return false;
        return q.due_date < today;
      })
      .map((q) => ({
        number: q.number,
        client_name: q.client_name,
        due_date: q.due_date,
        status: q.status,
        paid_partial: Number(q.paid_partial || 0),
      }))
      .slice(0, 15);

    const pendingByDue = (quotationsRes.data ?? [])
      .filter((q) => ["pending_payment", "pending_receipt", "pending_approval"].includes(q.status as string))
      .map((q) => ({
        number: q.number,
        client_name: q.client_name,
        status: q.status,
        due_date: q.due_date ?? null,
        project_name: q.project_name,
      }))
      .sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      })
      .slice(0, 15);

    const snapshot = {
      generated_at: new Date().toISOString(),
      client_count: clientsRes.data?.length ?? 0,
      top_clients_by_revenue: topClients,
      overdue_invoices: overdueQuotations,
      upcoming_by_due_date: pendingByDue,
      recent_income_count: incomesRes.data?.length ?? 0,
    };

    const { text: answer } = await geminiChat({
      model: defaultFastModel(),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `ข้อมูลธุรกิจ (JSON):\n${JSON.stringify(snapshot, null, 2)}\n\nคำถามจากผู้ใช้:\n${data.question}`,
        },
      ],
    });

    return { answer, snapshot };
  });
