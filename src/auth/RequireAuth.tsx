import * as React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/auth/AuthProvider";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function RequireAuth({ children, requireAdmin = false }: Props) {
  const { user, isAdmin, profile, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hasResolvedRef = React.useRef(false);

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
    } else if (profile?.is_active === false) {
      navigate({ to: "/auth" });
    } else if (requireAdmin && !isAdmin) {
      navigate({ to: "/dashboard" });
    } else if (!isAdmin && !profile?.tester_approved && pathname !== "/apply") {
      // Gate everything except /apply behind tester approval
      navigate({ to: "/apply" });
    }
  }, [user, isAdmin, profile?.is_active, profile?.tester_approved, loading, requireAdmin, navigate, pathname]);

  const blocked =
    !user ||
    profile?.is_active === false ||
    (requireAdmin && !isAdmin) ||
    (!isAdmin && !profile?.tester_approved && pathname !== "/apply");

  // Once we've successfully passed the gate, don't unmount children on
  // transient profile re-fetches (token refresh, etc.) — keep the tree
  // mounted so local state (selected tabs, etc.) doesn't reset.
  if (!blocked && !loading) {
    hasResolvedRef.current = true;
  }

  if ((loading || blocked) && !hasResolvedRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
