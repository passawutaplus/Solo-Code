import { createFileRoute } from "@tanstack/react-router";
import {
  cacheDailyTrends,
  fetchAndSummarizeTrends,
  todayISO,
} from "@/lib/dailyTrends.functions";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/cron/fetch-daily-trends")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.slice("Bearer ".length).trim();
        if (token !== supabaseServiceKey) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const date = todayISO();
        const force = new URL(request.url).searchParams.get("force") === "1";

        if (!force) {
          const { data: cached } = await supabaseAdmin
            .from("dashboard_daily_trends")
            .select("items")
            .eq("trend_date", date)
            .maybeSingle();

          if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
            return Response.json({
              ok: true,
              skipped: true,
              date,
              itemCount: cached.items.length,
            });
          }
        }

        const { items, feedCount, source } = await fetchAndSummarizeTrends();

        try {
          await cacheDailyTrends(date, items);
        } catch (e) {
          console.error("[fetch-daily-trends] cache error:", e);
          return Response.json({ error: "Failed to cache trends" }, { status: 500 });
        }

        return Response.json({
          ok: true,
          date,
          itemCount: items.length,
          feedCount,
          source,
        });
      },
    },
  },
});
