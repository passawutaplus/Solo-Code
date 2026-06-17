import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { RouteError } from "@/components/RouteError";
import { HttpErrorPage } from "@/components/HttpErrorPage";
import { Loader2 } from "lucide-react";
import { getPublicTrackingJob } from "@/server/track.functions";
import { ClientCheckoutView } from "@/components/track/checkout/ClientCheckoutView";
import type { PortalBranding } from "@/lib/documentTheme/types";
import type { ClientPaymentEstimate } from "@/lib/stripeClientPaymentFees";

export const Route = createFileRoute("/track/$token/checkout")({
  validateSearch: (search: Record<string, unknown>) => {
    const payment = search.payment;
    if (payment !== "deposit" && payment !== "final") {
      return { payment: "deposit" as const };
    }
    return { payment };
  },
  head: ({ params }) => ({
    meta: [
      { title: "สรุปการชำระเงิน | So1o Freelancer" },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:url", content: `https://solofreelancer.com/track/${params.token}/checkout` },
    ],
  }),
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: CheckoutPage,
});

type Job = {
  title: string;
  client_name: string;
  tracking_code: string;
  total_amount: number;
  deposit_percent: number;
  amount_due: number;
  deposit_paid: boolean;
  final_paid: boolean;
};

function CheckoutPage() {
  const { token } = Route.useParams();
  const { payment } = Route.useSearch();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [job, setJob] = React.useState<Job | null>(null);
  const [quotation, setQuotation] = React.useState<Parameters<typeof ClientCheckoutView>[0]["quotation"]>(null);
  const [portal, setPortal] = React.useState<PortalBranding | null>(null);
  const [estimate, setEstimate] = React.useState<ClientPaymentEstimate | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getPublicTrackingJob({ data: { token } });
        if (cancelled) return;
        const j = res.job as Job | null;
        if (!j) {
          setNotFound(true);
          return;
        }

        const payments = res.payments as {
          stripeEnabled: boolean;
          deposit?: ClientPaymentEstimate;
          final?: ClientPaymentEstimate;
        } | null;

        const est = payment === "final" ? payments?.final : payments?.deposit;
        const valid =
          payments?.stripeEnabled &&
          est &&
          ((payment === "deposit" && !j.deposit_paid) ||
            (payment === "final" && j.deposit_paid && !j.final_paid));

        if (!valid) {
          navigate({ to: "/track/$token", params: { token } });
          return;
        }

        setJob(j);
        setQuotation((res.quotation ?? null) as typeof quotation);
        setPortal((res.portal ?? null) as PortalBranding | null);
        setEstimate(est!);
      } catch {
        if (cancelled) return;
        setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, payment]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !job || !estimate) {
    return <HttpErrorPage kind="token" code={404} showRetry={false} />;
  }

  return (
    <ClientCheckoutView
      token={token}
      paymentType={payment}
      job={job}
      quotation={quotation}
      portal={portal}
      estimate={estimate}
    />
  );
}
