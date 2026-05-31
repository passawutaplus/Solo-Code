import * as React from "react";
import { ClientsTab } from "./ClientsTab";
import { SuppliersTab } from "./SuppliersTab";
import { AssetsTab } from "./AssetsTab";

export type MyDataSub = "clients" | "suppliers" | "assets";

export function MyDataTab({ sub = "clients" }: { sub?: MyDataSub }) {
  return (
    <div className="animate-fade-in">
      {sub === "clients" && <ClientsTab />}
      {sub === "suppliers" && <SuppliersTab />}
      {sub === "assets" && <AssetsTab />}
    </div>
  );
}
