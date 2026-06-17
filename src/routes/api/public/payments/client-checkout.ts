import { createFileRoute } from "@tanstack/react-router";
import {
  createClientJobCheckoutSession,
  paymentsCorsPreflightHeaders,
  paymentsJsonResponse,
} from "@/lib/stripePayments.server";
import { parseClientCheckoutApiBody } from "@/lib/paymentsApiValidation";
import { ZodError } from "zod";

export const Route = createFileRoute("/api/public/payments/client-checkout")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        new Response(null, { status: 204, headers: paymentsCorsPreflightHeaders(request) }),
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return paymentsJsonResponse(request, { error: "Invalid JSON" }, 400);
        }

        let parsed;
        try {
          parsed = parseClientCheckoutApiBody(body);
        } catch (e) {
          const message = e instanceof ZodError ? e.issues[0]?.message : "Invalid input";
          return paymentsJsonResponse(request, { error: message ?? "Invalid input" }, 400);
        }

        const result = await createClientJobCheckoutSession({
          shareToken: parsed.token,
          paymentType: parsed.paymentType,
          environment: parsed.environment === "live" ? "live" : "sandbox",
          successUrl: parsed.successUrl,
          cancelUrl: parsed.cancelUrl,
        });

        if ("error" in result) {
          return paymentsJsonResponse(request, result, 400);
        }
        return paymentsJsonResponse(request, result);
      },
    },
  },
});
