import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Minimal inline test — mirrors fetchNewsFeeds logic without path aliases
const FEEDS = [
  "https://www.smashingmagazine.com/feed/",
  "https://css-tricks.com/feed/",
  "https://tympanus.net/codrops/feed/",
];

async function fetchFeed(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "So1o-DailyTrends/1.0" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return 0;
  const xml = await res.text();
  const items = [...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)];
  const entries = [...xml.matchAll(/<entry[\s>]([\s\S]*?)<\/entry>/gi)];
  return items.length + entries.length;
}

let total = 0;
for (const url of FEEDS) {
  const count = await fetchFeed(url);
  console.log(`${url} -> ${count} items`);
  total += count;
}
console.log(`Total parsed blocks: ${total}`);
process.exit(total > 0 ? 0 : 1);
