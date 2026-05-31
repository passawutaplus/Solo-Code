import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { RouteError } from "@/components/RouteError";
import * as React from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { LineHeaderButton } from "@/components/LineContactButton";
import { Loader2, ArrowLeft, Mail, User as UserIcon, Info } from "lucide-react";
import logoUrl from "@/assets/solo-freelancer-logo.webp";
import { lovable } from "@/integrations/lovable";
import { AuthBannerSlider } from "@/components/auth/AuthBannerSlider";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FreelanceFieldSelect } from "@/components/auth/FreelanceFieldSelect";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/layout/SiteFooter";

const LOCKOUT_KEY = "so1o_login_lockout";
const FAIL_KEY = "so1o_login_fails";
const MAX_FAILS = 5;
const LOCKOUT_SECONDS = 30;

async function handleOAuth(provider: "google" | "apple") {
  const result = await lovable.auth.signInWithOAuth(provider, {
    redirect_uri: typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined,
  });
  if (result.error) {
    toast.error(result.error.message || `เข้าสู่ระบบด้วย ${provider} ไม่สำเร็จ`);
  }
}

function SocialButtons() {
  const [busy, setBusy] = React.useState<"google" | "apple" | null>(null);
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={busy !== null}
        onClick={async () => { setBusy("google"); try { await handleOAuth("google"); } finally { setBusy(null); } }}
        className="h-11 gap-2 rounded-lg"
      >
        {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
        )}
        <span className="text-sm">Google</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={busy !== null}
        onClick={async () => { setBusy("apple"); try { await handleOAuth("apple"); } finally { setBusy(null); } }}
        className="h-11 gap-2 rounded-lg"
      >
        {busy === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.412 2.226-1.157 3.013-.793.842-2.043 1.481-3.245 1.388-.114-1.108.41-2.244 1.143-3.018C13.953 1.96 15.27 1.378 16.365 1.43zM20.5 17.36c-.487 1.105-.722 1.6-1.355 2.578-.882 1.366-2.124 3.067-3.66 3.083-1.367.014-1.717-.886-3.572-.876-1.855.012-2.244.892-3.612.878-1.534-.014-2.711-1.55-3.594-2.918C2.272 16.224 1.985 11.41 3.524 8.93c1.094-1.762 2.823-2.79 4.45-2.79 1.652 0 2.69.91 4.058.91 1.327 0 2.135-.911 4.045-.911 1.45 0 2.984.792 4.077 2.16-3.585 1.965-3.003 7.085.346 9.062z"/>
          </svg>
        )}
        <span className="text-sm">Apple</span>
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ — So1o Freelancer" },
      { name: "description", content: "เข้าสู่ระบบหรือสมัครสมาชิก So1o Freelancer หลังบ้านฟรีแลนซ์ครบวงจร" },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.solofreelancer.com/auth" }],
  }),
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, user, isAdmin, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<"login" | "signup">("login");
  const [fadeOut, setFadeOut] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user && profile?.is_active === false) {
      toast.error("บัญชีนี้ถูกปิดใช้งานแล้ว หากคิดว่าเป็นความผิดพลาด กรุณาติดต่อแอดมิน");
      signOut();
      return;
    }
    if (!loading && user) {
      setFadeOut(true);
      setTimeout(() => navigate({ to: isAdmin ? "/admin" : "/dashboard" }), 300);
    }
  }, [user, isAdmin, profile?.is_active, loading, navigate, signOut]);

  return (
    <div className={cn("relative min-h-screen bg-background overflow-hidden transition-opacity duration-300", fadeOut && "opacity-0")}>
      <div className="ambient-blobs" aria-hidden="true" />

      <Link
        to="/"
        className="absolute top-4 left-4 z-30 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-background/80 backdrop-blur px-2.5 py-1.5 rounded-full"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> กลับหน้าแรก
      </Link>
      <div className="absolute top-4 right-4 z-30">
        <LineHeaderButton />
      </div>

      <div className="min-h-screen grid lg:grid-cols-2 gap-0">
        {/* LEFT: Banner */}
        <div className="hidden lg:block p-6 xl:p-8">
          <AuthBannerSlider className="h-full min-h-[600px]" />
        </div>

        {/* RIGHT: Form */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center mb-6 lg:hidden">
              <img src={logoUrl} alt="So1o" className="h-12 w-12 rounded-2xl object-cover shadow-elevated" />
            </div>
            <div className="hidden lg:flex items-center gap-2 mb-6">
              <img src={logoUrl} alt="So1o" className="h-10 w-10 rounded-xl object-cover shadow-soft" />
              <span className="font-semibold tracking-tight">
                So<span className="text-primary">1</span>o Freelancer
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-1">
              {tab === "login" ? "ยินดีต้อนรับกลับมา 👋" : "สร้างบัญชีใหม่"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {tab === "login"
                ? "เข้าสู่ระบบเพื่อจัดการงานฟรีแลนซ์ของคุณ"
                : "เริ่มต้นใช้งานฟรี — ใช้เวลาไม่ถึง 1 นาที"}
            </p>

            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-5">
                <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <SocialButtons />
                <Separator />
                <LoginForm onSwitch={() => setTab("signup")} signIn={signIn} />
              </TabsContent>
              <TabsContent value="signup" className="space-y-4">
                <SocialButtons />
                <Separator />
                <SignupForm onSwitch={() => setTab("login")} signUp={signUp} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <SiteFooter variant="minimal" />
      <Toaster position="top-center" richColors />
    </div>
  );
}

function Separator() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
      <div className="relative flex justify-center text-[11px]">
        <span className="bg-background px-3 text-muted-foreground">หรือเข้าด้วยอีเมล</span>
      </div>
    </div>
  );
}

