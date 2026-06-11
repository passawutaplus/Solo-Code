import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DailyTrendsResponse } from "@/lib/dailyTrends.types";

export type { DailyTrendItem, DailyTrendsResponse, DailyTrendsStatus } from "@/lib/dailyTrends.types";

export const getDailyTrends = createServerFn({ method: "GET" }).handler(
  async (): Promise<DailyTrendsResponse> => {
    const { readDailyTrends } = await import("@/lib/dailyTrends.server");
    return readDailyTrends();
  },
);

/** Authenticated warm-up only — expensive RSS+AI work must not be public. */
export const generateDailyTrends = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<DailyTrendsResponse> => {
    const { runDailyTrendsGeneration } = await import("@/lib/dailyTrends.server");
    return runDailyTrendsGeneration(false);
  });
