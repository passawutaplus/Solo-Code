import { Link, useNavigate } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { LoginForm } from "@/components/auth/LoginForm";
import { SocialButtons, AuthEmailSeparator } from "@/components/auth/SocialButtons";

interface Props {
  approved: number;
  target: number;
  remaining: number;
}

export function LandingHero({ approved, target, remaining, pct }: Props & { pct: number }) {
  const { user, signIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:pt-14 sm:pb-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <HeroVisual />
          <div className="rounded-3xl border border-border bg-card/90 backdrop-blur p-6 sm:p-8 shadow-soft text-center">
            <h2 className="text-xl font-bold tracking-tight">ยินดีต้อนรับกลับมา</h2>
            <p className="mt-2 text-sm text-muted-foreground">เข้าแดชบอร์ดเพื่อจัดการงานและใบเสนอราคา</p>
            <Link
              to={isAdmin ? "/admin" : "/dashboard"}
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-gradient-primary text-primary-foreground px-5 py-3 text-sm font-semibold shadow-elevated"
            >
              เปิดแดชบอร์ด
            </Link>
            <TesterProgress approved={approved} target={target} remaining={remaining} pct={pct} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:pt-14 sm:pb-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <HeroVisual />

        <div className="rounded-3xl border border-primary/20 bg-card/95 backdrop-blur p-6 sm:p-8 shadow-elevated">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary mb-4">
            <Sparkles className="h-3 w-3" /> เพื่อนคู่คิดของฟรีแลนซ์
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
            ทำงานฟรีแลนซ์ให้ง่ายกว่าเดิม{" "}
            <span className="text-primary">10 เท่า</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            เข้าสู่ระบบเพื่อใช้หลังบ้านครบวงจร — ใบเสนอราคา การเงิน ภาษี และ Smart Brief
          </p>

          <div className="mt-5 space-y-4">
            <SocialButtons className="grid grid-cols-2 gap-2" />
            <AuthEmailSeparator surface="card" />
            <LoginForm
              signIn={signIn}
              compact
              showSignupLink={false}
              idPrefix="hero-login"
              onSuccess={() => navigate({ to: "/dashboard" })}
            />
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            ยังไม่มีบัญชี?{" "}
            <Link to="/apply" className="text-primary font-medium hover:underline">
              สมัครเข้ากลุ่มบุกเบิก
            </Link>
            {" · "}
            <Link to="/auth" className="text-primary hover:underline">
              สมัครด้วยอีเมล
            </Link>
          </p>

          <TesterProgress approved={approved} target={target} remaining={remaining} pct={pct} />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-auto lg:min-h-[420px] rounded-3xl overflow-hidden border border-border shadow-elevated">
      {/* TODO: replace with src/assets/landing/hero.webp when final asset is ready */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-background dark:from-orange-950/40 dark:via-background dark:to-background"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_30%_20%,rgba(243,112,33,0.25),transparent_50%)]"
        aria-hidden
      />
      <div className="absolute inset-0 flex items-end p-6 sm:p-8">
        <div className="rounded-2xl bg-card/80 backdrop-blur border border-border/60 px-4 py-3 max-w-sm">
          <p className="text-sm font-semibold">หลังบ้านครบวงจรสำหรับฟรีแลนซ์ไทย</p>
          <p className="text-xs text-muted-foreground mt-1">
            ลูกค้า · ใบเสนอราคา · การเงิน · ภาษี · Creative Labs
          </p>
        </div>
      </div>
    </div>
  );
}

function TesterProgress({
  approved,
  target,
  remaining,
  pct,
}: {
  approved: number;
  target: number;
  remaining: number;
  pct: number;
}) {
  return (
    <div className="mt-6 pt-5 border-t border-border">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-muted-foreground">Tester รุ่นแรก</span>
        <span className="tabular-nums">
          <span className="text-primary font-bold">{approved}</span> / {target}
        </span>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" />
      <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
        {remaining > 0 ? `เหลืออีก ${remaining} ที่นั่ง` : "ปิดรับสมัครรุ่นแรกแล้ว"}
      </p>
    </div>
  );
}
