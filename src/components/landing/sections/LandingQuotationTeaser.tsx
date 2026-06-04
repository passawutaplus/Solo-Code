import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LineItem = { id: string; name: string; qty: number; unitPrice: number };

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `l_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function newLine(): LineItem {
  return { id: newId(), name: "", qty: 1, unitPrice: 0 };
}

function computeDemoTotals(items: LineItem[], vatEnabled: boolean, whtEnabled: boolean) {
  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const vatRate = 7;
  const whtRate = 3;
  const vatAmount = vatEnabled ? subtotal * (vatRate / 100) : 0;
  const beforeWht = subtotal + vatAmount;
  const whtAmount = whtEnabled ? beforeWht * (whtRate / 100) : 0;
  const grandTotal = beforeWht - whtAmount;
  return { subtotal, vatAmount, whtAmount, grandTotal, vatRate, whtRate };
}

interface Props {
  user: { id: string } | null;
}

export function LandingQuotationTeaser({ user }: Props) {
  const [projectName, setProjectName] = React.useState("โปรเจกต์ออกแบบแบรนด์");
  const [clientName, setClientName] = React.useState("ลูกค้าตัวอย่าง");
  const [category, setCategory] = React.useState("Branding");
  const [items, setItems] = React.useState<LineItem[]>([
    { id: "1", name: "โลโก้ + CI เบื้องต้น", qty: 1, unitPrice: 45000 },
    { id: "2", name: "Social template 5 ชิ้น", qty: 1, unitPrice: 15000 },
  ]);
  const [vatEnabled, setVatEnabled] = React.useState(true);
  const [whtEnabled, setWhtEnabled] = React.useState(true);

  const totals = computeDemoTotals(items, vatEnabled, whtEnabled);

  const ctaTo = user ? "/dashboard" : "/apply";
  const ctaSearch = user ? { tab: "finance", sub: "quotations" } : undefined;
  const ctaLabel = user ? "สร้างใบเสนอราคาในแดชบอร์ด" : "สมัครฟรี — สร้างใบเสนอราคาจริง";

  return (
    <section id="quotation-demo" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
          <FileText className="h-3.5 w-3.5" /> ลองประเมินราคา
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
          ใบเสนอราคาพร้อม VAT & หัก ณ ที่จ่าย
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          ทดลองกรอกรายการด้านล่าง — สร้างเอกสารจริงและส่ง PDF ได้หลังเข้าใช้งาน
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">ชื่อโปรเจกต์</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">ชื่อลูกค้า</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} className="h-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">หมวดหมู่</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} className="h-10" />
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs border-collapse min-w-[480px]">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-2 font-semibold">รายการ</th>
                  <th className="py-2 px-2 w-16 font-semibold text-center">จำนวน</th>
                  <th className="py-2 px-2 w-28 font-semibold text-right">ราคา/หน่วย</th>
                  <th className="py-2 pl-2 w-24 font-semibold text-right">รวม</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-border/60">
                    <td className="py-2 pr-2">
                      <Input
                        value={it.name}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) => (x.id === it.id ? { ...x, name: e.target.value } : x)),
                          )
                        }
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === it.id ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x,
                            ),
                          )
                        }
                        className="h-8 text-xs text-center"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="number"
                        min={0}
                        value={it.unitPrice || ""}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === it.id ? { ...x, unitPrice: Number(e.target.value) || 0 } : x,
                            ),
                          )
                        }
                        className="h-8 text-xs text-right"
                      />
                    </td>
                    <td className="py-2 pl-2 text-right font-mono tabular-nums">
                      ฿{(it.qty * it.unitPrice).toLocaleString("th-TH")}
                    </td>
                    <td className="py-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={items.length <= 1}
                        onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                        aria-label="ลบรายการ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {items.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setItems((prev) => [...prev, newLine()])}
            >
              <Plus className="h-3.5 w-3.5" /> เพิ่มรายการ
            </Button>
          )}

          <div className="flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={vatEnabled}
                onChange={(e) => setVatEnabled(e.target.checked)}
                className="rounded border-border"
              />
              VAT 7%
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={whtEnabled}
                onChange={(e) => setWhtEnabled(e.target.checked)}
                className="rounded border-border"
              />
              หัก ณ ที่จ่าย 3%
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary text-primary-foreground p-6 shadow-elevated">
            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-90">ยอดสุทธิ</div>
            <div className="mt-1 text-4xl sm:text-5xl font-bold tabular-nums tracking-tight">
              ฿{totals.grandTotal.toLocaleString("th-TH")}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/15 px-3 py-2">
                <div className="text-[10px] opacity-80">VAT {totals.vatRate}%</div>
                <div className="text-sm font-bold tabular-nums">
                  ฿{totals.vatAmount.toLocaleString("th-TH")}
                </div>
              </div>
              <div className="rounded-xl bg-white/15 px-3 py-2">
                <div className="text-[10px] opacity-80">WHT {totals.whtRate}%</div>
                <div className="text-sm font-bold tabular-nums">
                  −฿{totals.whtAmount.toLocaleString("th-TH")}
                </div>
              </div>
            </div>
            <ul className="mt-4 space-y-1 text-xs opacity-95">
              <li className="flex justify-between">
                <span>รวมรายการ</span>
                <span className="font-mono">฿{totals.subtotal.toLocaleString("th-TH")}</span>
              </li>
              {vatEnabled && (
                <li className="flex justify-between">
                  <span>VAT</span>
                  <span className="font-mono">+฿{totals.vatAmount.toLocaleString("th-TH")}</span>
                </li>
              )}
              {whtEnabled && (
                <li className="flex justify-between">
                  <span>หัก ณ ที่จ่าย</span>
                  <span className="font-mono">−฿{totals.whtAmount.toLocaleString("th-TH")}</span>
                </li>
              )}
            </ul>
          </div>

          <Link
            to={ctaTo}
            search={ctaSearch as any}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-5 py-3.5 text-sm font-bold shadow-elevated hover:opacity-90 transition-opacity"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-center text-[10px] text-muted-foreground">
            บันทึก PDF · แบรนด์ของคุณ · ส่งลิงก์ให้ลูกค้า — ในแดชบอร์ดหลังสมัคร
          </p>
        </div>
      </div>
    </section>
  );
}
