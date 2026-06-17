/**
 * Canonical creative-tool catalog for an1hem profile "เครื่องมือและเทคโนโลยี".
 * Icons via theSVG CDN (https://thesvg.org) with domain favicon fallback.
 * Vendored into Anthem-Code on build — keep slugs in sync with thesvg.org.
 */
import { thesvgIconUrl } from "@/lib/thesvgIcon";
import { getFaviconUrl } from "@/lib/favicon";

export type CreativeToolCategory =
  | "design"
  | "video"
  | "web"
  | "ai"
  | "productivity"
  | "showcase";

export interface CreativeToolMeta {
  id: string;
  name: string;
  nameTh?: string;
  category: CreativeToolCategory;
  /** theSVG slug — verified against CDN */
  thesvgSlug?: string;
  /** Google favicon fallback when slug missing */
  domain?: string;
  /** Match free-form `profiles.skills` / `projects.tools` strings */
  aliases: string[];
}

export const CREATIVE_TOOL_CATEGORY_LABELS: Record<
  CreativeToolCategory,
  { th: string; en: string }
> = {
  design: { th: "ดีไซน์ & กราฟิก", en: "Design & Graphics" },
  video: { th: "วิดีโอ & โมชัน", en: "Video & Motion" },
  web: { th: "เว็บ & โค้ด", en: "Web & Code" },
  ai: { th: "AI & อัตโนมัติ", en: "AI & Automation" },
  productivity: { th: "จัดการงาน", en: "Productivity" },
  showcase: { th: "โชว์ผลงาน", en: "Showcase" },
};

export const CREATIVE_TOOL_CATEGORIES: CreativeToolCategory[] = [
  "design",
  "video",
  "web",
  "ai",
  "productivity",
  "showcase",
];

