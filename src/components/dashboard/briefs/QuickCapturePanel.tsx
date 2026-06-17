import * as React from "react";
import {
  Upload,
  X,
  Sparkles,
  Loader2,
  Save,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { uploadBriefReference } from "./uploadReference";
import { ClientBrandAssetsField } from "./ClientBrandAssetsField";
import { aiBriefExtract, type AiBriefExtractResult } from "@/lib/aiBriefExtract.functions";
import {
  FORMAT_OPTIONS,
  type DesignBrief,
  type BriefClientInfo,
  type BriefReference,
  emptyBrief,
} from "@/lib/briefSchema";

type RefImage = { url: string; name: string; size: number };

type SectionKey =
  | "client"
  | "proposition"
  | "goal"
  | "deliverables"
  | "element_design"
  | "reference"
  | "style"
  | "timeline"
  | "budget"
  | "note";

const SECTIONS: { key: SectionKey; label: string; desc: string }[] = [
  { key: "client", label: "Client", desc: "ข้อมูลลูกค้า" },
  { key: "proposition", label: "Proposition", desc: "โจทย์ + pain point" },
  { key: "goal", label: "Goal", desc: "เป้าหมายของโปรเจกต์" },
  { key: "deliverables", label: "Deliverables", desc: "ชิ้นงานที่ต้องส่ง" },
  { key: "element_design", label: "Element Design", desc: "สิ่งที่ลูกค้าให้ใช้ออกแบบ" },
  { key: "reference", label: "Reference", desc: "ตัวอย่างงานอ้างอิง" },
  { key: "style", label: "Style", desc: "ชื่อสไตล์งาน" },
  { key: "timeline", label: "Timeline", desc: "วันส่งงาน" },
  { key: "budget", label: "Budget", desc: "งบประมาณ" },
  { key: "note", label: "Note", desc: "หมายเหตุสำคัญ" },
];

export function QuickCapturePanel({
  onSaved,
  onCancel,
}: {
  onSaved: (brief: DesignBrief) => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const extractFn = useServerFn(aiBriefExtract);

  const [images, setImages] = React.useState<RefImage[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [noteText, setNoteText] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<AiBriefExtractResult | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [clientAssets, setClientAssets] = React.useState<BriefClientInfo>({});
  const [pastWorksBusy, setPastWorksBusy] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const pastWorksInput = React.useRef<HTMLInputElement>(null);

  const updateAssets = (patch: Partial<BriefClientInfo>) =>
    setClientAssets((prev) => ({ ...prev, ...patch }));

  const addPastWorks = async (files: FileList | File[]) => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนอัปโหลด");
      return;
    }
    const existing = clientAssets.past_works ?? [];
    const arr = Array.from(files).slice(0, 8 - existing.length);
    if (arr.length === 0) {
      toast.error("อัปโหลดได้สูงสุด 8 รูป");
      return;
    }
    setPastWorksBusy(true);
    try {
      const uploaded: BriefReference[] = [];
      for (const f of arr) {
        try {
          const r = await uploadBriefReference({ file: f, userId: user.id });
          uploaded.push(r);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : `อัปโหลด ${f.name} ไม่สำเร็จ`);
        }
      }
      if (uploaded.length) {
        updateAssets({ past_works: [...existing, ...uploaded] });
        toast.success(`เพิ่มผลงานเก่าลูกค้า ${uploaded.length} รูป`);
      }
    } finally {
      setPastWorksBusy(false);
    }
  };

  const removePastWork = (url: string) =>
    updateAssets({ past_works: (clientAssets.past_works ?? []).filter((x) => x.url !== url) });

  const addFiles = async (files: FileList | File[]) => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนอัปโหลด");
      return;
    }
    const arr = Array.from(files).slice(0, 8 - images.length);
    if (arr.length === 0) {
      toast.error("อัปโหลดได้สูงสุด 8 รูป");
      return;
    }
    setUploading(true);
    try {
      const uploaded: RefImage[] = [];
      for (const f of arr) {
        try {
          const r = await uploadBriefReference({ file: f, userId: user.id });
          uploaded.push(r);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : `อัปโหลด ${f.name} ไม่สำเร็จ`);
        }
      }
      if (uploaded.length) {
        setImages((prev) => [...prev, ...uploaded]);
        toast.success(`เพิ่มรูป ${uploaded.length} รูป`);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => setImages((prev) => prev.filter((x) => x.url !== url));

  const extract = async () => {
    if (images.length === 0 && !noteText.trim()) {
      toast.error("โยนรูป หรือพิมพ์ข้อความก่อนนะครับ");
      return;
    }
    setBusy(true);
    try {
      const r = await extractFn({
        data: {
          imageUrls: images.map((i) => i.url),
          noteText: noteText.trim(),
        },
      });
      setResult(r);
      toast.success("AI สรุปบรีฟแล้ว — ตรวจสอบและแก้ไขได้");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("limit_reached")) {
        toast.error("เครดิต AI หมดแล้ว — เติมเครดิตหรืออัพเกรด Pro");
      } else {
        toast.error(msg || "วิเคราะห์ไม่สำเร็จ");
      }
    } finally {
      setBusy(false);
    }
  };

  const updateResult = <K extends keyof AiBriefExtractResult>(
    key: K,
    val: AiBriefExtractResult[K],
  ) => {
    setResult((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  const saveAsBrief = async () => {
    if (!user || !result) return;
    setSaving(true);
    const base = emptyBrief();
    const title =
      result.client.brand?.trim() ||
      result.client.name?.trim() ||
      result.goal?.split("\n")[0]?.slice(0, 50)?.trim() ||
      "บรีฟใหม่";

    // Build scope_items from deliverables
    const scope_items = result.deliverables.map((d) => ({
      name: d.name,
      quantity: d.quantity,
      note: d.formats.length ? `ไฟล์: ${d.formats.join(", ")}` : undefined,
    }));

    // Collect all formats across deliverables
    const formatsSet = new Set<string>();
    result.deliverables.forEach((d) => d.formats.forEach((f) => formatsSet.add(f)));

    const notesParts: string[] = [];
    if (noteText.trim()) notesParts.push(`[Live Chat Note]\n${noteText.trim()}`);
    if (result.note) notesParts.push(`[หมายเหตุจาก AI]\n${result.note}`);
    if (result.reference) notesParts.push(`[Reference]\n${result.reference}`);

    const payload = {
      user_id: user.id,
      title,
      status: "draft" as const,
      client_info: {
        client_name: result.client.name || undefined,
        brand_name: result.client.brand || undefined,
        contact_line: result.client.contact || undefined,
        logo_url: clientAssets.logo_url,
        ci_image_url: clientAssets.ci_image_url,
        ci_palette: clientAssets.ci_palette,
        past_works: clientAssets.past_works,
      },
      project_overview: {
        ...base.project_overview,
        project_name: title,
        goal: result.goal || undefined,
        problem: result.proposition || undefined,
        proposition: result.proposition || undefined,
        element_design: result.element_design || undefined,
        style_name: result.style || undefined,
        scope_items: scope_items.length ? scope_items : undefined,
      },
      design_direction: {
        moods: [],
        inspiration: result.reference || undefined,
        liked_fonts: undefined,
      },
      tech_specs: {
        formats: Array.from(formatsSet),
      },
      timeline_budget: {
        draft_date: result.timeline.start || undefined,
        deadline: result.timeline.deadline || undefined,
        budget: result.budget || undefined,
      },
      notes: notesParts.join("\n\n"),
      references: images,
    };

    const { data, error } = await supabase
      .from("design_briefs")
      .insert(payload as never)
      .select("*")
      .single();
    setSaving(false);
    if (error || !data) {
      toast.error(error?.message ?? "บันทึกไม่สำเร็จ");
      return;
    }
    toast.success("บันทึกบรีฟแล้ว — เปิดในตัวแก้ไขให้แล้ว");
    const row = data as Record<string, unknown>;
    onSaved({
      id: row.id as string,
      user_id: row.user_id as string,
      project_id: (row.project_id as string | null) ?? null,
      share_token: row.share_token as string,
      title: row.title as string,
      status: row.status as DesignBrief["status"],
      client_info: (row.client_info as DesignBrief["client_info"]) ?? {},
      project_overview: (row.project_overview as DesignBrief["project_overview"]) ?? {},
      audience: (row.audience as DesignBrief["audience"]) ?? {},
      design_direction: (row.design_direction as DesignBrief["design_direction"]) ?? { moods: [] },
      tech_specs: (row.tech_specs as DesignBrief["tech_specs"]) ?? { formats: [] },
      timeline_budget: (row.timeline_budget as DesignBrief["timeline_budget"]) ?? {},
      notes: (row.notes as string) ?? "",
      references: (row.references as DesignBrief["references"]) ?? [],
      ai_analysis: row.ai_analysis as DesignBrief["ai_analysis"],
      confirmed_at: row.confirmed_at as string | null,
      confirmed_by_name: row.confirmed_by_name as string | null,
      confirmed_signature: row.confirmed_signature as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    });
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="space-y-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">Smart Brief</h1>
        <p className="text-xs text-muted-foreground">บรีฟลูกค้าและสรุปสโคป</p>
      </div>

      {/* Quick Capture chip row + cancel */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-primary/15 text-primary p-2">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Smart Brief — Quick Capture</h2>
            <p className="text-[11px] text-muted-foreground">
              โยนแคปแชท + พิมพ์โน๊ตสด → AI สรุปบรีฟให้เป็น 10 หมวด
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          ยกเลิก
        </Button>
      </div>

      {/* Reference label */}
      <div className="flex items-center gap-1.5">
        <span className="rounded-md bg-primary/15 text-primary p-1">
          <ImageIcon className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-xs font-semibold">Reference จากลูกค้า</p>
          <p className="text-[10px] text-muted-foreground">
            แคปแชท Line/Messenger, รูปเรฟ, mood ที่ลูกค้าส่งมาให้ดู
          </p>
        </div>
      </div>

      {/* Hero dropzone — orange border + soft outer glow */}
      <div className="relative">
        {/* outer glow halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-3 rounded-[28px] blur-2xl opacity-60"
          style={{
            background:
              "radial-gradient(closest-side, hsl(var(--primary) / 0.35), transparent 70%)",
          }}
        />
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInput.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 p-8 sm:p-10 text-center transition ${
            dragOver
              ? "border-primary bg-primary/10"
              : "border-primary/70 bg-primary/[0.05] hover:bg-primary/[0.08]"
          }`}
          style={{
            boxShadow:
              "0 0 0 1px hsl(var(--primary) / 0.15), 0 14px 50px -12px hsl(var(--primary) / 0.45)",
          }}
        >
          <div className="mx-auto h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </div>
          <p className="text-base font-semibold">อัปโหลด บรีฟ</p>
          <p className="text-sm text-muted-foreground mt-1">So1o ช่วยสรุปบรีฟให้เข้าใจง่ายขึ้น</p>
          <p className="text-[11px] text-muted-foreground/80 mt-3">
            หน้าจอแชท / ข้อความที่คุยกับลูกค้า / Refference ลูกค้า
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {images.map((img) => (
            <span
              key={img.url}
              className="inline-flex items-center gap-1 rounded-full bg-muted/60 border border-border px-2 py-1 text-[11px]"
            >
              <img src={img.url} alt="" className="h-4 w-4 rounded object-cover" loading="lazy" />
              <span className="max-w-[140px] truncate">{img.name}</span>
              <button
                onClick={() => removeImage(img.url)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Text บรีฟเพิ่มเติม */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Text บรีฟเพิ่มเติม</label>
        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={6}
          placeholder="วางข้อความจากแชท หรือพิมพ์โน๊ตสดๆ ได้เลย..."
          className="bg-muted/30"
        />
      </div>

      {/* Client Brand Assets card */}
      <div className="space-y-3 rounded-2xl border border-border bg-card/50 p-4">
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-primary/15 text-primary p-1">
            <Palette className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold">Client Brand Assets — ของลูกค้าเอง</p>
            <p className="text-[10px] text-muted-foreground">
              โลโก้, รูป CI/แบรนด์, และผลงานเก่าที่ลูกค้าเคยทำ (เพื่อคุม CI)
            </p>
          </div>
        </div>

        <ClientBrandAssetsField value={clientAssets} onChange={updateAssets} userId={user?.id} />

        {/* Past works */}
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold flex items-center gap-1.5">
                <span className="text-primary">
                  <ImageIcon className="h-3.5 w-3.5" />
                </span>
                ผลงานเก่าของลูกค้า
              </p>
              <p className="text-[10px] text-muted-foreground">
                โพสต์เก่า, โบรชัวร์, กราฟิกที่เคยทำ — สูงสุด 8 รูป
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 rounded-lg gap-1"
              disabled={pastWorksBusy || (clientAssets.past_works?.length ?? 0) >= 8}
              onClick={() => pastWorksInput.current?.click()}
            >
              {pastWorksBusy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              เพิ่มรูป
            </Button>
            <input
              ref={pastWorksInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files?.length) addPastWorks(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {(clientAssets.past_works?.length ?? 0) > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {clientAssets.past_works!.map((pw) => (
                <div
                  key={pw.url}
                  className="relative group rounded-lg border border-border overflow-hidden bg-background"
                >
                  <img
                    src={pw.url}
                    alt={pw.name ?? ""}
                    className="w-full h-16 object-cover"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => removePastWork(pw.url)}
                    className="absolute top-0.5 right-0.5 rounded-full bg-background/80 backdrop-blur p-0.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition"
                    title="ลบ"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic">ยังไม่ได้อัปโหลด</p>
          )}
        </div>
      </div>

      {/* CTA: วิเคราะห์บรีฟกัน */}
      <Button
        onClick={extract}
        disabled={busy || (images.length === 0 && !noteText.trim())}
        className="w-full h-12 rounded-2xl gap-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 transition"
        style={{
          background: "linear-gradient(135deg, #FF5F05 0%, #FF9F67 100%)",
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {busy ? "AI กำลังวิเคราะห์…" : "วิเคราะห์บรีฟกัน"}
      </Button>

      {/* Section 3: Structured brief */}
      {result && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> Structured Brief
            </h3>
            <p className="text-[10px] text-muted-foreground">แก้ไขได้ก่อนกดบันทึก</p>
          </div>

          {SECTIONS.map((s) => (
            <SectionEditor
              key={s.key}
              label={s.label}
              desc={s.desc}
              section={s.key}
              result={result}
              onChange={updateResult}
            />
          ))}

          <Button onClick={saveAsBrief} disabled={saving} className="w-full h-10 rounded-xl gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            บันทึกเป็นบรีฟ (เปิดในตัวแก้ไขเพื่อทำ PDF)
          </Button>
        </div>
      )}
    </div>
  );
}

function SectionEditor({
  label,
  desc,
  section,
  result,
  onChange,
}: {
  label: string;
  desc: string;
  section: SectionKey;
  result: AiBriefExtractResult;
  onChange: <K extends keyof AiBriefExtractResult>(k: K, v: AiBriefExtractResult[K]) => void;
}) {
  const isEmpty = isSectionEmpty(section, result);
  return (
    <div
      className={`rounded-xl p-3 border ${
        isEmpty ? "border-red-300 bg-red-50/60 dark:bg-red-950/20" : "border-border bg-muted/20"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
            {label}
          </p>
          <p className="text-[10px] text-muted-foreground">{desc}</p>
        </div>
        {isEmpty && (
          <Badge
            variant="outline"
            className="text-[9px] border-red-400 text-red-700 dark:text-red-300 gap-1"
          >
            <AlertCircle className="h-2.5 w-2.5" /> ลองถามลูกค้าเพิ่ม
          </Badge>
        )}
      </div>
      {renderField(section, result, onChange)}
    </div>
  );
}

function isSectionEmpty(key: SectionKey, r: AiBriefExtractResult): boolean {
  switch (key) {
    case "client":
      return !r.client.name && !r.client.brand && !r.client.contact;
    case "proposition":
      return !r.proposition.trim();
    case "goal":
      return !r.goal.trim();
    case "deliverables":
      return r.deliverables.length === 0;
    case "element_design":
      return !r.element_design.trim();
    case "reference":
      return !r.reference.trim();
    case "style":
      return !r.style.trim();
    case "timeline":
      return !r.timeline.start && !r.timeline.deadline;
    case "budget":
      return !r.budget.trim();
    case "note":
      return !r.note.trim();
  }
}

function renderField(
  key: SectionKey,
  r: AiBriefExtractResult,
  onChange: <K extends keyof AiBriefExtractResult>(k: K, v: AiBriefExtractResult[K]) => void,
) {
  if (key === "client") {
    return (
      <div className="grid sm:grid-cols-3 gap-2">
        <Input
          placeholder="ชื่อลูกค้า"
          value={r.client.name}
          onChange={(e) => onChange("client", { ...r.client, name: e.target.value })}
        />
        <Input
          placeholder="แบรนด์"
          value={r.client.brand}
          onChange={(e) => onChange("client", { ...r.client, brand: e.target.value })}
        />
        <Input
          placeholder="ติดต่อ (Line/เบอร์)"
          value={r.client.contact}
          onChange={(e) => onChange("client", { ...r.client, contact: e.target.value })}
        />
      </div>
    );
  }
  if (key === "deliverables") {
    return (
      <DeliverablesEditor
        value={r.deliverables}
        onChange={(next) => onChange("deliverables", next)}
      />
    );
  }
  if (key === "timeline") {
    return (
      <div className="grid sm:grid-cols-2 gap-2">
        <Input
          placeholder="วันเริ่ม"
          value={r.timeline.start}
          onChange={(e) => onChange("timeline", { ...r.timeline, start: e.target.value })}
        />
        <Input
          placeholder="วันส่ง / Deadline"
          value={r.timeline.deadline}
          onChange={(e) => onChange("timeline", { ...r.timeline, deadline: e.target.value })}
        />
      </div>
    );
  }
  // simple string sections
  const map = {
    proposition: "โจทย์ลูกค้า / pain point",
    goal: "เป้าหมายโปรเจกต์",
    element_design: "สิ่งที่ลูกค้าให้ใช้ออกแบบ (โลโก้/สี/ฟอนต์/ชื่อ)",
    reference: "ตัวอย่างงาน / ลิงก์อ้างอิง",
    style: "ชื่อสไตล์ (Minimal / Y2K / ฯลฯ)",
    budget: "งบประมาณ",
    note: "หมายเหตุสำคัญ",
  } as const;
  const k = key as keyof typeof map;
  const longText = key === "proposition" || key === "element_design" || key === "note";
  return longText ? (
    <Textarea
      rows={2}
      placeholder={map[k]}
      value={r[k] as string}
      onChange={(e) => onChange(k, e.target.value as never)}
    />
  ) : (
    <Input
      placeholder={map[k]}
      value={r[k] as string}
      onChange={(e) => onChange(k, e.target.value as never)}
    />
  );
}

function DeliverablesEditor({
  value,
  onChange,
}: {
  value: AiBriefExtractResult["deliverables"];
  onChange: (v: AiBriefExtractResult["deliverables"]) => void;
}) {
  const add = () => onChange([...value, { name: "", quantity: 1, formats: [] }]);
  const update = (i: number, patch: Partial<AiBriefExtractResult["deliverables"][number]>) =>
    onChange(value.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const toggleFormat = (i: number, f: string) => {
    const cur = value[i].formats;
    update(i, { formats: cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f] });
  };

  return (
    <div className="space-y-2">
      {value.map((d, i) => (
        <div key={i} className="rounded-lg border border-border bg-background p-2 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Input
              value={d.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="ชื่อชิ้นงาน เช่น โลโก้"
              className="h-8 text-xs flex-1"
            />
            <Input
              type="number"
              min={1}
              value={d.quantity}
              onChange={(e) =>
                update(i, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className="h-8 text-xs w-16"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive"
              onClick={() => remove(i)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {FORMAT_OPTIONS.map((f) => {
              const on = d.formats.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFormat(i, f)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                    on
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 hover:bg-muted border-border"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={add} className="h-7 text-xs w-full">
        + เพิ่มชิ้นงาน
      </Button>
    </div>
  );
}
