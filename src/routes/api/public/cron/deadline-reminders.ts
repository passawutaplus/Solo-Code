import { createFileRoute } from "@tanstack/react-router";
import { runDeadlineReminders } from "@/lib/email/deadlineReminders.server";

export const Route = createFileRoute("/api/public/cron/deadline-reminders")({
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

        try {
          const result = await runDeadlineReminders();
          return Response.json({ ok: true, ...result });
        } catch (e) {
          console.error("[cron/deadline-reminders]", e);
          return Response.json({ error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
