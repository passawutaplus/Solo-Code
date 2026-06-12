/**
 * Shared Google Gemini helpers for TanStack Start server functions.
 * Replaces the former Lovable AI Gateway (`ai.gateway.lovable.dev`).
 */
import {
  GoogleGenerativeAI,
  type Content,
  type Part,
} from "@google/generative-ai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");
  return key;
}

export function defaultFastModel(): string {
  return process.env.GEMINI_MODEL_FAST ?? "gemini-2.5-flash-lite";
}

export function defaultModel(): string {
  return process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
}

export function defaultVisionModel(): string {
  return process.env.GEMINI_MODEL_VISION ?? "gemini-2.5-flash";
}

/** Map legacy Lovable gateway model ids to Gemini API model ids. */
export function normalizeGeminiModel(model?: string, fallback?: string): string {
  if (!model?.trim()) return fallback ?? defaultFastModel();
  let m = model.trim();
  if (m.startsWith("google/")) m = m.slice(7);
  const ALIASES: Record<string, string> = {
    "gemini-3.1-flash-lite-preview": "gemini-2.5-flash-lite",
    "gemini-3-flash-preview": "gemini-2.5-flash",
    "gemini-2.0-flash-lite": "gemini-2.5-flash-lite",
    "gemini-2.0-flash": "gemini-2.5-flash",
    "gemini-2.5-flash-lite": "gemini-2.5-flash-lite",
    "gemini-2.5-flash": "gemini-2.5-flash",
  };
  return ALIASES[m] ?? m;
}

function splitMessages(messages: ChatMessage[]): {
  systemInstruction?: string;
  contents: Content[];
} {
  const systemLines: string[] = [];
  const contents: Content[] = [];
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
    systemInstruction: systemLines.length ? systemLines.join("\n\n") : undefined,
    contents,
  };
}

export function mapGeminiError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (/429|quota|rate/i.test(msg)) {
    return new Error("ใช้งาน Gemini หนาแน่นเกินไป กรุณาลองใหม่อีกครั้ง");
  }
  if (/401|403|API key|invalid/i.test(msg)) {
    return new Error("GEMINI_API_KEY ไม่ถูกต้องหรือไม่มีสิทธิ์");
  }
  if (/SAFETY|blocked|recitation/i.test(msg)) {
    return new Error("Gemini ปฏิเสธเนื้อหานี้ — ลองปรับข้อความหรือไฟล์");
  }
  return new Error(`Gemini ไม่ตอบสนอง: ${msg.slice(0, 160)}`);
}

/** Block SSRF — only Supabase storage paths owned by the user. */
export function assertSafeUserImageUrl(url: string, userId: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("URL รูปไม่ถูกต้อง");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("รองรับเฉพาะ HTTPS");
  }

  const blockedHost =
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0|metadata\.google\.internal)$/i.test(parsed.hostname) ||
    /\.(local|internal)$/i.test(parsed.hostname) ||
    /^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(parsed.hostname);

  if (blockedHost) {
    throw new Error("URL รูปไม่ได้รับอนุญาต");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Server configuration error");
  }

  const base = new URL(supabaseUrl);
  if (parsed.origin !== base.origin || !parsed.pathname.includes("/storage/v1/object/")) {
    throw new Error("รองรับเฉพาะรูปจาก Supabase Storage ของบัญชีคุณ");
  }

  const objectPath = parsed.pathname.split("/object/")[1] ?? "";
  const normalized = decodeURIComponent(objectPath).replace(/^\/+/, "");
  const segments = normalized.split("/");
  const pathInBucket =
    segments[0] === "public" || segments[0] === "authenticated" || segments[0] === "sign"
      ? segments.slice(2).join("/")
      : segments.slice(1).join("/");
  if (!pathInBucket.startsWith(`${userId}/`)) {
    throw new Error("ไม่มีสิทธิ์เข้าถึงรูปนี้");
  }
}

function buildGenerativeModel(
  apiKey: string,
  modelId: string,
  options: {
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
    json?: boolean;
  },
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: options.systemInstruction,
    generationConfig: {
      temperature: options.temperature,
      maxOutputTokens: options.maxOutputTokens,
      ...(options.json ? { responseMimeType: "application/json" as const } : {}),
    },
  });
}

export async function geminiChat(options: {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  json?: boolean;
}): Promise<{ text: string }> {
  const apiKey = getGeminiApiKey();
  const modelId = normalizeGeminiModel(options.model, defaultFastModel());
  const { systemInstruction, contents } = splitMessages(options.messages);
  const model = buildGenerativeModel(apiKey, modelId, {
    systemInstruction,
    temperature: options.temperature,
    maxOutputTokens: options.maxOutputTokens,
    json: options.json,
  });
  try {
    const result = await model.generateContent({ contents });
    return { text: result.response.text().trim() };
  } catch (e) {
    throw mapGeminiError(e);
  }
}

/** Stream text deltas from Gemini (for SSE assistant routes). */
export async function* geminiChatStream(options: {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxOutputTokens?: number;
}): AsyncGenerator<string> {
  const apiKey = getGeminiApiKey();
  const modelId = normalizeGeminiModel(options.model, defaultFastModel());
  const { systemInstruction, contents } = splitMessages(options.messages);
  const model = buildGenerativeModel(apiKey, modelId, {
    systemInstruction,
    temperature: options.temperature,
    maxOutputTokens: options.maxOutputTokens,
  });
  try {
    const result = await model.generateContentStream({ contents });
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (e) {
    throw mapGeminiError(e);
  }
}

export async function fetchUrlAsInlinePart(url: string, userId?: string): Promise<Part> {
  if (userId) assertSafeUserImageUrl(url, userId);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`โหลดรูปไม่สำเร็จ: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mimeType = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim();
  return { inlineData: { mimeType, data: buf.toString("base64") } };
}

export async function geminiChatWithParts(options: {
  model?: string;
  systemInstruction: string;
  userParts: Part[];
  temperature?: number;
  maxOutputTokens?: number;
  json?: boolean;
}): Promise<string> {
  const apiKey = getGeminiApiKey();
  const modelId = normalizeGeminiModel(options.model, defaultVisionModel());
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: options.systemInstruction,
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      maxOutputTokens: options.maxOutputTokens ?? 4096,
      ...(options.json ? { responseMimeType: "application/json" as const } : {}),
    },
  });
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: options.userParts }],
    });
    return result.response.text().trim();
  } catch (e) {
    throw mapGeminiError(e);
  }
}
