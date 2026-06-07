import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Newspaper,
  Compass,
  Lightbulb,
  FileText,
  Workflow,
  CalendarDays,
  ListTodo,
  MessageSquare,
  Calculator,
  Coins,
  CreditCard,
  Users,
  Truck,
  FolderOpen,
  Settings,
  Rocket,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Briefcase,
  Wallet,
  Database,
  Kanban,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/solo-freelancer-logo.webp";
import { useSubscription } from "@/hooks/useSubscription";

export type DashSection = "overview" | "trends" | "inspire" | "finance" | "planner" | "mydata" | "settings";

interface DashboardSidebarProps {
  active: DashSection;
  activeSub?: string;
  setActive: (s: DashSection, sub?: string) => void;
}

interface NavLeaf {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: DashSection;
  sub?: string;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavLeaf[];
}

const GROUPS: NavGroup[] = [
  {
    label: "งานลูกค้า",
    icon: Briefcase,
    items: [
      { label: "Pipeline", icon: Kanban, section: "finance", sub: "pipeline" },
      { label: "Smart Brief", icon: Lightbulb, section: "planner", sub: "briefs" },
      { label: "Quotation", icon: FileText, section: "finance", sub: "quotations" },
      { label: "Job tracker", icon: Workflow, section: "finance", sub: "jobs" },
    ],
  },
  {
    label: "การเงิน",
    icon: Wallet,
    items: [
      { label: "รายได้", icon: Coins, section: "finance", sub: "income" },
      { label: "ภาษี", icon: Calculator, section: "finance", sub: "tax" },
      { label: "Subscription", icon: CreditCard, section: "finance", sub: "subs" },
    ],
  },
  {
    label: "วางแผน",
    icon: CalendarDays,
    items: [
      { label: "Content", icon: CalendarDays, section: "planner", sub: "content" },
      { label: "To Do List", icon: ListTodo, section: "planner", sub: "projects" },
      { label: "Feedback", icon: MessageSquare, section: "planner", sub: "feedback" },
    ],
  },
  {
    label: "ข้อมูล",
    icon: Database,
    items: [
      { label: "Client", icon: Users, section: "mydata", sub: "clients" },
      { label: "Suppliers", icon: Truck, section: "mydata", sub: "suppliers" },
      { label: "Assets", icon: FolderOpen, section: "mydata", sub: "assets" },
    ],
  },
  {
    label: "อื่นๆ",
    icon: Compass,
    items: [
      { label: "ข่าวสาร & เทรนด์", icon: Newspaper, section: "trends" },
      { label: "Inspire", icon: Compass, section: "inspire" },
    ],
  },
];

const MENU_BTN =
  "gap-2.5 text-white hover:bg-white/15 hover:text-white data-[active=true]:bg-white/25 data-[active=true]:text-white";

const SUB_BTN =
  "text-white/90 hover:bg-white/15 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white border-white/20";

const SIDEBAR_STYLE = {
  "--sidebar-background": "transparent",
  "--sidebar-foreground": "#ffffff",
  "--sidebar-accent": "rgba(255,255,255,0.20)",
  "--sidebar-accent-foreground": "#ffffff",
  "--sidebar-border": "rgba(255,255,255,0.18)",
  "--sidebar-ring": "rgba(255,255,255,0.4)",
} as React.CSSProperties;

function groupHasActiveItem(
  group: NavGroup,
  active: DashSection,
  activeSub?: string,
): boolean {
  return group.items.some(
    (leaf) => active === leaf.section && (leaf.sub ? activeSub === leaf.sub : true),
  );
}

