import * as React from "react";
import { SubscriptionsTab } from "./SubscriptionsTab";
import { TaxTab } from "./TaxTab";
import { QuotationsTab } from "./QuotationsTab";
import { JobTrackerTab } from "./JobTrackerTab";
import { QuotationsProvider } from "@/store/quotations";
import { ClientsProvider } from "@/store/clients";

export type FinanceSub = "quotations" | "tax" | "subs" | "jobs";

export function FinanceTab({ sub = "quotations" }: { sub?: FinanceSub }) {
  return (
    <ClientsProvider>
      <QuotationsProvider>
        <div className="animate-fade-in">
          {sub === "quotations" && <QuotationsTab />}
          {sub === "tax" && <TaxTab />}
          {sub === "subs" && <SubscriptionsTab />}
          {sub === "jobs" && <JobTrackerTab />}
        </div>
      </QuotationsProvider>
    </ClientsProvider>
  );
}
