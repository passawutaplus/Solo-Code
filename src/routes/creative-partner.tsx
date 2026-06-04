import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sparkles,
  Send,
  Loader2,
  Zap,
  Palette,
  Wand2,
  Eye,
  TrendingUp,
  ArrowLeft,
  MessageSquarePlus,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/creative-partner")({
  head: () => ({
    meta: [
      { title: "So1o Creative Partner — AI ที่ปรึกษาดีไซน์" },
      { name: "description", content: "AI ที่ปรึกษาด้านงานออกแบบ สี ฟอนต์ คอนเซปต์ สำหรับฟรีแลนซ์ไทย" },
      { property: "og:title", content: "So1o Creative Partner — AI ที่ปรึกษาดีไซน์" },
      { property: "og:description", content: "AI ที่ปรึกษาด้านงานออกแบบสำหรับฟรีแลนซ์ไทย" },
      { property: "og:url", content: "https://solofreelancer.com/creative-partner" },
    ],
    links: [{ rel: "canonical", href: "https://solofreelancer.com/creative-partner" }],
  }),
  component: CreativePartnerPage,
});

type Msg = { id: string; role: "user" | "assistant"; content: string; created_at: string };

const DAILY_LIMIT = 5;
const MAX_CHARS = 500;

const QUICK = [
  { label: "Create Moodboard", icon: Sparkles, prompt: "ช่วยสร้าง Moodboard จากคีย์เวิร์ด [ใส่ 3 คำ เช่น minimal, organic, warm] ให้หน่อย เสนอ mood & tone, color palette, typography" },
  { label: "Art Critique", icon: Eye, prompt: "ช่วยวิจารณ์งานออกแบบที่ผมกำลังทำอยู่: [อธิบายงาน/แนบลิงก์] หาจุดที่ขัดตาและจุดที่น่าสนใจ" },
  { label: "Color Palette", icon: Palette, prompt: "ช่วยเสนอ Color Palette สำหรับ [ชื่อแบรนด์/ประเภทงาน] พร้อม HEX และเหตุผลทางจิตวิทยาสี" },
  { label: "Design Trends", icon: TrendingUp, prompt: "อัปเดตเทรนด์งานออกแบบล่าสุดในวงการ [ใส่อุตสาหกรรม เช่น f&b, fashion] ปี 2026" },
];

