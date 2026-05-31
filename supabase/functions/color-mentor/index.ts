// Color Mentor — analyzes a hex color and returns complementary colors + mood
// Uses Lovable AI Gateway with Gemini 3.1 Flash Lite for cost efficiency.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { checkAiQuota, isProUser } from "../_shared/ai-quota.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HEX_RE = /^#?[0-9a-fA-F]{6}$/;

serve(async (req) => {
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
      console.error("color-mentor: missing SUPABASE_URL or SUPABASE_ANON_KEY");
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
    const quota = await checkAiQuota(u.user.id, "color_mentor", pro);
    if (!quota.allowed) {
      return new Response(
        JSON.stringify({
          error: `ใช้ AI ครบโควต้าวันนี้แล้ว (${quota.count}/${quota.limit}) ลองใหม่พรุ่งนี้นะครับ`,
          quota,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { hex } = await req.json();
    if (!hex || typeof hex !== "string" || !HEX_RE.test(hex.trim())) {
      return new Response(JSON.stringify({ error: "Invalid hex" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const normalized = hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `คุณคือ "So1o Mentor" Senior Art Director ฟรีแลนซ์ไทย
ผู้ใช้จะส่งรหัสสี HEX มาให้คุณวิเคราะห์
ตอบกลับในรูปแบบ tool call เท่านั้น โดย:
- complementary: 3 hex codes (รูปแบบ #RRGGBB) ที่จับคู่กับสีนี้แล้วงานดูดี ไม่ซ้ำกับสีเดิม
- mood: 1 ประโยคสั้น ๆ บอกอารมณ์/ความรู้สึกของสีนี้ (≤ 30 คำ ภาษาไทย)
- tip: 1 ประโยคแนะนำการใช้งานสำหรับฟรีแลนซ์ (≤ 30 คำ ภาษาไทย)
ห้ามใส่อารัมภบท ห้ามตอบยาวเกิน`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `วิเคราะห์สี ${normalized}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "color_mentor_reply",
              description: "Return complementary colors, mood, and a usage tip.",
              parameters: {
                type: "object",
                properties: {
                  complementary: {
                    type: "array",
                    items: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
                    minItems: 1,
                    maxItems: 4,
                  },
                  mood: { type: "string", maxLength: 200 },
                  tip: { type: "string", maxLength: 200 },
                },
                required: ["complementary", "mood", "tip"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "color_mentor_reply" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "ใช้งาน AI บ่อยเกินไป กรุณารอสักครู่" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "เครดิต AI หมด — เติมเครดิตที่ Settings > Workspace > Usage" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await response.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("AI ไม่ได้ตอบกลับในรูปแบบที่ถูกต้อง");
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("color-mentor error:", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
