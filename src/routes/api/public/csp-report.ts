import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sanitizeText } from "@/lib/security";

const ReportSchema = z.object({
  "csp-report": z
    .object({
      "document-uri": z.string().max(500).optional(),
      "blocked-uri": z.string().max(500).optional(),
      "violated-directive": z.string().max(200).optional(),
      "effective-directive": z.string().max(200).optional(),
      "source-file": z.string().max(500).optional(),
      "line-number": z.number().int().optional(),
      "column-number": z.number().int().optional(),
      disposition: z.string().max(32).optional(),
    })
    .optional(),
  blockedURI: z.string().max(500).optional(),
  violatedDirective: z.string().max(200).optional(),
  effectiveDirective: z.string().max(200).optional(),
  sourceFile: z.string().max(500).optional(),
  lineNumber: z.number().int().optional(),
  columnNumber: z.number().int().optional(),
  disposition: z.string().max(32).optional(),
});

const ipCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const row = ipCounts.get(ip);
  if (!row || now > row.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  row.count += 1;
  return row.count > RATE_LIMIT;
}

export const Route = createFileRoute("/api/public/csp-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown";
        if (isRateLimited(ip)) {
          return new Response(null, { status: 429 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return new Response(null, { status: 400 });
        }

        const parsed = ReportSchema.safeParse(raw);
        if (!parsed.success) return new Response(null, { status: 400 });

        const legacy = parsed.data;
        const nested = legacy["csp-report"];
        const blocked = nested?.["blocked-uri"] ?? legacy.blockedURI ?? "";
        const directive = nested?.["violated-directive"] ?? legacy.violatedDirective ?? "";
        const source = nested?.["source-file"] ?? legacy.sourceFile ?? "";
        const doc = nested?.["document-uri"] ?? "";

        const message = [
          "CSP violation",
          doc ? `doc: ${doc}` : null,
          blocked ? `blocked: ${blocked}` : null,
          directive ? `directive: ${directive}` : null,
          source ? `source: ${source}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        try {
          await (supabaseAdmin as any).from("beta_feedback").insert({
            feature: "csp_violation",
            message: sanitizeText(message, 2000),
            user_email: null,
            rating: null,
          });
        } catch (e) {
          console.error("[csp-report] insert failed", e);
        }

        return new Response(null, { status: 204 });
      },
    },
  },
});
