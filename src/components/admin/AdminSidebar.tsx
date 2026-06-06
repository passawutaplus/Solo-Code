import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  
  Activity,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Database,
  Rocket,
  BarChart3,
  CreditCard,
  Megaphone,
  MessageSquare,
  Ticket,
  LineChart,
  BookOpen,
  Smartphone,
  Sparkles,
  Image as ImageIcon,
  
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import logoUrl from "@/assets/solo-freelancer-logo.webp";
import { Button } from "@/components/ui/button";

export type AdminSection =
  | "overview"
  | "early_access"
  | "users"
  | "chat"
  | "tickets"
  | "announcements"
  | "banners"
  | "articles"
  | "business"
  | "subscriptions"
  | "feature_usage"
  | "activity"
  | "device"
  | "ai_center"
  | "health"
  | "usage";

interface SectionItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sub: string;
  badge?: number;
}

const GROUPS: { label: string; items: SectionItem[] }[] = [
  {
    label: "ภาพรวม",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, sub: "ภาพรวมระบบ" },
      { id: "early_access", label: "Early Access", icon: Rocket, sub: "Tester 100 คน" },
    ],
  },
  {
    label: "ผู้ใช้ & แชท",
    items: [
      { id: "users", label: "Users & Growth", icon: Users, sub: "สมาชิก / สิทธิ์" },
      { id: "chat", label: "แชทผู้ใช้", icon: MessageSquare, sub: "ตอบกลับผู้ใช้" },
      { id: "tickets", label: "Tickets", icon: Ticket, sub: "ตั๋วแจ้งปัญหา" },
    ],
  },
  {
    label: "คอนเทนต์ & การตลาด",
    items: [
      { id: "announcements", label: "ประกาศ", icon: Megaphone, sub: "บอกผู้ใช้ทุกคน" },
      { id: "banners", label: "แบนเนอร์", icon: ImageIcon, sub: "Login + Dashboard" },
      { id: "articles", label: "บทความ / Blog", icon: BookOpen, sub: "Content & SEO" },
    ],
  },
  {
    label: "Insights & การเงิน",
    items: [
      { id: "business", label: "Business KPIs", icon: Wallet, sub: "รายได้ / ใบเสนอ" },
      { id: "subscriptions", label: "Subscriptions", icon: CreditCard, sub: "Subs + Top Apps" },
      { id: "feature_usage", label: "Feature Usage", icon: BarChart3, sub: "ฟีเจอร์ยอดนิยม" },
      { id: "activity", label: "Activity Stats", icon: LineChart, sub: "เข้าใช้กี่โมง/วันไหน" },
      { id: "device", label: "อุปกรณ์ที่ใช้", icon: Smartphone, sub: "Mobile / Tablet / Desktop" },
    ],
  },
  {
    label: "AI & ระบบ",
    items: [
      { id: "ai_center", label: "AI Center", icon: Sparkles, sub: "Control + Price + HQ" },
      { id: "health", label: "System Health", icon: Activity, sub: "Activity feed" },
      { id: "usage", label: "Storage & Quota", icon: Database, sub: "ใช้พื้นที่เท่าไหร่" },
    ],
  },
];

export function AdminSidebar({
  active,
  setActive,
  onRefresh,
  refreshing,
  ticketBadge = 0,
}: {
  active: AdminSection;
  setActive: (s: AdminSection) => void;
  onRefresh: () => void;
  refreshing: boolean;
  ticketBadge?: number;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    // Default: only "ภาพรวม" expanded, rest collapsed to reduce clutter
    return Object.fromEntries(GROUPS.map((g, i) => [g.label, i === 0]));
  });
  const toggleGroup = (label: string) =>
    setOpenGroups((s) => ({ ...s, [label]: !s[label] }));

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <img
            src={logoUrl}
            alt="logo"
            className="h-9 w-9 rounded-xl object-cover shadow-soft ring-1 ring-border shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-sm font-semibold tracking-tight truncate">Mission Control</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Solo founder mode</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((g) => {
          const isOpen = collapsed || openGroups[g.label];
          return (
          <SidebarGroup key={g.label}>
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleGroup(g.label)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hover:text-foreground transition-colors"
              >
                <span>{g.label}</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                />
              </button>
            )}
            {isOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((s) => {
                  const Icon = s.icon;
                  const isActive = active === s.id;
                  const badge = s.id === "tickets" ? ticketBadge : s.badge;
                  return (
                    <SidebarMenuItem key={s.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setActive(s.id)}
                        tooltip={s.label}
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <span className="text-xs font-medium truncate flex items-center gap-1.5 w-full">
                              {s.label}
                              {badge != null && badge > 0 && (
                                <span className="ml-auto inline-flex min-w-4 h-4 px-1 rounded-full bg-[#FF5F05] text-white text-[9px] font-bold items-center justify-center">
                                  {badge > 99 ? "99+" : badge}
                                </span>
                              )}
                            </span>
                            <span className="text-[9px] text-muted-foreground truncate">{s.sub}</span>
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            )}
          </SidebarGroup>
          );
        })}
        <SidebarGroup>
          <SidebarGroupLabel>ทางลัด</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="กลับหน้าฟีด">
                  <Link to="/" className="gap-2">
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="text-xs">หน้าฟีด</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ไป Dashboard ผู้ใช้">
                  <Link to="/dashboard" className="gap-2">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="text-xs">My Desk</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          disabled={refreshing}
          className="w-full justify-start gap-2 h-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {!collapsed && <span className="text-xs">รีเฟรชข้อมูล</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
