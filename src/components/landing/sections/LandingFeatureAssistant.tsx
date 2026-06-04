import * as React from "react";
import { MENTOR_TOPICS } from "@/components/landing/MentorTopicGallery";
import { CheckCircle2, Sparkles } from "lucide-react";

const BENEFITS_10X = [
  { title: "ง่ายกว่าเดิม 10 เท่า", desc: "รวมงาน ลูกค้า เอกสาร การเงิน ในที่เดียว" },
  { title: "ใบเสนอราคาเร็ว", desc: "VAT · WHT · มัดจำ คำนวณให้อัตโนมัติ" },
  { title: "ภาษีไทยครบ", desc: "รายได้ · ภาษี · 50 ทวิ · โหมดจำลอง" },
  { title: "ทุก device", desc: "มือถือ · แท็บเล็ต · เดสก์ท็อป · PWA" },
];

interface Props {
  onOpenMentor?: () => void;
}

export function LandingFeatureAssistant({ onOpenMentor }: Props) {
  return (
    <section id="mentor" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" /> Feature Assistant
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
          AI Mentor ช่วยตอบทุกมุมงานฟรีแลนซ์
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          เลือกหัวข้อแล้วถามได้ทันที — ราคา ภาษี ดีไซน์ ลูกค้า การตลาด
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
        {MENTOR_TOPICS.map((t) => {
          const Icon = t.Icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={onOpenMentor}
              className={`rounded-2xl border bg-gradient-to-br p-4 text-left min-h-[120px] hover:shadow-elevated transition-all ${t.gradient}`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <div className="mt-2 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold leading-tight">{t.title}</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground line-clamp-2">
                {t.questions[0]}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center rounded-3xl border border-border bg-card/60 p-6 sm:p-10">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            ทำไมถึง <span className="text-primary">10x</span>?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            ลดเวลางานแอดมิน โฟกัสงานครีเอทีฟ — ออกแบบมาสำหรับฟรีแลนซ์ไทยโดยเฉพาะ
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {BENEFITS_10X.map((b) => (
              <li key={b.title} className="flex gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{b.title}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="aspect-[4/3] rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-muted overflow-hidden relative">
          {/* TODO: replace with lifestyle / product photo */}
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <div>
              <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                10x
              </div>
              <p className="mt-2 text-sm text-muted-foreground">ประสิทธิภาพการทำงาน</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
