import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, X, Send, Loader2, Zap, Palette, PenLine, Lightbulb, Wand2,
  Maximize2, ThumbsUp, ThumbsDown, BarChart3, Users, AlertCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { aiBusinessInsights } from "@/lib/aiBusinessInsights.functions";

type Msg = { id: string; role: "user" | "assistant"; content: string; created_at: string };

const DAILY_LIMIT = 5;
const MAX_CHARS = 500;

type ChatMode = "design" | "business";

const DESIGN_QUICK_ACTIONS: { label: string; icon: typeof Palette; prompt: string }[] = [
  { label: "ช่วยออกแบบ", icon: Wand2, prompt: "ช่วยออกแบบ [ใส่รายละเอียดงาน เช่น โลโก้ร้านกาแฟสไตล์มินิมอล] ให้หน่อย..." },
  { label: "ช่วยเลือกสี", icon: Palette, prompt: "ช่วยเลือกคู่สีสำหรับงานออกแบบ [ชื่อโปรเจกต์/แบรนด์] ให้หน่อย..." },
  { label: "ช่วยคิดแคปชัน", icon: PenLine, prompt: "ช่วยคิดแคปชันสำหรับงาน [ใส่รายละเอียดงาน] ให้หน่อย..." },
  { label: "ช่วยวางคอนเซปต์", icon: Lightbulb, prompt: "ช่วยวางคอนเซปต์งาน [ใส่บรีฟ/ประเภทธุรกิจ] ให้หน่อย..." },
];

const BUSINESS_QUICK_ACTIONS: { label: string; icon: typeof BarChart3; prompt: string }[] = [
  { label: "ลูกค้าท็อป 10", icon: Users, prompt: "ลูกค้า 10 คนแรกที่ทำเงินให้ฉันได้มากที่สุดคือใคร?" },
  { label: "ทวงเงินก่อน", icon: AlertCircle, prompt: "ลูกค้าคนไหนที่ควรทวงเงินก่อน หรือ priority สูงสุดตามกำหนดชำระ?" },
  { label: "สรุปรายได้", icon: BarChart3, prompt: "สรุปภาพรวมรายได้และใบแจ้งหนี้ค้างชำระของฉันให้หน่อย" },
];

