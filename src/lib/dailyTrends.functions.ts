import { createServerFn } from "@tanstack/react-start";
import type { DailyTrendsResponse } from "@/lib/dailyTrends.types";

export type { DailyTrendItem, DailyTrendsResponse, DailyTrendsStatus } from "@/lib/dailyTrends.types";

export const getDailyTrends = createServerFn({ method: "GET" }).handler(
  async (): Promise<DailyTrendsResponse> => {
    const { readDailyTrends } = await import("@/lib/dailyTrends.server");
    return readDailyTrends();
  },
);

export const generateDailyTrends = createServerFn({ method: "POST" }).handler(
  async (): Promise<DailyTrendsResponse> => {
    const { runDailyTrendsGeneration } = await import("@/lib/dailyTrends.server");
    return runDailyTrendsGeneration(false);
  },
);
