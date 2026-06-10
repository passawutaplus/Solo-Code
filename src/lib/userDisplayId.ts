import { LEGAL } from "@/lib/legalMeta";

/** Stable short customer code from auth user id (e.g. S4F2A1B8). */
export function formatCustomerId(userId: string): string {
  const hex = userId.replace(/-/g, "").toUpperCase();
  return `S${hex.slice(-7)}`;
}

export function siteBrandLabel(): string {
  return `${LEGAL.siteName} © ${new Date().getFullYear()}`;
}
