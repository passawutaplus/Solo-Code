import * as React from "react";
import { SubscriptionsTab } from "./SubscriptionsTab";
import { TaxTab } from "./TaxTab";
import { IncomeTab } from "./IncomeTab";
import { QuotationsTab } from "./QuotationsTab";
import { JobTrackerTab } from "./JobTrackerTab";
import { PipelineTab } from "./PipelineTab";
import { FinanceBreadcrumb } from "./FinanceBreadcrumb";
import { QuotationsProvider } from "@/store/quotations";
import { ClientsProvider } from "@/store/clients";
import type { FinanceMoneySub } from "./FinanceMoneyNav";

export type FinanceSub = "pipeline" | "quotations" | "tax" | "income" | "subs" | "jobs";

type Props = {
  sub?: FinanceSub;
  onMoneySubChange?: (sub: FinanceMoneySub) => void;
  onSubChange?: (sub: FinanceSub) => void;
};

export function FinanceTab({ sub = "quotations", onMoneySubChange, onSubChange }: Props) {
  const navigateMoney = React.useCallback(
    (next: FinanceMoneySub) => onMoneySubChange?.(next),
    [onMoneySubChange],
  );

  const navigateSub = React.useCallback(
    (next: FinanceSub) => onSubChange?.(next),
    [onSubChange],
  );

  const openQuotation = React.useCallback(
    (id: string) => {
      try {
        sessionStorage.setItem("so1o.openQuotationId", id);
      } catch {
        /* noop */
      }
      navigateSub("quotations");
    },
    [navigateSub],
  );

  return (
    <ClientsProvider>
      <QuotationsProvider>
        <div className="animate-fade-in">
          <FinanceBreadcrumb sub={sub} onNavigate={navigateSub} />
          {sub === "pipeline" && (
            <PipelineTab onNavigate={navigateSub} onOpenQuotation={openQuotation} />
          )}
          {sub === "quotations" && <QuotationsTab />}
          {sub === "income" && <IncomeTab onNavigate={navigateMoney} />}
          {sub === "tax" && <TaxTab onNavigate={navigateMoney} onSubChange={navigateSub} />}
          {sub === "subs" && <SubscriptionsTab />}
          {sub === "jobs" && <JobTrackerTab onSubChange={navigateSub} />}
        </div>
      </QuotationsProvider>
    </ClientsProvider>
  );
}
