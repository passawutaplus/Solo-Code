import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { acceptInhouseInviteFn, createInhouseInviteFn } from "@/server/inhouseInvite.functions";
import type { InhouseOrg, InhouseOrgMember } from "@/lib/inhouse/types";

const inhouseFrom = (table: string) => (supabase as unknown as { from: (t: string) => ReturnType<typeof supabase.from> }).from(table);

async function fetchMemberProfiles(members: InhouseOrgMember[]): Promise<InhouseOrgMember[]> {
  const userIds = [...new Set(members.map((m) => m.user_id))];
  if (userIds.length === 0) return members;
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url, email")
    .in("user_id", userIds);
  const map = new Map((profiles ?? []).map((p) => [p.user_id, p]));
  return members.map((m) => ({
    ...m,
    profile: map.get(m.user_id)
      ? {
          display_name: map.get(m.user_id)!.display_name,
          avatar_url: map.get(m.user_id)!.avatar_url,
          email: map.get(m.user_id)!.email,
        }
      : undefined,
  }));
}

export function useMyInhouseOrgs() {
  const { user } = useAuth();
  const { profileTier } = useSubscription();
  const isProInhouse = profileTier === "inhouse";

  return useQuery({
    queryKey: ["inhouse-orgs", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const orgs: InhouseOrg[] = [];

      if (isProInhouse) {
        const { data: owned, error: ownedErr } = await inhouseFrom("inhouse_orgs")
          .select("*")
          .eq("owner_id", user!.id);
        if (ownedErr && !ownedErr.message.includes("does not exist")) throw ownedErr;
        if (owned) orgs.push(...(owned as InhouseOrg[]));
      }

      const { data: memberships, error: memErr } = await inhouseFrom("inhouse_org_members")
        .select("org_id")
        .eq("user_id", user!.id)
        .eq("status", "active");
      if (memErr && !memErr.message.includes("does not exist")) throw memErr;

      const memberOrgIds = (memberships ?? []).map((m: { org_id: string }) => m.org_id);
      const missingIds = memberOrgIds.filter((id) => !orgs.some((o) => o.id === id));
      if (missingIds.length > 0) {
        const { data: memberOrgs, error } = await inhouseFrom("inhouse_orgs")
          .select("*")
          .in("id", missingIds);
        if (error && !error.message.includes("does not exist")) throw error;
        if (memberOrgs) orgs.push(...(memberOrgs as InhouseOrg[]));
      }

      return orgs;
    },
  });
}

export function useInhouseOrgBySlug(orgSlug: string | undefined) {
  return useQuery({
    queryKey: ["inhouse-org", orgSlug],
    enabled: !!orgSlug,
    queryFn: async () => {
      const { data, error } = await inhouseFrom("inhouse_orgs")
        .select("*")
        .eq("slug", orgSlug!)
        .maybeSingle();
      if (error) throw error;
      return data as InhouseOrg | null;
    },
  });
}

export function useInhouseOrgMembers(orgId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["inhouse-members", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await inhouseFrom("inhouse_org_members")
        .select("*")
        .eq("org_id", orgId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return fetchMemberProfiles(data as InhouseOrgMember[]);
    },
  });

  useEffect(() => {
    if (!orgId) return;
    const ch = supabase
      .channel(`inhouse-members-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inhouse_org_members", filter: `org_id=eq.${orgId}` },
        () => queryClient.invalidateQueries({ queryKey: ["inhouse-members", orgId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [orgId, queryClient]);

  return query;
}

export function useMyInhouseMembership(orgId: string | undefined) {
  const { user } = useAuth();
  const { data: members } = useInhouseOrgMembers(orgId);
  return members?.find((m) => m.user_id === user?.id && m.status === "active");
}

export function useCreateInhouseOrg() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (opts: { name: string; workspaceName?: string }) => {
      const { data, error } = await supabase.rpc("create_inhouse_org", {
        _name: opts.name,
        _workspace_name: opts.workspaceName ?? "General",
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inhouse-orgs", user?.id] });
    },
  });
}

export function useUpdateInhouseOrg() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (opts: { id: string; name?: string; avatar_url?: string | null; settings?: Record<string, unknown> }) => {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (opts.name !== undefined) patch.name = opts.name;
      if (opts.avatar_url !== undefined) patch.avatar_url = opts.avatar_url;
      if (opts.settings !== undefined) patch.settings = opts.settings;
      const { data, error } = await inhouseFrom("inhouse_orgs").update(patch).eq("id", opts.id).select("*").single();
      if (error) throw error;
      return data as InhouseOrg;
    },
    onSuccess: (org) => {
      qc.invalidateQueries({ queryKey: ["inhouse-org", org.slug] });
      qc.invalidateQueries({ queryKey: ["inhouse-orgs"] });
    },
  });
}

export function useRemoveInhouseMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (opts: { memberId: string; orgId: string }) => {
      const { error } = await inhouseFrom("inhouse_org_members")
        .update({ status: "removed", removed_at: new Date().toISOString() })
        .eq("id", opts.memberId)
        .eq("org_id", opts.orgId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["inhouse-members", vars.orgId] });
    },
  });
}

export function useCreateInhouseInvite() {
  const qc = useQueryClient();
  const createInviteFn = useServerFn(createInhouseInviteFn);

  return useMutation({
    mutationFn: async (opts: {
      orgId: string;
      role?: InhouseOrgMember["role"];
      email?: string;
      workspaceIds?: string[];
    }) => {
      return createInviteFn({
        data: {
          orgId: opts.orgId,
          role: opts.role,
          email: opts.email,
          workspaceIds: opts.workspaceIds,
        },
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["inhouse-invites", vars.orgId] });
    },
  });
}

export function useInhouseInvites(orgId: string | undefined) {
  return useQuery({
    queryKey: ["inhouse-invites", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await inhouseFrom("inhouse_invites")
        .select("*")
        .eq("org_id", orgId!)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAcceptInhouseInvite() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const acceptInviteFn = useServerFn(acceptInhouseInviteFn);

  return useMutation({
    mutationFn: async (token: string) => {
      return acceptInviteFn({ data: { token } }) as Promise<string>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inhouse-orgs", user?.id] });
      qc.invalidateQueries({ queryKey: ["inhouse-pending-invites", user?.id] });
    },
  });
}

export interface PendingInhouseInvite {
  id: string;
  org_id: string;
  token: string;
  email: string | null;
  role: InhouseOrgMember["role"];
  expires_at: string;
  org_name: string;
  org_slug: string;
}

export function usePendingInhouseInvites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["inhouse-pending-invites", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_pending_inhouse_invites");
      if (error) {
        if (error.message.includes("does not exist") || error.message.includes("Could not find")) {
          return [] as PendingInhouseInvite[];
        }
        throw error;
      }
      return (data ?? []) as PendingInhouseInvite[];
    },
  });
}
