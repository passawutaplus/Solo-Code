// Lovable AI Gateway — caption + hashtag generation for Content Planner 2.0
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { checkAiQuota, isProUser } from "../_shared/ai-quota.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  mode: "caption" | "hashtags";
  topic?: string;
  mood?: string;
  platforms?: string[];
  language?: "th" | "en";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require an authenticated Supabase user — prevents anonymous AI credit abuse.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader.endsWith("undefined") || authHeader.endsWith("null")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !ANON_KEY) {
      console.error("planner-ai-assist: missing SUPABASE_URL or SUPABASE_ANON_KEY");
      return new Response(JSON.stringify({ error: "server_misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u, error: uErr } = await userClient.auth.getUser();
    if (uErr || !u?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Daily quota guard (Denial-of-Wallet protection)
    const pro = await isProUser(u.user.id);
    const quota = await checkAiQuota(u.user.id, "planner_ai_assist", pro);
    if (!quota.allowed) {
      return new Response(
        JSON.stringify({
          error: `ใช้ AI ครบโควต้าวันนี้แล้ว (${quota.count}/${quota.limit}) ลองใหม่พรุ่งนี้นะครับ`,
          quota,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: Body = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const lang = body.language ?? "th";
    const platformList = (body.platforms ?? []).join(", ") || "general";
    const mood = body.mood ?? "professional, friendly";

    let systemPrompt = "";
    let userPrompt = "";

    if (body.mode === "caption") {
      systemPrompt = lang === "th"
        ? "คุณคือ So1o Mentor ผู้ช่วยเขียนแคปชันโซเชียลให้ฟรีแลนซ์ไทย เขียนกระชับ ดึงดูด ใช้สูตร AIDA หรือ PAS ตอบเป็น JSON เท่านั้น"
        : "You are So1o Mentor, a social caption writer. Write punchy captions using AIDA or PAS. Respond JSON only.";
      userPrompt = `หัวข้อ: ${body.topic}\nMood: ${mood}\nแพลตฟอร์ม: ${platformList}\n\nสร้างแคปชัน 3 แบบ (สั้น/กลาง/ยาว) ตอบเป็น JSON: {"variations":[{"length":"short|medium|long","text":"..."}]}`;
    } else {
      systemPrompt = "You generate trending Thai+English hashtags for 2026 freelancer content. Respond JSON only.";
      userPrompt = `Topic: ${body.topic}\nMood: ${mood}\nPlatforms: ${platformList}\n\nReturn 10-12 mixed TH/EN hashtags as JSON: {"hashtags":["#tag1","#tag2",...]}`;
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "ใช้งานบ่อยเกินไป รอสักครู่แล้วลองใหม่" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "เครดิต AI หมด กรุณาเติมเครดิตใน Workspace" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${txt}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("planner-ai-assist error:", msg);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
