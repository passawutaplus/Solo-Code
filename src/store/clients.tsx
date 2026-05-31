import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";

export interface SavedClient {
  id: string;
  name: string;
  // Contact channels
  phone?: string;
  lineId?: string;
  email?: string;
  social?: string;
  // Billing
  address?: string;
  taxId?: string;
  // Freelancer-friendly metadata
  type?: "individual" | "company";
  industry?: string;
  preferredChannel?: "line" | "phone" | "email" | "social";
  paymentTerms?: string;
  rate?: number;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export type SavedClientInput = Omit<SavedClient, "id" | "createdAt">;

// ===== Mappers between DB row <-> UI shape =====

interface ClientRow {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  line_id: string | null;
  email: string | null;
  social: string | null;
  address: string | null;
  tax_id: string | null;
  type: string | null;
  industry: string | null;
  preferred_channel: string | null;
  payment_terms: string | null;
  rate: number | null;
  notes: string | null;
  tags: string[];
  created_at: string;
}

function rowToClient(r: ClientRow): SavedClient {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? undefined,
    lineId: r.line_id ?? undefined,
    email: r.email ?? undefined,
    social: r.social ?? undefined,
    address: r.address ?? undefined,
    taxId: r.tax_id ?? undefined,
    type: (r.type as SavedClient["type"]) ?? undefined,
    industry: r.industry ?? undefined,
    preferredChannel: (r.preferred_channel as SavedClient["preferredChannel"]) ?? undefined,
    paymentTerms: r.payment_terms ?? undefined,
    rate: r.rate ?? undefined,
    notes: r.notes ?? undefined,
    tags: r.tags ?? [],
    createdAt: r.created_at,
  };
}

function clientToInsert(c: SavedClientInput, userId: string) {
  return {
    user_id: userId,
    name: c.name,
    phone: c.phone || null,
    line_id: c.lineId || null,
    email: c.email || null,
    social: c.social || null,
    address: c.address || null,
    tax_id: c.taxId || null,
    type: c.type || null,
    industry: c.industry || null,
    preferred_channel: c.preferredChannel || null,
    payment_terms: c.paymentTerms || null,
    rate: c.rate ?? null,
    notes: c.notes || null,
    tags: c.tags ?? [],
  };
}

function clientToUpdate(p: Partial<SavedClient>) {
  const out: Partial<Omit<ClientRow, "id" | "user_id" | "created_at">> = {};
  if (p.name !== undefined) out.name = p.name;
  if (p.phone !== undefined) out.phone = p.phone || null;
  if (p.lineId !== undefined) out.line_id = p.lineId || null;
  if (p.email !== undefined) out.email = p.email || null;
  if (p.social !== undefined) out.social = p.social || null;
  if (p.address !== undefined) out.address = p.address || null;
  if (p.taxId !== undefined) out.tax_id = p.taxId || null;
  if (p.type !== undefined) out.type = p.type || null;
  if (p.industry !== undefined) out.industry = p.industry || null;
  if (p.preferredChannel !== undefined) out.preferred_channel = p.preferredChannel || null;
  if (p.paymentTerms !== undefined) out.payment_terms = p.paymentTerms || null;
  if (p.rate !== undefined) out.rate = p.rate ?? null;
  if (p.notes !== undefined) out.notes = p.notes || null;
  if (p.tags !== undefined) out.tags = p.tags ?? [];
  return out;
}

export function clientsKey(userId: string | null) {
  return ["saved_clients", userId] as const;
}

// ===== Hook =====

export function useClients() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: clientsKey(userId),
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("saved_clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => rowToClient(r as ClientRow));
    },
  });

  const addMutation = useMutation({
    mutationFn: async (c: SavedClientInput) => {
      if (!userId) throw new Error("ต้องเข้าสู่ระบบก่อน");
      const { data, error } = await supabase
        .from("saved_clients")
        .insert(clientToInsert(c, userId))
        .select()
        .single();
      if (error) throw error;
      return rowToClient(data as ClientRow);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clientsKey(userId) }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<SavedClient> }) => {
      const { error } = await supabase
        .from("saved_clients")
        .update(clientToUpdate(patch))
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clientsKey(userId) }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clientsKey(userId) }),
  });

  return React.useMemo(
    () => ({
      list: query.data ?? [],
      isLoading: query.isLoading,
      isError: query.isError,
      add: (c: SavedClientInput) => addMutation.mutateAsync(c),
      update: (id: string, patch: Partial<SavedClient>) =>
        updateMutation.mutateAsync({ id, patch }),
      remove: (id: string) => removeMutation.mutateAsync(id),
    }),
    [query.data, query.isLoading, query.isError, addMutation, updateMutation, removeMutation],
  );
}

/**
 * Backward-compat shim — components currently wrap with <ClientsProvider>.
 * No longer needed (React Query handles state) but kept as no-op to avoid breakage.
 */
export function ClientsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
