import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FlaskConical, Palette } from "lucide-react";
import { PaletteSkeleton } from "@/components/dashboard/skeletons/TabSkeletons";

const ColorLabInline = React.lazy(() =>
  import("./briefs/ColorLab/ColorLabInline").then((m) => ({ default: m.ColorLabInline })),
);
const MyPalettes = React.lazy(() =>
  import("./labs/MyPalettes").then((m) => ({ default: m.MyPalettes })),
);

function ColorLabFallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="grid sm:grid-cols-[260px_1fr] gap-4">
        <Skeleton className="h-44 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

export function LabsTab() {
  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6 glass relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-elevated">
              <FlaskConical className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
              <Palette className="h-3 w-3 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Color Lab</h2>
              <Badge variant="outline" className="text-[10px]">ห้องทดลอง</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              ทดลองสี · ตรวจสอบ Contrast · บันทึกสีที่ชอบเป็นพาเลทส่วนตัว
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4 glass">
        <React.Suspense fallback={<ColorLabFallback />}>
          <ColorLabSwitcher />
        </React.Suspense>
      </Card>

      <React.Suspense fallback={<PaletteSkeleton />}>
        <MyPalettesWrapper />
      </React.Suspense>
    </div>
  );
}

function ColorLabSwitcher() {
  const [hex, setHex] = React.useState<string>("#FF6B00");
  (window as unknown as { __so1oColorHex?: (h: string) => void }).__so1oColorHex = setHex;
  return <ColorLabInline hex={hex} onHexChange={setHex} />;
}

function MyPalettesWrapper() {
  const setHex = (h: string) => {
    const fn = (window as unknown as { __so1oColorHex?: (h: string) => void }).__so1oColorHex;
    if (fn) fn(h);
  };
  return <MyPalettes onPickColor={setHex} />;
}
