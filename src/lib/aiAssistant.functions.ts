import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { geminiChat, defaultFastModel } from "@/lib/geminiServer";
import { buildBusinessSnapshot, isBusinessQuestion } from "@/lib/aiBusinessSnapshot";
import { debitAiCredits, getAiUsageSummary } from "@/lib/aiCreditsServer";
import { getPresetConfig, isAssistantPreset } from "@/lib/aiAssistantPresets";

const InputSchema = z.object({
  message: z.string().min(1).max(500),
  preset: z.enum(["mentor", "business", "copy", "legal"]).optional(),
});

export const aiAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const message = data.message.trim();

    let resolvedPreset = data.preset;
    if (!resolvedPreset) {
      resolvedPreset = isBusinessQuestion(message) ? "business" : "mentor";
    }

    const config = getPresetConfig(resolvedPreset);
    const feature = config.feature;
    const featureCost = config.cost;

    const preview = await getAiUsageSummary(userId);
    if (preview.total_remaining < featureCost) {
      throw new Error("limit_reached");
    }

    let userContent: string;
    if (config.usesBusinessSnapshot) {
      const snapshot = await buildBusinessSnapshot(supabase, userId);
      userContent = `ข้อมูลธุรกิจ (JSON):\n${JSON.stringify(snapshot, null, 2)}\n\nคำถามจากผู้ใช้:\n${message}`;
    } else {
      userContent = message;
    }

    const { text: answer } = await geminiChat({
      model: defaultFastModel(),
      messages: [
        { role: "system", content: config.systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const safeReply = (answer || "").trim();
    if (!safeReply) {
      throw new Error("empty_response");
    }

    const quota = await debitAiCredits({
      userId,
      feature,
      idempotencyKey: crypto.randomUUID(),
    });
    if (!quota.allowed) {
      throw new Error("limit_reached");
    }

    const presetValue = isAssistantPreset(resolvedPreset) ? resolvedPreset : "mentor";
    const { error: msgErr } = await supabase.from("ai_chat_messages").insert([
      { user_id: userId, role: "user", content: message, preset: presetValue },
      { user_id: userId, role: "assistant", content: safeReply, preset: presetValue },
    ]);
    if (msgErr) throw new Error(msgErr.message);

    return {
      answer: safeReply,
      preset: presetValue,
      kind: presetValue,
      usage: {
        included_used: quota.included_used ?? 0,
        included_limit: quota.included_limit ?? 0,
        included_remaining: quota.included_remaining ?? 0,
        purchased_balance: quota.purchased_balance ?? 0,
        total_remaining: quota.total_remaining ?? 0,
        cost: quota.cost ?? featureCost,
      },
    };
  });
