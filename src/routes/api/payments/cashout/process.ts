import { createFileRoute } from "@tanstack/react-router";
import {
  authenticateBearerToken,
  processCashoutTransferForAdmin,
  paymentsJsonResponse,
  PAYMENTS_CORS_HEADERS,
} from "@/lib/stripePayments.server";
import { parseCashoutProcessApiBody } from "@/lib/paymentsApiValidation";
import { ZodError } from "zod";

export const Route = createFileRoute("/api/payments/cashout/process")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: PAYMENTS_CORS_HEADERS }),
      POST: async ({ request }) => {
        const auth = await authenticateBearerToken(request);
        if ("error" in auth) {
          return paymentsJsonResponse({ error: auth.error }, auth.status);
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return paymentsJsonResponse({ error: "Invalid JSON" }, 400);
        }

        let parsed;
        try {
          parsed = parseCashoutProcessApiBody(body);
        } catch (e) {
          const message = e instanceof ZodError ? e.issues[0]?.message : "Invalid input";
          return paymentsJsonResponse({ error: message ?? "Invalid input" }, 400);
        }

        const result = await processCashoutTransferForAdmin({
          adminUserId: auth.userId,
          cashoutId: parsed.cashoutId,
          environment: parsed.environment === "live" ? "live" : "sandbox",
        });

        if ("error" in result) {
          return paymentsJsonResponse(result, 400);
        }
        return paymentsJsonResponse(result);
      },
    },
  },
});
