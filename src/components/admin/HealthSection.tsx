import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Database, FileText, Wallet, Users, Layers } from "lucide-react";
import { type AdminMetrics } from "./useAdminMetrics";

interface ActivityEvent {
  id: string;
  type: "signup" | "quotation" | "income" | "expense" | "subscription";
  ts: Date;
  title: string;
  sub: string;
}

const TYPE_META: Record<ActivityEvent["type"], { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  signup: { color: "bg-emerald-500", icon: Users },
  quotation: { color: "bg-blue-500", icon: FileText },
  income: { color: "bg-amber-500", icon: Wallet },
  expense: { color: "bg-rose-500", icon: Layers },
  subscription: { color: "bg-cyan-500", icon: Database },
};

export function HealthSection({ m }: { m: AdminMetrics }) {
  const tables = [
    { name: "profiles", count: m.profiles.length, ok: true },
    { name: "user_roles (admin)", count: m.adminIds.size, ok: m.adminIds.size > 0 },
    { name: "quotations", count: m.quotations.length, ok: true },
    { name: "finance_incomes", count: m.incomes.length, ok: true },
    { name: "finance_expenses", count: m.expenses.length, ok: true },
    { name: "finance_subscriptions", count: m.subscriptions.length, ok: true },
    { name: "saved_clients", count: m.savedClients.length, ok: true },
  ];

  const activity = React.useMemo<ActivityEvent[]>(() => {
    const all: ActivityEvent[] = [];
    const userMap = new Map(m.profiles.map((p) => [p.user_id, p.brand_name || p.display_name || p.email || "ไม่ทราบ"]));
    const who = (uid: string) => userMap.get(uid) ?? "ไม่ทราบ";

    m.profiles.slice(0, 30).forEach((p) =>
      all.push({
        id: `signup-${p.id}`,
        type: "signup",
        ts: new Date(p.created_at),
        title: `สมาชิกใหม่: ${p.email ?? "—"}`,
        sub: p.brand_name || p.display_name || "ยังไม่ตั้งชื่อ",
      }),
    );
    m.quotations.slice(0, 30).forEach((q) =>
      all.push({
        id: `q-${q.id}`,
        type: "quotation",
        ts: new Date(q.created_at),
        title: `ใบเสนอ ${q.number} → ${q.client_name || "—"}`,
        sub: `${who(q.user_id)} · ${q.status}`,
      }),
    );
    m.incomes.slice(0, 30).forEach((i) =>
      all.push({
        id: `i-${i.id}`,
        type: "income",
        ts: new Date(i.created_at),
        title: `รับเงิน ฿${Math.round(Number(i.gross || 0)).toLocaleString()}`,
        sub: `${who(i.user_id)} · ${i.source || i.category}`,
      }),
    );
    m.expenses.slice(0, 20).forEach((e) =>
      all.push({
        id: `e-${e.id}`,
        type: "expense",
        ts: new Date(e.created_at),
        title: `จ่าย ฿${Math.round(Number(e.amount || 0)).toLocaleString()} · ${e.label}`,
        sub: `${who(e.user_id)} · ${e.category ?? "ไม่ระบุหมวด"}`,
      }),
    );
    m.subscriptions.slice(0, 20).forEach((s) =>
      all.push({
        id: `s-${s.id}`,
        type: "subscription",
        ts: new Date(s.created_at),
        title: `เพิ่ม sub: ${s.name} (฿${Number(s.price).toLocaleString()})`,
        sub: `${who(s.user_id)} · ${s.cycle}`,
      }),
    );

    return all.sort((a, b) => b.ts.getTime() - a.ts.getTime()).slice(0, 60);
  }, [m]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">System Health & Activity</h2>
        <p className="text-xs text-muted-foreground">
          ดูสถานะตารางฐานข้อมูล + กิจกรรมล่าสุดทั้งระบบแบบ live feed
        </p>
      </div>

      {/* Health */}
      <Card className="border-border">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            สถานะฐานข้อมูล
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tables.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border border-border bg-card/50 p-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{t.name}</p>
                  <p className="text-sm font-semibold num">{t.count.toLocaleString()}</p>
                </div>
                {t.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            * ข้อมูล query ผ่าน Lovable Cloud (Supabase) — RLS ถูกบังคับใช้กับทุก table
          </p>
        </CardContent>
      </Card>

      {/* Activity feed */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold">Activity Feed</h3>
              <p className="text-xs text-muted-foreground">รวมกิจกรรมล่าสุด {activity.length} รายการจากทุก user</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              live snapshot
            </Badge>
          </div>

          {activity.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">ยังไม่มีกิจกรรม</p>
          ) : (
            <ol className="relative border-l border-border ml-2 space-y-3">
              {activity.map((ev) => {
                const meta = TYPE_META[ev.type];
                const Icon = meta.icon;
                return (
                  <li key={ev.id} className="ml-4">
                    <span
                      className={`absolute -left-2 mt-1 h-3.5 w-3.5 rounded-full ring-2 ring-background ${meta.color} flex items-center justify-center`}
                    >
                      <Icon className="h-2 w-2 text-white" />
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <p className="text-xs font-medium leading-snug">{ev.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {ev.ts.toLocaleString("th-TH", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{ev.sub}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