function NavCollapsibleGroup({
  group,
  collapsed,
  active,
  activeSub,
  setActive,
}: {
  group: NavGroup;
  collapsed: boolean;
  active: DashSection;
  activeSub?: string;
  setActive: (s: DashSection, sub?: string) => void;
}) {
  const hasActiveChild = groupHasActiveItem(group, active, activeSub);
  const [open, setOpen] = React.useState(hasActiveChild);
  const GroupIcon = group.icon;

  React.useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  const isLeafActive = (leaf: NavLeaf) =>
    active === leaf.section && (leaf.sub ? activeSub === leaf.sub : true);

  if (collapsed) {
    const target = group.items.find((leaf) => isLeafActive(leaf)) ?? group.items[0];
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={hasActiveChild}
          onClick={() => setActive(target.section, target.sub)}
          tooltip={group.label}
          className={MENU_BTN}
        >
          <GroupIcon className="h-4 w-4 shrink-0" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={hasActiveChild}
            className={cn(MENU_BTN, "w-full")}
            tooltip={group.label}
          >
            <GroupIcon className="h-4 w-4 shrink-0" />
            <span className="text-xs font-medium truncate flex-1 text-left">{group.label}</span>
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-white/70 transition-transform duration-200",
                "group-data-[state=open]/collapsible:rotate-90",
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-white/20 mx-0 translate-x-0 px-1">
            {group.items.map((leaf) => {
              const Icon = leaf.icon;
              const activeLeaf = isLeafActive(leaf);
              return (
                <SidebarMenuSubItem key={leaf.label}>
                  <SidebarMenuSubButton
                    asChild
                    size="sm"
                    isActive={activeLeaf}
                    className={SUB_BTN}
                  >
                    <button
                      type="button"
                      onClick={() => setActive(leaf.section, leaf.sub)}
                      className="w-full"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                      <span>{leaf.label}</span>
                    </button>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function DashboardSidebar({ active, activeSub, setActive }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  React.useEffect(() => {
    document.body.classList.add("dash-sidebar-gradient");
    return () => document.body.classList.remove("dash-sidebar-gradient");
  }, []);

  return (
    <Sidebar collapsible="icon" className="border-r-0" style={SIDEBAR_STYLE}>
      <SidebarHeader className="border-b border-white/15">
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <div className="shrink-0 rounded-xl bg-white p-1 shadow-soft">
            <img src={logoUrl} alt="So1o" className="h-7 w-7 rounded-md object-cover" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight truncate text-white">
                So<span className="text-white">1</span>o Freelancer
              </div>
              <p className="text-[10px] text-white/80 mt-0.5 truncate">My Desk</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0.5">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={active === "overview"}
                  onClick={() => setActive("overview")}
                  tooltip="Dashboard"
                  className={cn(MENU_BTN, "font-semibold")}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="text-xs">Dashboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {GROUPS.map((group) => (
                <NavCollapsibleGroup
                  key={group.label}
                  group={group}
                  collapsed={collapsed}
                  active={active}
                  activeSub={activeSub}
                  setActive={setActive}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/15 gap-2">
        <ProPlanCard collapsed={collapsed} />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={active === "settings"}
              onClick={() => setActive("settings")}
              tooltip="Setting"
              className={MENU_BTN}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-xs font-medium">Setting</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ProPlanCard({ collapsed }: { collapsed: boolean }) {
  const { tier, isLoading } = useSubscription();
  const isPro = tier === "pro";

  if (collapsed) {
    return (
      <Link
        to="/pricing"
        title={isPro ? "Pro Member" : "อัพเกรด Pro"}
        className={`mx-auto h-9 w-9 rounded-full flex items-center justify-center shadow-soft transition-transform hover:scale-105 ${
          isPro ? "bg-gradient-to-br from-primary to-orange-400 text-white" : "bg-white text-primary"
        }`}
      >
        {isPro ? <CheckCircle2 className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
      </Link>
    );
  }

  if (isLoading) {
    return <div className="h-[68px] w-full rounded-xl bg-white/10 animate-pulse" />;
  }

  if (isPro) {
    return (
      <Link
        to="/pricing"
        className="block w-full rounded-xl bg-white shadow-soft p-3 text-center hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-center gap-1.5 text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-bold">Pro Member</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">จัดการ subscription</p>
      </Link>
    );
  }

  return (
    <Link
      to="/pricing"
      className="block w-full rounded-xl bg-gradient-to-br from-primary to-orange-400 text-white shadow-soft p-3 text-center hover:shadow-lg hover:scale-[1.02] transition-all"
    >
      <div className="flex items-center justify-center gap-1.5">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-bold">อัพเกรด Pro</span>
      </div>
      <p className="text-[10px] text-white/90 mt-0.5">เริ่มต้น 249฿/เดือน · ฟรี 1 ปีสำหรับ 100 คนแรก</p>
    </Link>
  );
}
