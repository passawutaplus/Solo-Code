import * as React from "react";
import { SubscriptionsTab } from "./SubscriptionsTab";
import { TaxTab } from "./TaxTab";
import { IncomeTab } from "./IncomeTab";
import { QuotationsTab } from "./QuotationsTab";
import { JobTrackerTab } from "./JobTrackerTab";
import { QuotationsProvider } from "@/store/quotations";
import { ClientsProvider } from "@/store/clients";
import type { FinanceMoneySub } from "./FinanceMoneyNav";

export type FinanceSub = "quotations" | "tax" | "income" | "subs" | "jobs";

type Props = {
  sub?: FinanceSub;
  onMoneySubChange?: (sub: FinanceMoneySub) => void;
};

export function FinanceTab({ sub = "quotations", onMoneySubChange }: Props) {
  const navigateMoney = React.useCallback(
    (next: FinanceMoneySub) => onMoneySubChange?.(next),
    [onMoneySubChange],
  );

  return (
    <ClientsProvider>
      <QuotationsProvider>
        <div className="animate-fade-in">
          {sub === "quotations" && <QuotationsTab />}
          {sub === "income" && <IncomeTab onNavigate={navigateMoney} />}
          {sub === "tax" && <TaxTab onNavigate={navigateMoney} />}
          {sub === "subs" && <SubscriptionsTab />}
          {sub === "jobs" && <JobTrackerTab />}
        </div>
      </QuotationsProvider>
    </ClientsProvider>
  );
}
