/**
 * Sync shared ecosystem modules from Solo-Code (canonical) → Anthem-Code.
 * Run before Anthem build/CI to prevent drift.
 */
import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const soloRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const anthemRoot = join(soloRoot, "..", "Anthem-Code");

if (!existsSync(anthemRoot)) {
  console.warn("[vendor-ecosystem] Anthem-Code not found — skipping");
  process.exit(0);
}

const copies = [
  {
    src: join(soloRoot, "src", "lib", "lineNotificationKinds.ts"),
    dest: join(anthemRoot, "src", "lib", "lineNotificationKinds.vendored.ts"),
  },
  {
    src: join(soloRoot, "src", "data", "plans.ts"),
    dest: join(anthemRoot, "src", "data", "plans.vendored.ts"),
  },
  {
    src: join(soloRoot, "src", "lib", "thesvgIcon.ts"),
    dest: join(anthemRoot, "src", "lib", "thesvgIcon.vendored.ts"),
  },
  {
    src: join(soloRoot, "src", "data", "creativeTools.ts"),
    dest: join(anthemRoot, "src", "data", "creativeTools.vendored.ts"),
  },
  {
    src: join(soloRoot, "src", "lib", "favicon.ts"),
    dest: join(anthemRoot, "src", "lib", "favicon.vendored.ts"),
  },
  {
    src: join(soloRoot, "src", "components", "brand", "ToolBrandIcon.tsx"),
    dest: join(anthemRoot, "src", "components", "brand", "ToolBrandIcon.vendored.tsx"),
  },
  {
    src: join(soloRoot, "src", "components", "ecosystem", "CreativeToolsSection.tsx"),
    dest: join(anthemRoot, "src", "components", "ecosystem", "CreativeToolsSection.vendored.tsx"),
  },
];

/** Rewrite @/ imports to .vendored siblings for Anthem-Code. */
function rewriteVendoredImports(content) {
  return content
    .replaceAll('@/lib/thesvgIcon"', '@/lib/thesvgIcon.vendored"')
    .replaceAll("@/lib/thesvgIcon'", "@/lib/thesvgIcon.vendored'")
    .replaceAll('@/lib/favicon"', '@/lib/favicon.vendored"')
    .replaceAll("@/lib/favicon'", "@/lib/favicon.vendored'")
    .replaceAll('@/data/creativeTools"', '@/data/creativeTools.vendored"')
    .replaceAll("@/data/creativeTools'", "@/data/creativeTools.vendored'")
    .replaceAll('@/components/brand/ToolBrandIcon"', '@/components/brand/ToolBrandIcon.vendored"')
    .replaceAll("@/components/brand/ToolBrandIcon'", "@/components/brand/ToolBrandIcon.vendored'");
}

for (const { src, dest } of copies) {
  let content = readFileSync(src, "utf8");
  const rel = src.replace(`${soloRoot}/`, "");
  content = `/** AUTO-GENERATED — do not edit. Source: Solo-Code/${rel} */\n${content}`;
  if (dest.includes(".vendored.")) {
    content = rewriteVendoredImports(content);
  }
  writeFileSync(dest, content);
}

// Inject shared safeRelativePath into Anthem safeUrl.ts (Anthem has no security.ts).
const safeRelativeFn = readFileSync(
  join(soloRoot, "scripts", "ecosystem-shared", "safeRelativePath.ts"),
  "utf8",
);
const anthemSafeUrl = `/**
 * Safe URL helpers for an1hem.
 * safeRelativePath body is vendored from Solo-Code/scripts/ecosystem-shared/.
 */

/**
 * Returns the URL only if it is an http(s) absolute URL.
 * Otherwise returns undefined to prevent javascript:, data:, etc. XSS via href.
 */
export const safeHttpUrl = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  const v = raw.trim();
  if (!v) return undefined;
  try {
    const u = new URL(v);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {
    /* not a valid absolute URL */
  }
  return undefined;
};

${safeRelativeFn}
`;
writeFileSync(join(anthemRoot, "src", "lib", "safeUrl.ts"), anthemSafeUrl);

console.log(
  "[vendor-ecosystem] synced → Anthem-Code (lineNotificationKinds, plans, creativeTools, thesvgIcon, ToolBrandIcon, safeUrl)",
);