function CreativePartnerPage() {
  const { user } = useAuth();
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [used, setUsed] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

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
      .limit(200);
    setMessages((data ?? []) as Msg[]);
  }, [user]);

  React.useEffect(() => {
    loadMessages();
    refreshUsage();
  }, [loadMessages, refreshUsage]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const limitReached = used >= DAILY_LIMIT;

  const send = async () => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อใช้งาน");
      return;
    }
    const text = body.trim();
    if (!text || limitReached) return;
    setSending(true);
    const tempId = `tmp_${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text, created_at: new Date().toISOString() }]);
    setBody("");
    try {
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
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  // Group history (user messages) by date bucket
  const grouped = React.useMemo(() => {
    const today: Msg[] = [];
    const yesterday: Msg[] = [];
    const last30: Msg[] = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    messages
      .filter((m) => m.role === "user")
      .slice()
      .reverse()
      .forEach((m) => {
        const t = new Date(m.created_at).getTime();
        if (t >= startOfToday) today.push(m);
        else if (t >= startOfToday - 86400000) yesterday.push(m);
        else if (t >= startOfToday - 30 * 86400000) last30.push(m);
      });
    return { today, yesterday, last30 };
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl flex-col">
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> กลับหน้าหลัก
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 grid place-items-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">So1o Creative</div>
              <div className="text-[10px] text-white/75">AI Design Partner</div>
            </div>
          </div>
        </div>
        <div className="p-3">
          <button
            onClick={() => setBody("")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-medium transition-colors"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" /> เริ่มแชทใหม่
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <HistoryGroup title="Today" items={grouped.today} />
          <HistoryGroup title="Yesterday" items={grouped.yesterday} />
          <HistoryGroup title="Last 30 days" items={grouped.last30} />
        </div>
        <div className="p-3 border-t border-white/10">
          <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent p-3">
            <div className="text-[10px] text-white/60 mb-1">โควต้าวันนี้</div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{used}/{DAILY_LIMIT} ครั้ง</span>
              <Zap className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400" style={{ width: `${(used / DAILY_LIMIT) * 100}%` }} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-white/80">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <span className="opacity-70">·</span>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <span className="opacity-70">·</span>
            <Link to="/cookies" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Link to="/" className="md:hidden inline-flex items-center gap-1 text-xs text-white/60" aria-label="กลับหน้าแรก">
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <h1 className="text-sm font-semibold">So1o Creative Partner — AI ที่ปรึกษาดีไซน์</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/75 hidden sm:inline">ใช้แล้ว {used}/{DAILY_LIMIT}</span>
            {limitReached && (
              <Button size="sm" className="h-7 text-xs gap-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 border-0" onClick={() => toast.info("เร็วๆ นี้ — เปิดให้เติมเครดิต")}>
                <Zap className="h-3 w-3" /> Upgrade
              </Button>
            )}
          </div>
        </header>

        {/* Messages or Welcome */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 grid place-items-center shadow-2xl shadow-orange-900/30 mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-white via-white to-orange-300 bg-clip-text text-transparent">
                สวัสดี Creative
              </h2>
              <p className="mt-2 text-sm text-white/60 max-w-md">
                ผมคือ So1o Creative Partner — คู่คิดด้านดีไซน์, สี, ฟอนต์ และคอนเซปต์ของคุณ
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
              {messages.map((m) => <Bubble key={m.id} m={m} />)}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 backdrop-blur px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl p-3 sm:p-4">
          <div className="max-w-3xl mx-auto space-y-2">
            {!limitReached && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {QUICK.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => setBody(q.prompt)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    <q.icon className="h-3 w-3 text-orange-400" /> {q.label}
                  </button>
                ))}
              </div>
            )}

            {limitReached && (
              <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent p-3 text-center">
                <div className="text-xs font-semibold mb-1">ใช้ครบ 5 ครั้งวันนี้แล้ว 🎯</div>
                <div className="text-[10px] text-white/60 mb-2">อัพเกรดเพื่อถามต่อแบบไม่จำกัด หรือเติมเครดิต</div>
                <Button size="sm" className="h-7 text-xs gap-1 bg-gradient-to-r from-orange-500 to-orange-600 border-0" onClick={() => toast.info("เร็วๆ นี้")}>
                  <Zap className="h-3 w-3" /> Upgrade / เติมเครดิต
                </Button>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-2 flex items-end gap-2">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={limitReached ? "ใช้ครบโควต้าวันนี้แล้ว" : "ถามเรื่องดีไซน์ สี ฟอนต์ หรือคอนเซปต์..."}
                rows={1}
                disabled={limitReached || sending || !user}
                className="min-h-10 max-h-40 text-sm resize-none flex-1 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-white/70"
              />
              <Button
                size="sm"
                aria-label="ส่งคำถาม"
                className="h-10 w-10 p-0 shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 hover:opacity-90 border-0"
                disabled={sending || !body.trim() || limitReached || !user}
                onClick={send}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/70 px-1">
              <span>{!user ? "เข้าสู่ระบบเพื่อใช้งาน" : "ฟรี 5 คำถาม/วัน · สูงสุด 500 ตัวอักษร"}</span>
              <span>{body.length}/{MAX_CHARS}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function HistoryGroup({ title, items }: { title: string; items: Msg[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/70 mb-2 px-2">
        <Clock className="h-3 w-3" /> {title}
      </div>
      <div className="space-y-0.5">
        {items.slice(0, 20).map((m) => (
          <div
            key={m.id}
            className="px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-default text-xs text-white/70 truncate"
            title={m.content}
          >
            {m.content.slice(0, 50)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Bubble({ m }: { m: Msg }) {
  const mine = m.role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 backdrop-blur-xl border ${
          mine
            ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400/50 text-white rounded-br-sm shadow-lg shadow-orange-900/20"
            : "bg-white/5 border-white/10 text-white rounded-bl-sm"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">{m.content}</div>
        <div className={`text-[9px] mt-1.5 ${mine ? "text-white/70" : "text-white/70"}`}>
          {new Date(m.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