export const CREATIVE_TOOLS: CreativeToolMeta[] = [
  // Design & Graphics
  {
    id: "figma",
    name: "Figma",
    category: "design",
    thesvgSlug: "figma",
    domain: "figma.com",
    aliases: ["figma", "figma pro", "figjam"],
  },
  {
    id: "photoshop",
    name: "Photoshop",
    nameTh: "โฟโตช็อป",
    category: "design",
    thesvgSlug: "photoshop",
    domain: "adobe.com",
    aliases: ["photoshop", "ps", "adobe photoshop", "photo shop"],
  },
  {
    id: "illustrator",
    name: "Illustrator",
    nameTh: "อิลลัสเตรเตอร์",
    category: "design",
    thesvgSlug: "illustrator",
    domain: "adobe.com",
    aliases: ["illustrator", "ai", "adobe illustrator"],
  },
  {
    id: "indesign",
    name: "InDesign",
    category: "design",
    thesvgSlug: "indesign",
    domain: "adobe.com",
    aliases: ["indesign", "adobe indesign", "in design"],
  },
  {
    id: "lightroom",
    name: "Lightroom",
    category: "design",
    thesvgSlug: "lightroom",
    domain: "adobe.com",
    aliases: ["lightroom", "adobe lightroom", "lr"],
  },
  {
    id: "xd",
    name: "Adobe XD",
    category: "design",
    thesvgSlug: "xd",
    domain: "adobe.com",
    aliases: ["xd", "adobe xd"],
  },
  {
    id: "sketch",
    name: "Sketch",
    category: "design",
    thesvgSlug: "sketch",
    domain: "sketch.com",
    aliases: ["sketch"],
  },
  {
    id: "canva",
    name: "Canva",
    category: "design",
    thesvgSlug: "canva",
    domain: "canva.com",
    aliases: ["canva", "canva pro"],
  },
  {
    id: "framer",
    name: "Framer",
    category: "design",
    thesvgSlug: "framer",
    domain: "framer.com",
    aliases: ["framer"],
  },
  {
    id: "webflow",
    name: "Webflow",
    category: "design",
    thesvgSlug: "webflow",
    domain: "webflow.com",
    aliases: ["webflow"],
  },
  {
    id: "blender",
    name: "Blender",
    category: "design",
    thesvgSlug: "blender",
    domain: "blender.org",
    aliases: ["blender", "3d", "blender 3d"],
  },

  // Video & Motion
  {
    id: "premiere-pro",
    name: "Premiere Pro",
    category: "video",
    thesvgSlug: "premierepro",
    domain: "adobe.com",
    aliases: ["premiere", "premiere pro", "adobe premiere", "pr"],
  },
  {
    id: "after-effects",
    name: "After Effects",
    category: "video",
    thesvgSlug: "adobe",
    domain: "adobe.com",
    aliases: ["after effects", "aftereffects", "ae", "adobe after effects"],
  },
  {
    id: "capcut",
    name: "CapCut",
    category: "video",
    thesvgSlug: "capcut",
    domain: "capcut.com",
    aliases: ["capcut", "cap cut"],
  },
  {
    id: "runway",
    name: "Runway",
    category: "video",
    thesvgSlug: "runway",
    domain: "runwayml.com",
    aliases: ["runway", "runway ml", "runwayml"],
  },
  {
    id: "davinci-resolve",
    name: "DaVinci Resolve",
    category: "video",
    domain: "blackmagicdesign.com",
    aliases: ["davinci", "davinci resolve", "resolve", "blackmagic"],
  },
  {
    id: "final-cut-pro",
    name: "Final Cut Pro",
    category: "video",
    thesvgSlug: "apple",
    domain: "apple.com",
    aliases: ["final cut", "final cut pro", "fcp", "fcpx"],
  },

  // Web & Code
  {
    id: "react",
    name: "React",
    category: "web",
    thesvgSlug: "react",
    domain: "react.dev",
    aliases: ["react", "reactjs", "react.js"],
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "web",
    thesvgSlug: "nextdotjs",
    domain: "nextjs.org",
    aliases: ["nextjs", "next.js", "next js"],
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "web",
    thesvgSlug: "typescript",
    domain: "typescriptlang.org",
    aliases: ["typescript", "ts"],
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "web",
    thesvgSlug: "javascript",
    domain: "developer.mozilla.org",
    aliases: ["javascript", "js", "ecmascript"],
  },
  {
    id: "html",
    name: "HTML",
    category: "web",
    thesvgSlug: "html5",
    domain: "developer.mozilla.org",
    aliases: ["html", "html5"],
  },
  {
    id: "css",
    name: "CSS",
    category: "web",
    thesvgSlug: "css3",
    domain: "developer.mozilla.org",
    aliases: ["css", "css3"],
  },
  {
    id: "sass",
    name: "Sass",
    category: "web",
    thesvgSlug: "sass",
    domain: "sass-lang.com",
    aliases: ["sass", "scss"],
  },
  {
    id: "vite",
    name: "Vite",
    category: "web",
    thesvgSlug: "vite",
    domain: "vitejs.dev",
    aliases: ["vite"],
  },
  {
    id: "wordpress",
    name: "WordPress",
    category: "web",
    thesvgSlug: "wordpress",
    domain: "wordpress.org",
    aliases: ["wordpress", "wp"],
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "web",
    thesvgSlug: "vercel",
    domain: "vercel.com",
    aliases: ["vercel"],
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "web",
    thesvgSlug: "supabase",
    domain: "supabase.com",
    aliases: ["supabase"],
  },
  {
    id: "github",
    name: "GitHub",
    category: "web",
    thesvgSlug: "github",
    domain: "github.com",
    aliases: ["github", "gh"],
  },

  // AI
  {
    id: "midjourney",
    name: "Midjourney",
    category: "ai",
    thesvgSlug: "midjourney",
    domain: "midjourney.com",
    aliases: ["midjourney", "mj"],
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "ai",
    thesvgSlug: "openai",
    domain: "openai.com",
    aliases: ["openai", "chatgpt", "gpt", "dall-e", "dalle"],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    category: "ai",
    thesvgSlug: "gemini",
    domain: "gemini.google.com",
    aliases: ["gemini", "google gemini", "google ai"],
  },
  {
    id: "anthropic",
    name: "Claude",
    category: "ai",
    thesvgSlug: "anthropic",
    domain: "anthropic.com",
    aliases: ["claude", "anthropic"],
  },
  {
    id: "v0",
    name: "v0",
    category: "ai",
    thesvgSlug: "v0",
    domain: "v0.dev",
    aliases: ["v0", "v0.dev", "v0 by vercel"],
  },
  {
    id: "recraft",
    name: "Recraft",
    category: "ai",
    thesvgSlug: "recraft",
    domain: "recraft.ai",
    aliases: ["recraft", "recraft.ai"],
  },
  {
    id: "ideogram",
    name: "Ideogram",
    category: "ai",
    thesvgSlug: "ideogram",
    domain: "ideogram.ai",
    aliases: ["ideogram"],
  },
  {
    id: "clipdrop",
    name: "Clipdrop",
    category: "ai",
    thesvgSlug: "clipdrop",
    domain: "clipdrop.co",
    aliases: ["clipdrop"],
  },

  // Productivity
  {
    id: "notion",
    name: "Notion",
    category: "productivity",
    thesvgSlug: "notion",
    domain: "notion.so",
    aliases: ["notion"],
  },
  {
    id: "slack",
    name: "Slack",
    category: "productivity",
    thesvgSlug: "slack",
    domain: "slack.com",
    aliases: ["slack"],
  },
  {
    id: "line",
    name: "LINE",
    category: "productivity",
    thesvgSlug: "line",
    domain: "line.me",
    aliases: ["line", "line oa"],
  },
  {
    id: "miro",
    name: "Miro",
    category: "productivity",
    thesvgSlug: "miro",
    domain: "miro.com",
    aliases: ["miro"],
  },
  {
    id: "trello",
    name: "Trello",
    category: "productivity",
    thesvgSlug: "trello",
    domain: "trello.com",
    aliases: ["trello"],
  },
  {
    id: "asana",
    name: "Asana",
    category: "productivity",
    thesvgSlug: "asana",
    domain: "asana.com",
    aliases: ["asana"],
  },
  {
    id: "airtable",
    name: "Airtable",
    category: "productivity",
    thesvgSlug: "airtable",
    domain: "airtable.com",
    aliases: ["airtable"],
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "productivity",
    thesvgSlug: "stripe",
    domain: "stripe.com",
    aliases: ["stripe"],
  },

  // Showcase
  {
    id: "behance",
    name: "Behance",
    category: "showcase",
    thesvgSlug: "behance",
    domain: "behance.net",
    aliases: ["behance"],
  },
  {
    id: "dribbble",
    name: "Dribbble",
    category: "showcase",
    thesvgSlug: "dribbble",
    domain: "dribbble.com",
    aliases: ["dribbble"],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    category: "showcase",
    thesvgSlug: "pinterest",
    domain: "pinterest.com",
    aliases: ["pinterest"],
  },
  {
    id: "unsplash",
    name: "Unsplash",
    category: "showcase",
    thesvgSlug: "unsplash",
    domain: "unsplash.com",
    aliases: ["unsplash"],
  },
];

