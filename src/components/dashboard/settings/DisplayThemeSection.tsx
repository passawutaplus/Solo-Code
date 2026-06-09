import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { pickLocale, type UserLocale } from "@/lib/lineNotificationKinds";
import { toast } from "sonner";

export function DisplayThemeSection() {
  const { theme, setTheme } = useTheme();
  const { profile, refreshProfile } = useAuth();
  const locale = pickLocale(profile?.locale);
  const [savingLocale, setSavingLocale] = React.useState(false);

  async function setLocale(next: UserLocale) {
    if (!profile?.user_id || next === locale) return;
    setSavingLocale(true);
    const { error } = await supabase
      .from("profiles")
      .update({ locale: next })
      .eq("user_id", profile.user_id);
    setSavingLocale(false);
    if (error) {
      toast.error(locale === "en" ? "Could not save language" : "บันทึกภาษาไม่สำเร็จ");
      return;
    }
    await refreshProfile();
    toast.success(locale === "en" ? "Language updated" : "อัปเดตภาษาแล้ว");
  }

  return (
    <Card className="glass border-border shadow-soft">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              {locale === "en" ? "Theme & language" : "ธีม & ภาษา"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {locale === "en"
                ? "Display mode and notification language (LINE, etc.)"
                : "โหมดแสดงผลและภาษาข้อความแจ้งเตือน (LINE ฯลฯ)"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" /> กลับหน้าฟีด
              </Link>
            </Button>
            <div className="inline-flex rounded-xl border border-border/60 bg-muted/40 p-1">
              <Button
                type="button"
                size="sm"
                variant={theme === "light" ? "default" : "ghost"}
                onClick={() => setTheme("light")}
                className="h-8 gap-1.5 rounded-lg"
              >
                <Sun className="h-4 w-4" /> Light
              </Button>
              <Button
                type="button"
                size="sm"
                variant={theme === "dark" ? "default" : "ghost"}
                onClick={() => setTheme("dark")}
                className="h-8 gap-1.5 rounded-lg"
              >
                <Moon className="h-4 w-4" /> Dark
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            {locale === "en" ? "Notification language" : "ภาษาแจ้งเตือน"}
            {savingLocale && <Loader2 className="inline h-3 w-3 ml-1.5 animate-spin" />}
          </p>
          <div className="inline-flex rounded-xl border border-border/60 bg-muted/40 p-1">
            <Button
              type="button"
              size="sm"
              variant={locale === "th" ? "default" : "ghost"}
              onClick={() => setLocale("th")}
              disabled={savingLocale}
              className="h-8 rounded-lg text-xs"
            >
              ไทย
            </Button>
            <Button
              type="button"
              size="sm"
              variant={locale === "en" ? "default" : "ghost"}
              onClick={() => setLocale("en")}
              disabled={savingLocale}
              className="h-8 rounded-lg text-xs"
            >
              English
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
