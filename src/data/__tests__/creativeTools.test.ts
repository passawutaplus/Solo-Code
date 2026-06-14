import { describe, expect, it } from "vitest";
import { resolveCreativeTool, resolveCreativeTools } from "@/data/creativeTools";

describe("resolveCreativeTool", () => {
  it("matches catalog ids and common aliases", () => {
    expect(resolveCreativeTool("figma")?.id).toBe("figma");
    expect(resolveCreativeTool("Adobe Photoshop")?.id).toBe("photoshop");
    expect(resolveCreativeTool("Premiere Pro")?.id).toBe("premiere-pro");
    expect(resolveCreativeTool("next.js")?.id).toBe("nextjs");
  });

  it("deduplicates resolved tools", () => {
    const tools = resolveCreativeTools(["Figma", "figma", "FIGMA PRO", "Canva"]);
    expect(tools.map((t) => t.id)).toEqual(["figma", "canva"]);
  });
});
