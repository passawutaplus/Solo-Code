import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/NotificationBell";
import { LineHeaderButton } from "@/components/LineContactButton";
import { useTheme } from "@/hooks/useTheme";
import logoUrl from "@/assets/solo-freelancer-logo.webp";

interface Props {
  user: { id: string } | null;
  isAdmin?: boolean;
}

const LINKS = [
  { href: "#features", label: "ฟีเจอร์" },
  { href: "#pricing", label: "ราคา" },
  { href: "/labs", label: "Labs", route: true as const },
] as const;

export function LandingNav({ user, isAdmin }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 glass border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src={logoUrl}
            alt="So1o Freelancer"
            width={36}
            height={36}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="h-9 w-9 rounded-xl object-cover shadow-soft ring-1 ring-border"
          />
          <span className="text-sm sm:text-base font-semibold tracking-tight hidden sm:inline">
            So<span className="text-primary">1</span>o
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors font-medium text-foreground">
            หน้าแรก
          </a>
          {LINKS.map((l) =>
            "route" in l && l.route ? (
              <Link key={l.href} to={l.href} className="hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">
                {l.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggle}
            aria-label={theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
            className="h-8 w-8 rounded-full"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <LineHeaderButton />
          {user && <NotificationBell />}
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-2 text-xs font-semibold"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground px-3.5 py-2 text-xs font-semibold shadow-elevated"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">แดชบอร์ด</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground px-3.5 py-2 text-xs font-semibold shadow-elevated"
            >
              <LogIn className="h-3.5 w-3.5" /> เข้าสู่ระบบ
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" size="icon" variant="ghost" aria-label="เมนู" className="md:hidden h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] glass">
              <SheetHeader>
                <SheetTitle className="text-left text-base">เมนู</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1 text-sm">
                <a href="#" className="px-3 py-2.5 rounded-lg bg-accent font-medium">
                  หน้าแรก
                </a>
                <a href="#features" className="px-3 py-2.5 rounded-lg hover:bg-accent">
                  ฟีเจอร์
                </a>
                <a href="#pricing" className="px-3 py-2.5 rounded-lg hover:bg-accent">
                  ราคา
                </a>
                <Link to="/labs" className="px-3 py-2.5 rounded-lg hover:bg-accent">
                  Labs
                </Link>
                <Link
                  to={user ? "/dashboard" : "/auth"}
                  className="mt-3 inline-flex justify-center rounded-full bg-gradient-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold"
                >
                  {user ? "แดชบอร์ด" : "เข้าสู่ระบบ"}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
