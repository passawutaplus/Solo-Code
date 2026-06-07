import * as React from "react";
import { ClientsTab } from "./ClientsTab";
import { SuppliersTab } from "./SuppliersTab";
import { AssetsTab } from "./AssetsTab";
import { LegalDeskTab } from "@/components/legal-desk/LegalDeskTab";

export type MyDataSub = "clients" | "suppliers" | "assets" | "legal";

export function MyDataTab({
  sub = "clients",
  onNavigate,
}: {
  sub?: MyDataSub;
  onNavigate?: (section: string, sub?: string) => void;
}) {
  return (
    <div className="animate-fade-in">
      {sub === "clients" && <ClientsTab />}
      {sub === "suppliers" && <SuppliersTab />}
      {sub === "assets" && <AssetsTab />}
      {sub === "legal" && <LegalDeskTab onNavigate={onNavigate} />}
    </div>
  );
}
