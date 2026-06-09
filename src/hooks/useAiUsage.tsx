import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/auth/AuthProvider";
import { fetchAiUsage } from "@/lib/aiUsage.functions";
import type { AiUsageSummary } from "@/lib/aiCredits";
import { FREE_STARTER_CREDITS } from "@/lib/aiCredits";

const EMPTY: AiUsageSummary = {
  tier: "free",
  period_key: "",
  period_end: null,
  period_type: "free_starter",
  included_used: 0,
  included_limit: FREE_STARTER_CREDITS,
  included_remaining: FREE_STARTER_CREDITS,
  purchased_balance: 0,
  total_remaining: FREE_STARTER_CREDITS,
};

export function useAiUsage() {
  const { user } = useAuth();
  const fetchFn = useServerFn(fetchAiUsage);

  const query = useQuery({
    queryKey: ["ai-usage", user?.id],
    enabled: !!user,
    queryFn: () => fetchFn(),
    staleTime: 30_000,
    retry: 1,
  });

  const data = query.data ?? EMPTY;

  return {
    ...data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    limitReached: data.total_remaining <= 0,
  };
}