function useLockout() {
  const [lockedUntil, setLockedUntil] = React.useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(sessionStorage.getItem(LOCKOUT_KEY) || 0);
  });
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    if (lockedUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [lockedUntil]);

  const remaining = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const isLocked = remaining > 0;

  function recordFail() {
    const fails = Number(sessionStorage.getItem(FAIL_KEY) || 0) + 1;
    sessionStorage.setItem(FAIL_KEY, String(fails));
    if (fails >= MAX_FAILS) {
      const until = Date.now() + LOCKOUT_SECONDS * 1000;
      sessionStorage.setItem(LOCKOUT_KEY, String(until));
      sessionStorage.setItem(FAIL_KEY, "0");
      setLockedUntil(until);
    }
  }
  function reset() {
    sessionStorage.setItem(FAIL_KEY, "0");
    sessionStorage.setItem(LOCKOUT_KEY, "0");
    setLockedUntil(0);
  }
  return { isLocked, remaining, recordFail, reset };
}

function LoginForm({
  onSwitch,
  signIn,
}: {
  onSwitch: () => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [shake, setShake] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);
  const lockout = useLockout();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lockout.isLocked) return;
    setBusy(true);
    setErrMsg(null);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      lockout.recordFail();
      setErrMsg(
        error.message.toLowerCase().includes("invalid")
          ? "อ๊ะ! รหัสผ่านไม่ถูกต้อง รบกวนเช็กอีกทีนะครับ"
          : error.message,
      );
      setShake(true);
      setTimeout(() => setShake(false), 450);
    } else {
      lockout.reset();
      if (!remember) sessionStorage.setItem("so1o_no_persist", "1");
      toast.success("ยินดีต้อนรับกลับมา!");
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", shake && "animate-input-shake")}>
      <div className="space-y-1.5">
        <Label htmlFor="login-email" className="text-xs">อีเมล</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9 h-11 rounded-lg input-so1o"
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-pass" className="text-xs">รหัสผ่าน</Label>
        <PasswordInput
          id="login-pass"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          invalid={!!errMsg}
          required
        />
      </div>

      {errMsg && <p className="text-xs text-destructive">{errMsg}</p>}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-xs">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
          จดจำฉันไว้
        </label>
        <Link to="/auth/forgot" className="text-xs text-primary hover:underline">
          ลืมรหัสผ่าน?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={busy || lockout.isLocked}
        className="w-full h-11 bg-primary hover:bg-primary/90 rounded-lg text-base font-medium"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {lockout.isLocked ? `ลองใหม่ใน ${lockout.remaining} วินาที` : "เข้าสู่ระบบ"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        ยังไม่มีบัญชี?{" "}
        <button type="button" onClick={onSwitch} className="text-primary hover:underline font-medium">
          สมัครสมาชิกที่นี่
        </button>
      </p>
    </form>
  );
}

