import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  UserPlus, Phone, Mail, MapPin, MessageCircle, Hash,
  Briefcase, Building2, User as UserIcon, Wallet, Tag, Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { SavedClient } from "@/store/clients";
import { Field, SectionTitle } from "./shared";
import { PhoneInput } from "@/components/ui/phone-input";

type Draft = Omit<SavedClient, "id" | "createdAt">;

const EMPTY_DRAFT: Draft = {
  name: "",
  type: "individual",
  industry: "",
  phone: "",
  lineId: "",
  email: "",
  social: "",
  preferredChannel: "line",
  address: "",
  taxId: "",
  paymentTerms: "50/50",
  rate: undefined,
  notes: "",
  tags: [],
};

export function ClientFormDialog({
  editing, onClose, onCreate, onUpdate,
}: {
  editing: SavedClient | "new" | null;
  onClose: () => void;
  onCreate: (payload: Draft) => void;
  onUpdate: (id: string, payload: Partial<SavedClient>) => void;
}) {
  const isEditing = editing && editing !== "new";
  const open = !!editing;

  const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);
  const [tagInput, setTagInput] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    if (editing === "new") setDraft(EMPTY_DRAFT);
    else if (editing) {
      const { id: _id, createdAt: _c, ...rest } = editing;
      setDraft({ ...EMPTY_DRAFT, ...rest });
    }
    setTagInput("");
    setTouched(false);
  }, [editing]);

  const upd = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || draft.tags?.includes(t)) return;
    upd("tags", [...(draft.tags ?? []), t]);
    setTagInput("");
  };

  const nameError = touched && !draft.name.trim() ? "กรุณากรอกชื่อลูกค้า" : "";
  const emailError =
    touched && draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)
      ? "รูปแบบอีเมลไม่ถูกต้อง"
      : "";

  const submit = () => {
    setTouched(true);
    if (!draft.name.trim()) {
      toast.error("กรุณากรอกชื่อลูกค้า");
      return;
    }
    if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) {
      toast.error("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    if (isEditing) onUpdate((editing as SavedClient).id, draft);
    else onCreate(draft);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            {isEditing ? "แก้ไขลูกค้า" : "เพิ่มลูกค้าใหม่"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-3">
            <SectionTitle>ข้อมูลพื้นฐาน</SectionTitle>

            <div className="grid grid-cols-2 gap-2">
              {(["individual", "company"] as const).map((t) => {
                const Icon = t === "company" ? Building2 : UserIcon;
                const active = draft.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => upd("type", t)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                      active ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-border/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t === "individual" ? "บุคคลธรรมดา" : "นิติบุคคล / บริษัท"}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="ชื่อ / ชื่อบริษัท *" icon={UserIcon}>
                <Input
                  value={draft.name}
                  onChange={(e) => upd("name", e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder={draft.type === "company" ? "บริษัท นิมบัส จำกัด" : "คุณสมชาย ใจดี"}
                  aria-invalid={!!nameError}
                  className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {nameError && (
                  <p className="text-[11px] text-destructive mt-1">{nameError}</p>
                )}
              </Field>
              <Field label="ประเภทธุรกิจ / สายงาน" icon={Briefcase}>
                <Input
                  value={draft.industry ?? ""}
                  onChange={(e) => upd("industry", e.target.value)}
                  placeholder="คาเฟ่, สตาร์ทอัป, อีคอมเมิร์ซ..."
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle>ช่องทางติดต่อ</SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="เบอร์โทร" icon={Phone}>
                <PhoneInput
                  value={draft.phone ?? ""}
                  onChange={(v) => upd("phone", v)}
                  placeholder="08x-xxx-xxxx"
                />
              </Field>
              <Field label="LINE ID" icon={MessageCircle}>
                <Input value={draft.lineId ?? ""} onChange={(e) => upd("lineId", e.target.value)} placeholder="@nimbus.co" />
              </Field>
              <Field label="อีเมล" icon={Mail}>
                <Input
                  type="email"
                  value={draft.email ?? ""}
                  onChange={(e) => upd("email", e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="hello@brand.com"
                  aria-invalid={!!emailError}
                  className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {emailError && (
                  <p className="text-[11px] text-destructive mt-1">{emailError}</p>
                )}
              </Field>
              <Field label="Social (IG / FB / X)" icon={Hash}>
                <Input value={draft.social ?? ""} onChange={(e) => upd("social", e.target.value)} placeholder="@brand หรือ URL" />
              </Field>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">ช่องทางติดต่อหลัก (ใช้ส่งใบเสนอราคา/ใบแจ้งหนี้)</label>
              <div className="grid grid-cols-4 gap-2">
                {(["line", "phone", "email", "social"] as const).map((ch) => {
                  const Icon = ch === "line" ? MessageCircle : ch === "phone" ? Phone : ch === "email" ? Mail : Hash;
                  const active = draft.preferredChannel === ch;
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => upd("preferredChannel", ch)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[11px] font-semibold transition-all ${
                        active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {ch.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle>ข้อมูลออกใบเสร็จ (ไม่บังคับ)</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="เลขผู้เสียภาษี" icon={Hash}>
                <Input value={draft.taxId ?? ""} onChange={(e) => upd("taxId", e.target.value)} placeholder="0-1055-12345-67-8" />
              </Field>
              <Field label="งบประมาณทั่วไป (บาท)" icon={Wallet}>
                <Input
                  type="number"
                  value={draft.rate ?? ""}
                  onChange={(e) => upd("rate", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="20000"
                />
              </Field>
            </div>
            <Field label="ที่อยู่ออกใบกำกับ" icon={MapPin}>
              <Textarea rows={2} value={draft.address ?? ""} onChange={(e) => upd("address", e.target.value)} placeholder="123/45 ถ.พระราม 9 เขตห้วยขวาง กรุงเทพฯ 10310" />
            </Field>
            <Field label="เงื่อนไขชำระเงิน" icon={Wallet}>
              <div className="flex gap-1.5 flex-wrap">
                {["100%", "50/50", "30/70", "Net 7", "Net 15", "Net 30"].map((t) => {
                  const active = draft.paymentTerms === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => upd("paymentTerms", t)}
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
                        active ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:border-primary"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </Field>
          </section>

          <section className="space-y-3">
            <SectionTitle>โน้ตและแท็ก (สำหรับฟรีแลนซ์)</SectionTitle>
            <Field label="แท็ก (เช่น VIP, จ่ายตรง, แก้น้อย)" icon={Tag}>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="พิมพ์แล้วกด Enter"
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {draft.tags && draft.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {draft.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      #{t}
                      <button
                        type="button"
                        onClick={() => upd("tags", draft.tags?.filter((x) => x !== t) ?? [])}
                        aria-label={`ลบ ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <Field label="โน้ตส่วนตัว (เห็นเฉพาะคุณ)">
              <Textarea
                rows={3}
                value={draft.notes ?? ""}
                onChange={(e) => upd("notes", e.target.value)}
                placeholder="ชอบโทนสีอ่อน ตอบ LINE เร็ว ห้ามโทรหลัง 6 โมงเย็น..."
              />
            </Field>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button onClick={submit} className="bg-gradient-primary text-primary-foreground">
            {isEditing ? "บันทึกการแก้ไข" : "เพิ่มลูกค้า"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