export function FloatingChat({ inline = false }: { inline?: boolean } = {}) {
  const { user } = useAuth();
  const businessFn = useServerFn(aiBusinessInsights);
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<ChatMode>("design");
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [used, setUsed] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const quickActions = mode === "business" ? BUSINESS_QUICK_ACTIONS : DESIGN_QUICK_ACTIONS;

  const refreshUsage = React.useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("ai_chat_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .maybeSingle();
    setUsed(data?.count ?? 0);
  }, [user]);

  const loadMessages = React.useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_chat_messages")
      .select("id, role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);
    setMessages((data ?? []) as Msg[]);
  }, [user]);

  React.useEffect(() => {
    if (open) { loadMessages(); refreshUsage(); }
  }, [open, loadMessages, refreshUsage]);

  React.useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const limitReached = used >= DAILY_LIMIT;

  const send = async () => {
    if (!user) return;
    const text = body.trim();
    if (!text || limitReached) return;
    setSending(true);
    const tempId = `tmp_${Date.now()}`;
    const assistantTempId = `tmp_${Date.now()}_a`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text, created_at: new Date().toISOString() }]);
    setBody("");
    try {
      if (mode === "business") {
        const result = await businessFn({ data: { question: text } });
        setMessages((prev) => [
          ...prev,
          {
            id: assistantTempId,
            role: "assistant",
            content: result.answer,
            created_at: new Date().toISOString(),
          },
        ]);
        setUsed((u) => Math.min(DAILY_LIMIT, u + 1));
        return;
      }

      const { data, error } = await supabase.functions.invoke("ai-design-chat", {
        body: { message: text, stream: false },
      });
      if (error) {
        const msg = error.message ?? "ส่งไม่สำเร็จ";
        if (msg.includes("limit_reached") || msg.includes("429")) {
          toast.error("ใช้ครบ 5 ครั้งแล้ววันนี้");
          setUsed(DAILY_LIMIT);
        } else if (msg.includes("402")) {
          toast.error("AI หมดเครดิต — ติดต่อแอดมิน");
        } else {
          toast.error(msg);
        }
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }
      if (data?.error) {
        toast.error(data.error === "limit_reached" ? "ใช้ครบ 5 ครั้งแล้ววันนี้" : data.error);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }
      setUsed(data?.used ?? used + 1);
      await loadMessages();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ส่งไม่สำเร็จ");
      setMessages((prev) => prev.filter((m) => m.id !== tempId && m.id !== assistantTempId));
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="เปิดที่ปรึกษาดีไซน์ AI"
          className={
            inline
              ? "h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground shadow-elevated hover:scale-105 active:scale-95 transition-transform flex items-center justify-center group"
              : "fixed bottom-24 right-6 z-50 h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground shadow-elevated hover:scale-105 active:scale-95 transition-transform flex items-center justify-center group"
          }
        >
          <Sparkles className="h-5 w-5 relative" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-96 h-[70vh] sm:h-[560px] flex flex-col rounded-2xl border border-border bg-card shadow-elevated animate-fade-in">
          <div className="flex items-center justify-between p-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent rounded-t-2xl">
            <div className="min-w-0">
              <div className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {mode === "business" ? "So1o Business AI" : "So1o Mentor"}
              </div>
              <div className="text-[10px] text-muted-foreground">
                ใช้แล้ว {used}/{DAILY_LIMIT} วันนี้
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link to="/creative-partner" onClick={() => setOpen(false)}>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="เปิดเต็มหน้าจอ">
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-10 px-3">
                <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary/60" />
                {mode === "business"
                  ? "ถามข้อมูลธุรกิจจากลูกค้า รายได้ ใบแจ้งหนี้ค้างชำระ — อิงข้อมูลจริงในระบบ"
                  : "ถามเรื่องงานออกแบบ โลโก้ UI/UX การคิดราคา หรือคุยกับลูกค้าได้เลย"}
                <div className="mt-1 text-[10px]">จำกัด 5 คำถาม/วัน · ยาวไม่เกิน 500 ตัวอักษร</div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <Bubble
                  key={m.id}
                  m={m}
                  prevUserPrompt={
                    m.role === "assistant"
                      ? [...messages].slice(0, idx).reverse().find((x) => x.role === "user")?.content ?? ""
                      : ""
                  }
                  userId={user.id}
                />
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {limitReached && (
            <div className="mx-3 mb-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
              <div className="text-xs font-semibold mb-1">ใช้ครบ 5 ครั้งวันนี้แล้ว 🎯</div>
              <div className="text-[10px] text-muted-foreground mb-2">อัพเกรดเพื่อถามต่อแบบไม่จำกัด หรือเติมเครดิต</div>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => toast.info("เร็ว ๆ นี้ — จะเปิดให้เติมเครดิตเร็ว ๆ นี้")}>
                <Zap className="h-3 w-3" /> อัพเกรด / เติมเครดิต
              </Button>
            </div>
          )}

          <div className="p-2 border-t border-border space-y-2">
            <div className="flex gap-1 rounded-lg bg-muted p-0.5">
              <button
                type="button"
                onClick={() => setMode("design")}
                className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-all ${
                  mode === "design" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                ดีไซน์
              </button>
              <button
                type="button"
                onClick={() => setMode("business")}
                className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-all ${
                  mode === "business" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                ธุรกิจ
              </button>
            </div>
            {!limitReached && (
              <div className="flex flex-wrap gap-1.5">
                {quickActions.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => setBody(q.prompt)}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-foreground transition-colors"
                  >
                    <q.icon className="h-3 w-3 text-primary" /> {q.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-1.5">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={
                  limitReached
                    ? "ใช้ครบโควตาวันนี้แล้ว"
                    : mode === "business"
                      ? "ถามข้อมูลลูกค้า รายได้ ใบค้างชำระ..."
                      : "ถามเรื่องดีไซน์..."
                }
                rows={1}
                disabled={limitReached || sending}
                className="min-h-9 max-h-28 text-xs resize-none flex-1"
              />
              <Button
                size="sm"
                className="h-9 w-9 p-0 shrink-0"
                disabled={sending || !body.trim() || limitReached}
                onClick={send}
                aria-label="ส่ง"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-[9px] text-muted-foreground text-right">{body.length}/{MAX_CHARS}</div>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({
  m,
  prevUserPrompt,
  userId,
}: {
  m: Msg;
  prevUserPrompt: string;
  userId: string;
}) {
  const mine = m.role === "user";
  const [feedback, setFeedback] = React.useState<"liked" | "disliked" | null>(null);
  const [busy, setBusy] = React.useState(false);

  const sendFeedback = async (status: "liked" | "disliked") => {
    if (busy || feedback) return;
    setBusy(true);
    setFeedback(status); // optimistic
    try {
      // Pull current personality snapshot for traceability
      const { data: personality } = await (supabase as any)
        .from("ai_personality_settings")
        .select("creativity,formality,detail_level,forbidden_keywords,system_prompt_override")
        .limit(1)
        .maybeSingle();

      const { error } = await (supabase as any).from("ai_interactions_feedback").insert({
        user_id: userId,
        feature: "mentor_chat",
        prompt: prevUserPrompt || "(no prior prompt)",
        ai_response: m.content,
        personality_settings: personality ?? {},
        status,
        source_message_id: m.id,
        metadata: { source: "floating_chat" },
      });
      if (error) throw error;
      toast.success("ขอบคุณสำหรับฟีดแบ็กครับ");
    } catch (e) {
      setFeedback(null);
      toast.error(e instanceof Error ? e.message : "บันทึกฟีดแบ็กไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 ${
          mine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        <div className="text-xs whitespace-pre-wrap break-words">{m.content}</div>
        <div className={`flex items-center justify-between gap-2 mt-1`}>
          <div className={`text-[9px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {new Date(m.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
          </div>
          {!mine && (
            <div className="flex items-center gap-0.5 -mr-1">
              <button
                type="button"
                onClick={() => sendFeedback("liked")}
                disabled={busy || feedback !== null}
                aria-label="ตอบโดน"
                className={`h-6 w-6 rounded-full grid place-items-center transition-all disabled:cursor-default ${
                  feedback === "liked"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => sendFeedback("disliked")}
                disabled={busy || feedback !== null}
                aria-label="ยังไม่โดน"
                className={`h-6 w-6 rounded-full grid place-items-center transition-all disabled:cursor-default ${
                  feedback === "disliked"
                    ? "bg-muted-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
                }`}
              >
                <ThumbsDown className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
