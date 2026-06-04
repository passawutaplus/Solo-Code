import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signInWithOAuth } from "@/integrations/oauth";
import { cn } from "@/lib/utils";

async function handleOAuth(provider: "google" | "apple", redirectTo?: string) {
  const result = await signInWithOAuth(provider, { redirectTo });
  if (result.error) {
    toast.error(result.error.message || `เข้าสู่ระบบด้วย ${provider} ไม่สำเร็จ`);
  }
}

export function SocialButtons({
  className,
  redirectTo,
}: {
  className?: string;
  redirectTo?: string;
}) {
  const [busy, setBusy] = React.useState<"google" | "apple" | null>(null);
  return (
    <div className={className ?? "grid grid-cols-2 gap-2"}>
      <Button
        type="button"
        variant="outline"
        disabled={busy !== null}
        onClick={async () => {
          setBusy("google");
          try {
            await handleOAuth("google", redirectTo);
          } finally {
            setBusy(null);
          }
        }}
        className="h-11 gap-2 rounded-lg"
      >
        {busy === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
            />
          </svg>
        )}
        <span className="text-sm">Google</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={busy !== null}
        onClick={async () => {
          setBusy("apple");
          try {
            await handleOAuth("apple", redirectTo);
          } finally {
            setBusy(null);
          }
        }}
        className="h-11 gap-2 rounded-lg"
      >
        {busy === "apple" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.412 2.226-1.157 3.013-.793.842-2.043 1.481-3.245 1.388-.114-1.108.41-2.244 1.143-3.018C13.953 1.96 15.27 1.378 16.365 1.43zM20.5 17.36c-.487 1.105-.722 1.6-1.355 2.578-.882 1.366-2.124 3.067-3.66 3.083-1.367.014-1.717-.886-3.572-.876-1.855.012-2.244.892-3.612.878-1.534-.014-2.711-1.55-3.594-2.918C2.272 16.224 1.985 11.41 3.524 8.93c1.094-1.762 2.823-2.79 4.45-2.79 1.652 0 2.69.91 4.058.91 1.327 0 2.135-.911 4.045-.911 1.45 0 2.984.792 4.077 2.16-3.585 1.965-3.003 7.085.346 9.062z" />
          </svg>
        )}
        <span className="text-sm">Apple</span>
      </Button>
    </div>
  );
}

export function AuthEmailSeparator({ surface = "background" }: { surface?: "background" | "card" }) {
  const bg = surface === "card" ? "bg-card" : "bg-background";
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-[11px]">
        <span className={cn(bg, "px-3 text-muted-foreground")}>หรือเข้าด้วยอีเมล</span>
      </div>
    </div>
  );
}
