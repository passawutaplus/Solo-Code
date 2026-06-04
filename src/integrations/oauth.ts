import { supabase } from "@/integrations/supabase/client";

export type OAuthProvider = "google" | "apple";

export async function signInWithOAuth(
  provider: OAuthProvider,
  options?: { redirectTo?: string },
): Promise<{ error?: Error; redirected?: boolean }> {
  const redirectTo =
    options?.redirectTo ??
    (typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error) return { error };
  if (data?.url && typeof window !== "undefined") {
    window.location.assign(data.url);
    return { redirected: true };
  }
  return {};
}
