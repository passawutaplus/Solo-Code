import * as React from "react";
import type { Quotation } from "@/store/quotations";
import { computeTotals, formatBaht } from "@/store/quotations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Plus, Trash2, Pencil, Receipt, Tag, Sparkles } from "lucide-react";
import { PriceGuideModal } from "@/components/price-guide/PriceGuideModal";

interface Props {
  q: Quotation;
  patch: (p: Partial<Quotation>) => void;
}

export function ServicesPanel({ q, patch }: Props) {
  // คำนวณยอดใหม่เฉพาะตอนข้อมูลที่เกี่ยวข้องเปลี่ยน — ไม่ต้องคำนวณซ้ำทุก render
  const totals = React.useMemo(() => computeTotals(q), [q]);
  const [draft, setDraft] = React.useState({ name: "", description: "", unitPrice: 0, quantity: 1 });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [priceGuideTarget, setPriceGuideTarget] = React.useState<"draft" | string | null>(null);

  function addItem() {
    if (!draft.name.trim()) return;
    patch({
      items: [
        ...q.items,
        { id: Math.random().toString(36).slice(2, 10), ...draft, name: draft.name.trim() },
      ],
    });
    setDraft({ name: "", description: "", unitPrice: 0, quantity: 1 });
  }

  function updateItem(id: string, patchItem: Partial<Quotation["items"][number]>) {
    patch({ items: q.items.map((it) => (it.id === id ? { ...it, ...patchItem } : it)) });
  }

  function removeItem(id: string) {
    patch({ items: q.items.filter((it) => it.id !== id) });
  }

  return (
    <div className="space-y-3 text-sm">
      {/* Add new */}
      <Section icon={<PlusCircle className="h-3.5 w-3.5" />} title="เพิ่มชิ้นงานที่ต้องทำ">
        <Input
          placeholder="ชื่อชิ้นงานที่ต้องทำ"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          maxLength={80}
        />
        <Textarea
          placeholder="รายละเอียด (ไม่บังคับ)"
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          maxLength={300}
          rows={2}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-muted-foreground">ราคา/หน่วย</p>
              <button
                type="button"
                onClick={() => setPriceGuideTarget("draft")}
                className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
              >
                <Sparkles className="h-2.5 w-2.5" /> AI ช่วยตั้งราคา
              </button>
            </div>
            <Input
              type="number"
              value={draft.unitPrice || ""}
              onChange={(e) => setDraft((d) => ({ ...d, unitPrice: Number(e.target.value) || 0 }))}
              className="num"
              placeholder="0"
            />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-1">จำนวน</p>
            <Input
              type="number"
              value={draft.quantity || ""}
              onChange={(e) => setDraft((d) => ({ ...d, quantity: Number(e.target.value) || 0 }))}
              className="num"
              placeholder="1"
            />
          </div>
        </div>
        <Button onClick={addItem} className="w-full bg-primary hover:bg-primary/90 gap-1.5">
          <Plus className="h-4 w-4" /> เพิ่ม
        </Button>
      </Section>

      <PriceGuideModal
        open={priceGuideTarget !== null}
        onOpenChange={(o) => !o && setPriceGuideTarget(null)}
        initialQuantity={
          priceGuideTarget === "draft"
            ? Math.max(1, draft.quantity || 1)
            : priceGuideTarget
              ? Math.max(1, q.items.find((it) => it.id === priceGuideTarget)?.quantity || 1)
              : 1
        }
        onApplyPrice={(price) => {
          if (priceGuideTarget === "draft") {
            setDraft((d) => ({ ...d, unitPrice: price }));
          } else if (priceGuideTarget) {
            updateItem(priceGuideTarget, { unitPrice: price });
          }
          setPriceGuideTarget(null);
        }}
      />

      {/* Items list */}
      <Section icon={<Tag className="h-3.5 w-3.5" />} title={`รวมชิ้นงานที่ต้องทำ (${q.items.length})`}>
        {q.items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">ยังไม่มีชิ้นงาน</p>
        ) : (
          q.items.map((it) => {
            const subtotal = (it.unitPrice || 0) * (it.quantity || 0);
            const isEditing = editingId === it.id;
            return (
              <div key={it.id} className="rounded-xl border border-border/60 p-2.5 space-y-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input value={it.name} onChange={(e) => updateItem(it.id, { name: e.target.value })} className="h-8 text-xs" />
                    <Textarea value={it.description ?? ""} onChange={(e) => updateItem(it.id, { description: e.target.value })} rows={2} className="text-xs" />
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="space-y-1">
                        <Input type="number" value={it.unitPrice} onChange={(e) => updateItem(it.id, { unitPrice: Number(e.target.value) || 0 })} className="h-8 text-xs num" />
                        <button
                          type="button"
                          onClick={() => setPriceGuideTarget(it.id)}
                          className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          <Sparkles className="h-2.5 w-2.5" /> AI ตั้งราคา
                        </button>
                      </div>
                      <Input type="number" value={it.quantity} onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) || 0 })} className="h-8 text-xs num" />
                    </div>
                    <Button size="sm" className="w-full h-7 text-xs" onClick={() => setEditingId(null)}>เสร็จ</Button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-sm">{it.name}</p>
                    {it.description && <p className="text-[11px] text-muted-foreground">{it.description}</p>}
                    <p className="text-xs num">
                      ฿{formatBaht(it.unitPrice)} × {it.quantity} = <span className="font-semibold">฿{formatBaht(subtotal)}</span>
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <button onClick={() => setEditingId(it.id)} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> แก้ไข
                      </button>
                      <button onClick={() => removeItem(it.id)} className="text-destructive inline-flex items-center gap-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </Section>

      {/* Summary */}
      <Section icon={<Receipt className="h-3.5 w-3.5" />} title="สรุปยอด">
        <Row label="ยอดรวมก่อนภาษี" value={`฿${formatBaht(totals.preTaxBeforeDiscount)}`} bold />
        <div className="flex items-center gap-2">
          <Checkbox checked={q.vatEnabled} onCheckedChange={(v) => patch({ vatEnabled: !!v })} />
          <span className="text-xs flex-1">VAT {q.vatRate}%</span>
          <span className="text-xs num">฿{formatBaht(totals.vatAmount)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox checked={q.whtEnabled} onCheckedChange={(v) => patch({ whtEnabled: !!v })} />
          <span className="text-xs flex-1">หัก ณ ที่จ่าย {q.whtRate}%</span>
          <span className="text-xs num text-destructive">−฿{formatBaht(totals.withholdingAmount)}</span>
        </div>

        <div className="space-y-1 pt-1 border-t border-border/40">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Tag className="h-3 w-3" /> ส่วนลด</p>
          <div className="flex gap-1.5">
            <Input
              type="number"
              value={q.discountValue || ""}
              onChange={(e) => patch({ discountValue: Number(e.target.value) || 0 })}
              className="h-8 text-xs num flex-1"
              placeholder="0"
            />
            <Select value={q.discountKind} onValueChange={(v) => patch({ discountKind: v as "percent" | "amount" })}>
              <SelectTrigger className="h-8 w-[60px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">%</SelectItem>
                <SelectItem value="amount">฿</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {totals.discountAmount > 0 && (
            <p className="text-[11px] text-right num text-destructive">−฿{formatBaht(totals.discountAmount)}</p>
          )}
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <span className="text-sm font-semibold">ยอดรวมสุทธิ</span>
          <span className="num text-lg font-bold text-primary">฿{formatBaht(totals.grandTotal)}</span>
        </div>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="px-3 py-2 bg-muted/30 border-b border-border/40">
        <h3 className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
          <span className="text-primary">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="px-3 py-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`num ${bold ? "font-semibold text-sm" : ""}`}>{value}</span>
    </div>
  );
}
