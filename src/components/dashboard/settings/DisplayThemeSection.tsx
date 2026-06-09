import { Link } from "@tanstack/react-router";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";

export function DisplayThemeSection() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="glass border-border shadow-soft">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">ธีมการแสดงผล</h2>
            <p className="text-xs text-muted-foreground">เลือกโหมดสว่างหรือมืดตามที่คุณชอบ</p>
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
      </CardContent>
    </Card>
  );
}
