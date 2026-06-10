import { useAuth } from "@/auth/AuthProvider";
import { formatCustomerId, siteBrandLabel } from "@/lib/userDisplayId";
import { cn } from "@/lib/utils";

interface AccountIdentityBadgeProps {
  variant?: "sidebar" | "settings";
  collapsed?: boolean;
  className?: string;
}

export function AccountIdentityBadge({
  variant = "sidebar",
  collapsed = false,
  className,
}: AccountIdentityBadgeProps) {
  const { user } = useAuth();
  if (!user) return null;

  const customerId = formatCustomerId(user.id);
  const brand = siteBrandLabel();

  if (variant === "settings") {
    return (
      <div className={cn("text-right shrink-0", className)}>
        <p className="text-[11px] text-muted-foreground">
          รหัสลูกค้า:{" "}
          <span className="font-semibold text-sky-600 dark:text-sky-400 tabular-nums">{customerId}</span>
        </p>
        <p className="text-[10px] text-muted-foreground/80 mt-0.5">{brand}</p>
      </div>
    );
  }

  if (collapsed) {
    return (
      <div
        title={`รหัสลูกค้า: ${customerId}`}
        className={cn(
          "mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white tabular-nums",
          className,
        )}
      >
        {customerId.slice(1, 4)}
      </div>
    );
  }

  return (
    <div className={cn("w-full min-w-0 rounded-lg bg-white/10 px-2.5 py-2 text-center", className)}>
      <p className="text-[11px] text-white/90">
        รหัสลูกค้า:{" "}
        <span className="font-semibold text-white tabular-nums">{customerId}</span>
      </p>
      <p className="text-[9px] text-white/70 mt-0.5 truncate">{brand}</p>
    </div>
  );
}
