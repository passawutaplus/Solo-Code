export interface DailyTrendItem {
  category: string;
  title: string;
  body: string;
  emoji?: string;
  image_url?: string;
  source?: string;
  source_url?: string;
}

export type DailyTrendsStatus = "ready" | "pending";

export interface DailyTrendsResponse {
  date: string;
  items: DailyTrendItem[];
  status: DailyTrendsStatus;
}
