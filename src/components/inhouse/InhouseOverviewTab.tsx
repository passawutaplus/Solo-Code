import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInhouseOrgMembers } from "@/hooks/inhouse/useInhouseOrg";
import { useInhouseActivity, useInhouseMonitor } from "@/hooks/inhouse/useInhouseMonitor";
import { useInhouseTasks } from "@/hooks/inhouse/useInhouseTasks";
import type { InhouseOrg, InhouseWorkspace } from "@/lib/inhouse/types";
import { InhousePipelineBridge } from "@/components/inhouse/InhousePhase2Extras";
import { useCreateWorkspaceFromQuotation } from "@/hooks/inhouse/useInhouseWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { Activity, CheckCircle2, Clock, Users } from "lucide-react";

interface Props {
  org: InhouseOrg;
  workspace: InhouseWorkspace;
}

export function InhouseOverviewTab({ org, workspace }: Props) {
  const createFromQuote = useCreateWorkspaceFromQuotation();
  const { data: members = [] } = useInhouseOrgMembers(org.id);
  const { data: tasks = [] } = useInhouseTasks(workspace.id);
  const { data: activity = [] } = useInhouseActivity(org.id, workspace.id);
  const { taskStats } = useInhouseMonitor(org.id, org.slug, workspace.id);

  const activeCount = members.filter((m) => m.status === "active").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{workspace.name}</h2>
        {workspace.description && (
          <p className="mt-1 text-sm text-muted-foreground">{workspace.description}</p>
        )}
      </div>

      <InhousePipelineBridge
        orgId={org.id}
        linkedQuotationId={workspace.linked_quotation_id}
        onCreateFromQuotation={async () => {
          const { data: q } = await supabase
            .from("quotations")
            .select("id, project_title, client_name")
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (!q) return;
          await createFromQuote.mutateAsync({
            orgId: org.id,
            quotationId: q.id,
            title: q.project_title || q.client_name || "Client project",
          });
        }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">สมาชิก</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-xs text-muted-foreground">
              {activeCount} / {org.seat_limit} seats
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">กำลังทำ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{taskStats.inProgress}</p>
            <p className="text-xs text-muted-foreground">จาก {tasks.length} tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เสร็จแล้ว</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{taskStats.done}</p>
            {taskStats.overdue > 0 && (
              <p className="text-xs text-destructive">{taskStats.overdue} เลยกำหนด</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              กิจกรรมล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีกิจกรรม</p>
            ) : (
              activity.slice(0, 8).map((ev) => (
                <div key={ev.id} className="flex items-start gap-2 text-sm">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={ev.user?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {(ev.user?.display_name ?? "?").slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p>
                      <span className="font-medium">{ev.user?.display_name ?? "Someone"}</span>{" "}
                      <span className="text-muted-foreground">{formatEvent(ev.event_type)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ev.created_at).toLocaleString("th-TH")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">สมาชิกในทีม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {members
              .filter((m) => m.status === "active")
              .map((m) => (
                <div key={m.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={m.profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{(m.profile?.display_name ?? "?").slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {m.profile?.display_name ?? m.profile?.email ?? "Member"}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">{m.role}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatEvent(type: string): string {
  const map: Record<string, string> = {
    task_created: "สร้าง task",
    task_moved: "ย้าย task",
    task_completed: "เสร็จ task",
    task_deleted: "ลบ task",
    message_sent: "ส่งข้อความ",
    member_joined: "เข้าร่วมทีม",
    workspace_created: "สร้าง workspace",
    org_created: "สร้าง org",
    workspace_view: "เปิด workspace",
  };
  return map[type] ?? type;
}
