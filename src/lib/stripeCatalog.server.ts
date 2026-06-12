import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { StripeEnv } from "@/lib/stripe.server";

type CatalogFile = {
  mode?: string;
  products?: Record<string, { prices?: Record<string, string> }>;
};

let cached: Partial<Record<StripeEnv, CatalogFile | null>> = {};

function catalogPath(env: StripeEnv): string {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const name = env === "live" ? "catalog.live.json" : "catalog.sandbox.json";
  return join(root, "scripts/stripe", name);
}

function loadCatalog(env: StripeEnv): CatalogFile | null {
  if (cached[env] !== undefined) return cached[env] ?? null;
  const path = catalogPath(env);
  if (!existsSync(path)) {
    cached[env] = null;
    return null;
  }
  try {
    cached[env] = JSON.parse(readFileSync(path, "utf8")) as CatalogFile;
    return cached[env] ?? null;
  } catch {
    cached[env] = null;
    return null;
  }
}

/** Resolve Stripe Price id from synced catalog JSON (fallback when lookup_key list is empty). */
export function getCatalogStripePriceId(env: StripeEnv, lookupKey: string): string | null {
  const catalog = loadCatalog(env);
  if (!catalog?.products) return null;
  for (const group of Object.values(catalog.products)) {
    const id = group.prices?.[lookupKey];
    if (id) return id;
  }
  return null;
}