const TOOL_BY_ID = new Map(CREATIVE_TOOLS.map((t) => [t.id, t]));

const ALIAS_INDEX = (() => {
  const map = new Map<string, CreativeToolMeta>();
  for (const tool of CREATIVE_TOOLS) {
    map.set(normalizeToolKey(tool.id), tool);
    map.set(normalizeToolKey(tool.name), tool);
    if (tool.nameTh) map.set(normalizeToolKey(tool.nameTh), tool);
    for (const alias of tool.aliases) {
      map.set(normalizeToolKey(alias), tool);
    }
  }
  return map;
})();

export function normalizeToolKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/[^a-z0-9ก-๙]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getCreativeToolById(id: string): CreativeToolMeta | undefined {
  return TOOL_BY_ID.get(id);
}

/** Resolve a free-form skill/tool string to catalog entry (or null). */
export function resolveCreativeTool(raw: string): CreativeToolMeta | null {
  const key = normalizeToolKey(raw);
  if (!key) return null;
  return ALIAS_INDEX.get(key) ?? null;
}

/** Deduplicated catalog matches for profile.skills / projects.tools arrays. */
export function resolveCreativeTools(rawSkills: readonly string[]): CreativeToolMeta[] {
  const seen = new Set<string>();
  const out: CreativeToolMeta[] = [];
  for (const raw of rawSkills) {
    const tool = resolveCreativeTool(raw);
    if (!tool || seen.has(tool.id)) continue;
    seen.add(tool.id);
    out.push(tool);
  }
  return out;
}

export function creativeToolIconUrl(tool: CreativeToolMeta): string | null {
  if (tool.thesvgSlug) return thesvgIconUrl(tool.thesvgSlug);
  if (tool.domain) return getFaviconUrl(tool.domain, 64);
  return null;
}

export function groupCreativeToolsByCategory(
  tools: readonly CreativeToolMeta[],
): { category: CreativeToolCategory; label: string; tools: CreativeToolMeta[] }[] {
  return CREATIVE_TOOL_CATEGORIES.map((category) => ({
    category,
    label: CREATIVE_TOOL_CATEGORY_LABELS[category].th,
    tools: tools.filter((t) => t.category === category),
  })).filter((g) => g.tools.length > 0);
}
