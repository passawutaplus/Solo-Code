import * as React from "react";
import {
  CheckCircle2, Clock, AlertTriangle, AlertOctagon,
} from "lucide-react";

export const CLIENT_GRADES: Record<string, { grade: "A" | "B" | "C"; traits: string[] }> = {
  "Nimbus Co.": { grade: "A", traits: ["จ่ายตรงเวลา", "บรีฟชัด"] },
  "Aroma Café": { grade: "B", traits: ["แก้งาน 2-3 รอบ"] },
  "GreenLeaf": { grade: "C", traits: ["จ่ายช้า", "แก้งานเยอะ"] },
  "FitLab": { grade: "A", traits: ["บรีฟดี", "ตัดสินใจไว"] },
};

export const CONTRACTS = [
  { title: "ลิขสิทธิ์งาน", detail: "งานทั้งหมดเป็นของลูกค้าเมื่อชำระครบ" },
  { title: "จำนวนแก้ไข", detail: "ฟรี 3 ครั้ง หลังจากนั้นคิด 500 บาท/ครั้ง" },
  { title: "การยกเลิก", detail: "เก็บมัดจำ 30% หากยกเลิกหลังเริ่มงาน" },
  { title: "การส่งมอบ", detail: "ส่งไฟล์ผ่าน Google Drive เท่านั้น" },
];

export const GRADE_COLOR = {
  A: "bg-success/15 text-success",
  B: "bg-primary-soft text-primary",
  C: "bg-destructive/15 text-destructive",
} as const;

export const STATUS_META = {
  paid: { label: "จ่ายแล้ว", icon: CheckCircle2, className: "bg-success/15 text-success" },
  ontime: { label: "ตรงเวลา", icon: Clock, className: "bg-primary-soft text-primary" },
  late7: { label: "เลท 7 วัน", icon: AlertTriangle, className: "bg-warning/20 text-warning-foreground" },
  late30: { label: "เลท 1 เดือน", icon: AlertOctagon, className: "bg-destructive/15 text-destructive" },
} as const;

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
      {children}
    </h3>
  );
}

export function Field({
  label, icon: Icon, children,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />} {label}
      </label>
      {children}
    </div>
  );
}
