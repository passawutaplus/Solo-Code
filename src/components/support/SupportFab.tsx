import * as React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, MessageCircle, BookOpen, Lightbulb, Sparkles } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { SupportChat } from "./SupportChat";
import { SupportFaq } from "./SupportFaq";
import { SupportSuggest } from "./SupportSuggest";
import { SupportChangelog } from "./SupportChangelog";
import so1oLogoMark from "@/assets/so1o-logo-mark.png";

type View = "home" | "chat" | "faq" | "suggest" | "changelog";

const VIEW_TITLES: Record<View, string> = {
  home: "มีอะไรให้เราช่วยไหม?",
  chat: "คุยกับทีมงาน So1o",
  faq: "คำถามที่พบบ่อย",
  suggest: "เสนอแนะฟีเจอร์ใหม่",
  changelog: "อัปเดตล่าสุด",
};

export function SupportFab({ inline = false }: { inline?: boolean } = {}) {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<View>("home");
  const [unread, setUnread] = React.useState(0);

  // Count unread admin messages
  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const { count } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("sender_role", "admin")
        .eq("is_read", false);
      if (!cancelled) setUnread(count ?? 0);
    };
    load();
    const ch = supabase
      .channel(`support_unread_${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [user]);

  React.useEffect(() => {
    if (open) setView("home");
  }, [open]);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="เปิด So1o Support Hub"
          className={
            inline
              ? "relative h-12 w-12 rounded-full bg-white shadow-[0_10px_30px_-8px_rgba(255,95,5,0.5)] ring-2 ring-[#FF5F05]/20 hover:ring-[#FF5F05]/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
              : "fixed bottom-6 right-6 z-[60] h-12 w-12 rounded-full bg-white shadow-[0_10px_30px_-8px_rgba(255,95,5,0.5)] ring-2 ring-[#FF5F05]/20 hover:ring-[#FF5F05]/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          }
        >
          <img
            src={so1oLogoMark}
            alt="So1o"
            className="h-full w-full object-cover rounded-full"
          />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white z-10 shadow-md">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="p-0 w-full sm:max-w-[400px] sm:right-6 sm:bottom-6 sm:top-auto sm:h-[640px] sm:max-h-[calc(100vh-3rem)] sm:rounded-2xl border-0 overflow-hidden shadow-2xl flex flex-col bg-white"
        >
          {/* Header — orange gradient */}
          <div
            className="relative px-5 pt-5 pb-6 text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #FF5F05 0%, #FF9F67 100%)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {view !== "home" && (
                  <button
                    onClick={() => setView("home")}
                    className="h-8 w-8 -ml-1 rounded-full hover:bg-white/15 flex items-center justify-center transition"
                    aria-label="ย้อนกลับ"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <div className="flex -space-x-2">
                  <div className="h-9 w-9 rounded-full bg-white/90 text-[#FF5F05] flex items-center justify-center font-bold text-sm border-2 border-white">S</div>
                  <div className="h-9 w-9 rounded-full bg-white/90 text-[#FF5F05] flex items-center justify-center font-bold text-sm border-2 border-white">o</div>
                  <div className="h-9 w-9 rounded-full bg-white/90 text-[#FF5F05] flex items-center justify-center font-bold text-sm border-2 border-white">1</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-white/15 flex items-center justify-center transition"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">{VIEW_TITLES[view]}</h2>
            {view === "home" && (
              <p className="mt-1 text-sm text-white/90">ทีม So1o พร้อมช่วยคุณเสมอ ตอบไว ภายใน 15 นาที</p>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden bg-white">
            {view === "home" && <HomeView setView={setView} unread={unread} />}
            {view === "chat" && <SupportChat />}
            {view === "faq" && <SupportFaq />}
            {view === "suggest" && <SupportSuggest />}
            {view === "changelog" && <SupportChangelog />}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function HomeView({ setView, unread }: { setView: (v: View) => void; unread: number }) {
  return (
    <div className="p-4 space-y-3 overflow-y-auto h-full">
      {/* Primary action */}
      <button
        onClick={() => setView("chat")}
        className="w-full text-left rounded-xl border border-[#FF5F05]/30 bg-white p-4 hover:border-[#FF5F05] hover:shadow-md transition-all group"
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-[#FF5F05]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF5F05]/15">
            <MessageCircle className="h-5 w-5 text-[#FF5F05]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-900">💬 คุยกับทีมงาน</div>
              {unread > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unread}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">ปกติเราตอบกลับภายใน 15 นาที</div>
          </div>
        </div>
      </button>

      {/* Secondary */}
      <SecondaryCard icon={<BookOpen className="h-4 w-4 text-[#FF5F05]" />} title="📖 คู่มือและ FAQ" desc="คำถามที่พบบ่อยทั้งหมด" onClick={() => setView("faq")} />
      <SecondaryCard icon={<Lightbulb className="h-4 w-4 text-[#FF5F05]" />} title="💡 เสนอแนะฟีเจอร์" desc="อยากได้อะไรเพิ่ม บอกเราได้เลย" onClick={() => setView("suggest")} />
      <SecondaryCard icon={<Sparkles className="h-4 w-4 text-[#FF5F05]" />} title="✨ อัปเดตฟีเจอร์ใหม่" desc="ดูสิ่งใหม่ๆ ที่เพิ่มเข้ามา" onClick={() => setView("changelog")} />
      <a
        href="https://lin.ee/q3W9Qds"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-left rounded-xl border border-gray-200 bg-white p-3 hover:border-[#06C755]/50 hover:bg-green-50/40 hover:shadow-sm transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#06C755]/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#06C755]" fill="currentColor" aria-hidden="true">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .628.285.628.63 0 .349-.282.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">💬 แชทผ่าน LINE</div>
            <div className="text-[11px] text-gray-500">ทีมตอบเร็ว · @solofreelancer</div>
          </div>
        </div>
      </a>


      <div className="pt-2 text-center text-[10px] text-gray-400">
        So1o Support Hub · v1.0
      </div>
    </div>
  );
}

function SecondaryCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-gray-200 bg-white p-3 hover:border-[#FF5F05]/40 hover:bg-orange-50/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-[11px] text-gray-500">{desc}</div>
        </div>
      </div>
    </button>
  );
}
