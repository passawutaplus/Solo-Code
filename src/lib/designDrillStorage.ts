const STORAGE_KEY = "so1o.designDrill.progress";

interface DrillProgress {
  streak: number;
  lastCompletedDate?: string;
  inProgress?: { brief: string; date: string };
  completedDates: string[];
}

function readProgress(): DrillProgress {
  if (typeof window === "undefined") {
    return { streak: 0, completedDates: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { streak: 0, completedDates: [] };
    const parsed = JSON.parse(raw) as DrillProgress;
    return {
      streak: parsed.streak ?? 0,
      lastCompletedDate: parsed.lastCompletedDate,
      inProgress: parsed.inProgress,
      completedDates: parsed.completedDates ?? [],
    };
  } catch {
    return { streak: 0, completedDates: [] };
  }
}

function writeProgress(data: DrillProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayLocal(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getDrillStreak(): number {
  return readProgress().streak;
}

export function isDrillCompletedToday(): boolean {
  const today = todayLocal();
  const p = readProgress();
  return p.lastCompletedDate === today || p.completedDates.includes(today);
}

export function getDrillInProgress(): { brief: string; date: string } | null {
  const p = readProgress();
  if (!p.inProgress) return null;
  if (p.inProgress.date !== todayLocal()) return null;
  return p.inProgress;
}

export function markDrillStarted(brief: string): void {
  const p = readProgress();
  writeProgress({
    ...p,
    inProgress: { brief, date: todayLocal() },
  });
}

export function markDrillCompleted(): void {
  const today = todayLocal();
  const p = readProgress();
  const wasYesterday = p.lastCompletedDate === yesterdayLocal();
  const alreadyToday = p.lastCompletedDate === today;

  const streak = alreadyToday ? p.streak : wasYesterday ? p.streak + 1 : 1;
  const completedDates = p.completedDates.includes(today)
    ? p.completedDates
    : [...p.completedDates, today].slice(-60);

  writeProgress({
    streak,
    lastCompletedDate: today,
    completedDates,
    inProgress: undefined,
  });
}

export function clearDrillInProgress(): void {
  const p = readProgress();
  writeProgress({ ...p, inProgress: undefined });
}