function SignupForm({
  onSwitch,
  signUp,
}: {
  onSwitch: () => void;
  signUp: (email: string, password: string, displayName?: string, freelanceField?: string) => Promise<{ error: Error | null }>;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [field, setField] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  const emailValid = !email || /^\S+@\S+\.\S+$/.test(email.trim());
  const passValid = password.length >= 8;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!email || !emailValid || !passValid || !acceptedPolicy) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      if (!acceptedPolicy) toast.error("กรุณายอมรับนโยบายก่อนสมัคร");
      else if (!emailValid) toast.error("กรุณากรอกอีเมลให้ถูกต้อง");
      else if (!passValid) toast.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    setBusy(true);
    const { error } = await signUp(email.trim(), password, name.trim() || undefined, field || undefined);
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยัน");
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", shake && "animate-input-shake")}>
      <div className="space-y-1.5">
        <Label htmlFor="su-name" className="text-xs">ชื่อ / ชื่อร้าน</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="su-name"
            placeholder="Studio Mango"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-9 h-11 rounded-lg input-so1o"
            maxLength={80}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="su-email" className="text-xs">อีเมล</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="su-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            className={cn("pl-9 h-11 rounded-lg input-so1o", touched && !emailValid && email && "border-destructive")}
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="su-pass" className="text-xs">รหัสผ่าน (อย่างน้อย 8 ตัว)</Label>
        <PasswordInput
          id="su-pass"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched(true)}
          invalid={touched && !!password && !passValid}
          minLength={8}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">คุณทำงานฟรีแลนซ์สายไหน?</Label>
        <FreelanceFieldSelect value={field} onChange={setField} />
        <p className="text-[10px] text-muted-foreground">เพื่อให้ AI Mentor ปรับคำแนะนำให้เหมาะกับคุณ</p>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 space-y-2">
        <div className="flex gap-2">
          <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">นโยบาย Beta:</span> สิทธิ์มีจำกัด ขออนุญาตระงับสิทธิ์ผู้ที่ไม่มีความเคลื่อนไหวเกิน <span className="font-medium">7 วัน</span>
          </p>
        </div>
        <label className="flex gap-2 items-start cursor-pointer select-none">
          <Checkbox
            checked={acceptedPolicy}
            onCheckedChange={(v) => setAcceptedPolicy(v === true)}
            className="mt-0.5"
          />
          <span className="text-[11px] leading-relaxed text-foreground">
            ฉันยอมรับ{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">นโยบายความเป็นส่วนตัว</a>
            ,{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">ข้อกำหนดการใช้งาน</a>
            {" "}และนโยบายระงับสิทธิ์ Beta 7 วัน
          </span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={busy || !acceptedPolicy}
        className="w-full h-11 bg-primary hover:bg-primary/90 rounded-lg text-base font-medium"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        สมัครสมาชิก
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        มีบัญชีอยู่แล้ว?{" "}
        <button type="button" onClick={onSwitch} className="text-primary hover:underline font-medium">
          เข้าสู่ระบบ
        </button>
      </p>
    </form>
  );
}
