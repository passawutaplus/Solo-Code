import * as React from "react";
import {
  Target,
  Shuffle,
  ExternalLink,
  CheckCircle2,
  Play,
  Flame,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  DRILL_CATEGORY_META,
  DRILL_DIFFICULTY_META,
  type DrillCategory,
  type DrillDifficulty,
  type DrillMode,
} from "@/data/designDrillPrompts";
import {
  buildDrillDescription,
  buildDrillTags,
  pickDailyDrill,
  pickDrill,
  type PickedDrill,
} from "@/lib/designDrillPick";
import {
  clearDrillInProgress,
  getDrillInProgress,
  getDrillStreak,
  isDrillCompletedToday,
  markDrillCompleted,
  markDrillStarted,
} from "@/lib/designDrillStorage";
import { anthemDesignDrillUrl, trackCrossLink } from "@/lib/crossLink";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DrillDifficultyIcon } from "./DrillDifficultyIcon";

type Tab = "daily" | "custom";

const CATEGORIES = Object.keys(DRILL_CATEGORY_META) as DrillCategory[];
const DIFFICULTIES = Object.keys(DRILL_DIFFICULTY_META) as DrillDifficulty[];

export function DesignDrillSection() {
  const [tab, setTab] = React.useState<Tab>("daily");
  const [category, setCategory] = React.useState<DrillCategory>("logo");
  const [difficulty, setDifficulty] = React.useState<DrillDifficulty>("medium");
  const [mode, setMode] = React.useState<DrillMode>("constraints");
  const [rollSeed, setRollSeed] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [progressTick, setProgressTick] = React.useState(0);
  const [inProgress, setInProgress] = React.useState(false);
  const [completedToday, setCompletedToday] = React.useState(false);
  const [savedBrief, setSavedBrief] = React.useState<string | null>(null);

  React.useEffect(() => {
    setStreak(getDrillStreak());
    setCompletedToday(isDrillCompletedToday());
    const saved = getDrillInProgress();
    if (saved) {
      setInProgress(true);
      setSavedBrief(saved.brief);
    }
  }, [progressTick]);

  const dailyDrill = React.useMemo(() => pickDailyDrill(), []);

  const customDrill = React.useMemo(
    () => pickDrill({ category, difficulty, mode, salt: String(rollSeed) }),
    [category, difficulty, mode, rollSeed],
  );

  const activeDrill: PickedDrill = tab === "daily" ? dailyDrill : customDrill;

  const handleRoll = () => setRollSeed((s) => s + 1);

  const handleStart = () => {
    markDrillStarted(activeDrill.brief);
    setInProgress(true);
    setSavedBrief(activeDrill.brief);
    setProgressTick((t) => t + 1);
  };

  const handleComplete = () => {
    markDrillCompleted();
    setInProgress(false);
    setCompletedToday(true);
    setStreak(getDrillStreak());
    setProgressTick((t) => t + 1);
  };

  const handlePost = async () => {
    const linkId = await trackCrossLink({
      source: "design_drill",
      meta: {
        category: activeDrill.category,
        difficulty: activeDrill.difficulty,
        mode: activeDrill.mode,
      },
    });

    const url = anthemDesignDrillUrl({
      brief: activeDrill.brief,
      description: buildDrillDescription(activeDrill),
      anthemCategory: activeDrill.meta.anthemCategory,
      tags: buildDrillTags(activeDrill),
    });

    const withLink = linkId ? `${url}&link_id=${encodeURIComponent(linkId)}` : url;
    window.open(withLink, "_blank", "noopener,noreferrer");
  };

  const handleReset = () => {
    clearDrillInProgress();
    setInProgress(false);
    setSavedBrief(null);
    setProgressTick((t) => t + 1);
  };

  const showDrill = !inProgress || savedBrief === activeDrill.brief;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary-soft text-primary p-2 shrink-0">
            <Target className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Design Drill</h2>
            <p className="text-xs text-muted-foreground">ฝึกดีไซน์ด้วยโจทย์สุ่ม แล้วโพสผลงานที่ an1hem</p>
          </div>
        </div>
        {streak > 0 && (
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
            <Flame className="h-3 w-3" aria-hidden />
            {streak} วันติด
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        {(["daily", "custom"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
              tab === t
                ? "bg-primary text-primary-foreground border-primary shadow-soft"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {t === "daily" ? "โจทย์ประจำวัน" : "สุ่มเอง"}
          </button>
        ))}
      </div>

      {tab === "custom" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                  category === c
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                {DRILL_CATEGORY_META[c].label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                  difficulty === d
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                <DrillDifficultyIcon difficulty={d} />
                {DRILL_DIFFICULTY_META[d].label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {(["constraints", "free"] as DrillMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                  mode === m
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                {m === "constraints" ? (
                  <Lock className="h-3 w-3" aria-hidden />
                ) : (
                  <Sparkles className="h-3 w-3" aria-hidden />
                )}
                {m === "constraints" ? "มีข้อจำกัด" : "ฟรีสไตล์"}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleRoll} className="gap-1.5">
            <Shuffle className="h-3.5 w-3.5" aria-hidden />
            สุ่มโจทย์ใหม่
          </Button>
        </div>
      )}

      {showDrill && (
        <article className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{activeDrill.meta.label}</Badge>
            <Badge variant="outline" className="gap-1">
              <DrillDifficultyIcon difficulty={activeDrill.difficulty} />
              {DRILL_DIFFICULTY_META[activeDrill.difficulty].label}
            </Badge>
            <Badge variant="outline">
              {activeDrill.mode === "constraints" ? "มีข้อจำกัด" : "ฟรีสไตล์"}
            </Badge>
            {activeDrill.template.timeHint && (
              <span className="text-[11px] text-muted-foreground">
                {activeDrill.template.timeHint}
              </span>
            )}
          </div>

          <p className="text-base sm:text-lg font-semibold leading-snug">{activeDrill.brief}</p>

          {activeDrill.constraints.length > 0 && (
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {activeDrill.constraints.map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          )}

          {activeDrill.mode === "free" && activeDrill.template.freeHint && (
            <p className="text-sm text-muted-foreground italic">{activeDrill.template.freeHint}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {!inProgress && !completedToday && (
              <Button onClick={handleStart} className="gap-1.5">
                <Play className="h-3.5 w-3.5" aria-hidden />
                เริ่มทำ
              </Button>
            )}
            {inProgress && (
              <>
                <Button onClick={handleComplete} className="gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  ทำเสร็จแล้ว
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  ยกเลิก
                </Button>
              </>
            )}
            {(inProgress || completedToday) && (
              <Button variant="outline" onClick={handlePost} className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                โพส an1hem
              </Button>
            )}
          </div>

          {completedToday && (
            <p className="text-xs text-primary font-medium">ทำโจทย์วันนี้เสร็จแล้ว — เก่งมาก!</p>
          )}
        </article>
      )}
    </div>
  );
}
