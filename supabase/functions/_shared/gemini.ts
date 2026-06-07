// Shared Google Gemini client for Supabase Edge Functions (Deno).
// Uses the Generative Language REST API — no Lovable gateway.

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export type GeminiChatRole = "user" | "model";

export interface GeminiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

export function getGeminiApiKey(): string {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new GeminiError("GEMINI_API_KEY not configured", 500);
  return key;
}

export function defaultFastModel(): string {
  return Deno.env.get("GEMINI_MODEL_FAST") ?? "gemini-2.0-flash-lite";
}

export function defaultModel(): string {
  return Deno.env.get("GEMINI_MODEL") ?? "gemini-2.0-flash";
}

export function defaultEmbeddingModel(): string {
  return Deno.env.get("GEMINI_EMBEDDING_MODEL") ?? "text-embedding-004";
}

/** Map legacy Lovable gateway model ids to Gemini API model ids. */
export function normalizeGeminiModel(model?: string, fallback?: string): string {
  if (!model?.trim()) return fallback ?? defaultFastModel();
  let m = model.trim();
  if (m.startsWith("google/")) m = m.slice(7);
  const ALIASES: Record<string, string> = {
    "gemini-3.1-flash-lite-preview": "gemini-2.0-flash-lite",
    "gemini-3-flash-preview": "gemini-2.0-flash",
    "gemini-2.5-flash-lite": "gemini-2.0-flash-lite",
    "gemini-2.5-flash": "gemini-2.0-flash",
    "openai/text-embedding-3-small": "text-embedding-004",
  };
  return ALIASES[m] ?? m;
}

function splitMessages(messages: GeminiChatMessage[]) {
  const systemLines: string[] = [];
  const contents: Array<{ role: GeminiChatRole; parts: Array<{ text: string }> }> = [];
  for (const msg of messages) {
    if (msg.role === "system") {
      systemLines.push(msg.content);
      continue;
    }
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    });
  }
  return {
    systemInstruction: systemLines.length
      ? { parts: [{ text: systemLines.join("\n\n") }] }
      : undefined,
    contents,
  };
}

function buildRequestBody(opts: {
  messages: GeminiChatMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  json?: boolean;
  tools?: unknown[];
  toolConfig?: Record<string, unknown>;
}) {
  const { systemInstruction, contents } = splitMessages(opts.messages);
  const body: Record<string, unknown> = { contents };
  if (systemInstruction) body.systemInstruction = systemInstruction;
  const gen: Record<string, unknown> = {};
  if (opts.temperature != null) gen.temperature = opts.temperature;
  if (opts.maxOutputTokens != null) gen.maxOutputTokens = opts.maxOutputTokens;
  if (opts.json) gen.responseMimeType = "application/json";
  if (Object.keys(gen).length > 0) body.generationConfig = gen;
  if (opts.tools?.length) body.tools = opts.tools;
  if (opts.toolConfig) body.toolConfig = opts.toolConfig;
  return body;
}

function extractTextFromResponse(json: Record<string, unknown>): string {
  const candidates = json.candidates as Array<Record<string, unknown>> | undefined;
  const parts = (candidates?.[0]?.content as Record<string, unknown> | undefined)?.parts as
    | Array<Record<string, unknown>>
    | undefined;
  if (!parts?.length) return "";
  return parts.map((p) => String(p.text ?? "")).join("");
}

async function parseGeminiError(res: Response): Promise<GeminiError> {
  const t = await res.text().catch(() => "");
  if (res.status === 429) return new GeminiError("rate_limited", 429);
  if (res.status === 401 || res.status === 403) {
    return new GeminiError("GEMINI_API_KEY ไม่ถูกต้องหรือไม่มีสิทธิ์", res.status);
  }
  return new GeminiError(`gemini_error: ${res.status} ${t.slice(0, 200)}`, res.status);
}

export async function geminiGenerateText(
  apiKey: string,
  model: string,
  options: {
    messages: GeminiChatMessage[];
    temperature?: number;
    maxOutputTokens?: number;
    json?: boolean;
  },
): Promise<string> {
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildRequestBody(options)),
  });
  if (!res.ok) throw await parseGeminiError(res);
  const json = (await res.json()) as Record<string, unknown>;
  return extractTextFromResponse(json).trim();
}

export async function geminiEmbedText(
  apiKey: string,
  text: string,
  model?: string,
): Promise<number[]> {
  const m = normalizeGeminiModel(model, defaultEmbeddingModel());
  const url = `${GEMINI_BASE}/models/${m}:embedContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text }] },
    }),
  });
  if (!res.ok) throw await parseGeminiError(res);
  const json = (await res.json()) as Record<string, unknown>;
  const embedding = json.embedding as Record<string, unknown> | undefined;
  const values = embedding?.values as number[] | undefined;
  if (!values?.length) throw new GeminiError("empty embedding", 500);
  return values;
}
