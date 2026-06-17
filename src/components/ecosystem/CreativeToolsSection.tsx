import * as React from "react";
import { Wrench } from "lucide-react";
import { ToolBrandIcon } from "@/components/brand/ToolBrandIcon";
import {
  CREATIVE_TOOL_CATEGORY_LABELS,
  CREATIVE_TOOLS,
  groupCreativeToolsByCategory,
  resolveCreativeTool,
  resolveCreativeTools,
  type CreativeToolCategory,
  type CreativeToolMeta,
} from "@/data/creativeTools";
import { cn } from "@/lib/utils";

type Props = {
  /** Raw strings from `profiles.skills` or `projects.tools` */
  skills?: readonly string[];
  /** Pre-resolved catalog ids (picker mode) */
  selectedIds?: readonly string[];
  /** Section title override */
  title?: string;
  /** Group by category (profile view) or flat chips */
  grouped?: boolean;
  /** Picker: toggle tool on/off */
  editable?: boolean;
  onChange?: (ids: string[]) => void;
  className?: string;
  emptyMessage?: string;
};

const DEFAULT_TITLE = "เครื่องมือและเทคโนโลยี";

function toolsFromProps(skills?: readonly string[], selectedIds?: readonly string[]): CreativeToolMeta[] {
  if (selectedIds?.length) {
    return selectedIds
      .map((id) => CREATIVE_TOOLS.find((t) => t.id === id))
      .filter((t): t is CreativeToolMeta => !!t);
  }
  if (skills?.length) return resolveCreativeTools(skills);
  return [];
}

function ToolChip({
  tool,
  selected,
  editable,
  onToggle,
}: {
  tool: CreativeToolMeta;
  selected?: boolean;
  editable?: boolean;
  onToggle?: () => void;
}) {
  const inner = (
    <>
      <ToolBrandIcon tool={tool} size={18} className="ring-1 ring-border/50" />
      <span className="truncate">{tool.nameTh ?? tool.name}</span>
    </>
  );

  if (editable) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
          selected
            ? "border-primary/40 bg-primary/10 text-foreground"
            : "border-border bg-card/60 text-muted-foreground hover:border-primary/30 hover:bg-card",
        )}
        aria-pressed={selected}
      >
        {inner}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-soft">
      {inner}
    </span>
  );
}

/**
 * an1hem profile section — displays tools/skills with theSVG brand icons.
 * Import in Anthem-Code profile view & editor (vendored from Solo-Code).
 */
export function CreativeToolsSection({
  skills,
  selectedIds,
  title = DEFAULT_TITLE,
  grouped = true,
  editable = false,
  onChange,
  className,
  emptyMessage = "ยังไม่ได้เลือกเครื่องมือ",
}: Props) {
  const resolved = toolsFromProps(skills, selectedIds);
  const selectedSet = React.useMemo(
    () => new Set(selectedIds ?? resolved.map((t) => t.id)),
    [selectedIds, resolved],
  );

  const toggle = (id: string) => {
    if (!editable || !onChange) return;
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  if (editable) {
    const byCategory = CREATIVE_TOOLS.reduce(
      (acc, tool) => {
        (acc[tool.category] ??= []).push(tool);
        return acc;
      },
      {} as Record<CreativeToolCategory, CreativeToolMeta[]>,
    );

    return (
      <section className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" aria-hidden />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {(Object.keys(byCategory) as CreativeToolCategory[]).map((cat) => (
          <div key={cat} className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {CREATIVE_TOOL_CATEGORY_LABELS[cat].th}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {byCategory[cat].map((tool) => (
                <ToolChip
                  key={tool.id}
                  tool={tool}
                  editable
                  selected={selectedSet.has(tool.id)}
                  onToggle={() => toggle(tool.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (!resolved.length) {
    return (
      <section className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" aria-hidden />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  const unknown = (skills ?? []).filter((s) => !resolveCreativeTool(s));

  if (!grouped) {
    return (
      <section className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" aria-hidden />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {resolved.map((tool) => (
            <ToolChip key={tool.id} tool={tool} />
          ))}
          {unknown.map((raw) => (
            <span
              key={raw}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground"
            >
              {raw}
            </span>
          ))}
        </div>
      </section>
    );
  }

  const groups = groupCreativeToolsByCategory(resolved);

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {groups.map(({ category, label, tools }) => (
        <div key={category} className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <div className="flex flex-wrap gap-1.5">
            {tools.map((tool) => (
              <ToolChip key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      ))}
      {unknown.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">อื่นๆ</p>
          <div className="flex flex-wrap gap-1.5">
            {unknown.map((raw) => (
              <span
                key={raw}
                className="inline-flex items-center rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground"
              >
                {raw}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export { CREATIVE_TOOLS, resolveCreativeTools };
