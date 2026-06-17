import { SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import type { DrillDifficulty } from "@/data/designDrillPrompts";

const ICONS = {
  easy: SignalLow,
  medium: SignalMedium,
  hard: SignalHigh,
} as const;

export function DrillDifficultyIcon({
  difficulty,
  className = "h-3.5 w-3.5",
}: {
  difficulty: DrillDifficulty;
  className?: string;
}) {
  const Icon = ICONS[difficulty];
  return <Icon className={className} aria-hidden />;
}
