import { createFileRoute } from "@tanstack/react-router";
import { runDailyTrendsGeneration, todayISO } from "@/lib/dailyTrends.functions";
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

        try {
          const result = await runDailyTrendsGeneration(force);
          return Response.json({
            ok: true,
            date: result.date,
            itemCount: result.items.length,
            status: result.status,
          });
        } catch (e) {
          console.error("[fetch-daily-trends] error:", e);
          return Response.json({ error: "Failed to generate trends" }, { status: 500 });
        }
      },
    },
  },
});
