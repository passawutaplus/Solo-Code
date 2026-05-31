import type { IncomeType } from "@/data/mockData";

/** Map AI-returned section code (40_2) to internal IncomeType. */
export function sectionToIncomeType(section: string): IncomeType {
  switch (section) {
    case "40_1":
    case "40_2":
      return "freelance";
    case "40_3":
    case "40_6":
      return "professional";
    case "40_5":
      return "rental";
    case "40_8":
      return "online_sales";
    default:
      return "freelance";
  }
}

/** Thai progressive tax brackets (2024+) — netIncome thresholds in THB */
export const TAX_BRACKETS: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 150_000, rate: 0 },
  { from: 150_000, to: 300_000, rate: 0.05 },
  { from: 300_000, to: 500_000, rate: 0.1 },
  { from: 500_000, to: 750_000, rate: 0.15 },
  { from: 750_000, to: 1_000_000, rate: 0.2 },
  { from: 1_000_000, to: 2_000_000, rate: 0.25 },
  { from: 2_000_000, to: 5_000_000, rate: 0.3 },
  { from: 5_000_000, to: Infinity, rate: 0.35 },
];

export function currentBracket(net: number) {
  const idx = TAX_BRACKETS.findIndex((b) => net > b.from && net <= b.to);
  return idx === -1 ? TAX_BRACKETS.length - 1 : idx;
}

/** Thai month abbreviation → month number (1–12). */
const THAI_MONTH: Record<string, number> = {
  "ม.ค.": 1, "มกราคม": 1,
  "ก.พ.": 2, "กุมภาพันธ์": 2,
  "มี.ค.": 3, "มีนาคม": 3,
  "เม.ย.": 4, "เมษายน": 4,
  "พ.ค.": 5, "พฤษภาคม": 5,
  "มิ.ย.": 6, "มิถุนายน": 6,
  "ก.ค.": 7, "กรกฎาคม": 7,
  "ส.ค.": 8, "สิงหาคม": 8,
  "ก.ย.": 9, "กันยายน": 9,
  "ต.ค.": 10, "ตุลาคม": 10,
  "พ.ย.": 11, "พฤศจิกายน": 11,
  "ธ.ค.": 12, "ธันวาคม": 12,
};

/**
 * Client-side fallback that converts Thai date strings to ISO YYYY-MM-DD.
 * Handles "31 / ม.ค. / 2569", "31/01/2569", and "2026-01-31".
 * Returns empty string if it cannot parse.
 */
export function parseThaiDate(input: string): string {
  const s = (input ?? "").trim();
  if (!s) return "";

  // Already ISO
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    let y = Number(iso[1]);
    if (y > 2400) y -= 543; // พ.ศ. mistakenly left in
    return `${y}-${iso[2]}-${iso[3]}`;
  }

  // Find Thai month token
  let month = 0;
  for (const key of Object.keys(THAI_MONTH)) {
    if (s.includes(key)) {
      month = THAI_MONTH[key];
      break;
    }
  }

  // Extract numeric tokens
  const nums = s.match(/\d+/g);
  if (!nums || nums.length < 2) return "";

  let day = 0;
  let year = 0;
  if (month) {
    // Pattern: day <month> year
    day = Number(nums[0]);
    year = Number(nums[nums.length - 1]);
  } else if (nums.length >= 3) {
    // Pattern d/m/y
    day = Number(nums[0]);
    month = Number(nums[1]);
    year = Number(nums[2]);
  } else {
    return "";
  }

  if (!day || !month || !year) return "";
  if (year > 2400) year -= 543;
  if (year < 1900 || year > 2200) return "";
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Snap an inferred WHT rate to the nearest standard preset. */
export function inferWhtRate(gross: number, wht: number): number {
  if (!gross || !wht) return 0;
  const raw = (wht / gross) * 100;
  const presets = [0.5, 1, 1.5, 2, 3, 5, 10, 15];
  return presets.reduce(
    (best, p) => (Math.abs(p - raw) < Math.abs(best - raw) ? p : best),
    presets[0],
  );
}
