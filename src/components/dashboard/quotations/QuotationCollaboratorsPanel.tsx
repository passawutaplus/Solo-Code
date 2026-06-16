import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useQuotationCollaborators } from "@/hooks/useQuotationCollaborators";
import type { QuotationKind } from "@/lib/quotationKinds";

interface Props {
  quotationId: string;
  quotationKind?: QuotationKind;
}

export function QuotationCollaboratorsPanel({ quotationId, quotationKind }: Props) {
  const { data: collaborators = [], isLoading } = useQuotationCollaborators(
    quotationKind && quotationKind !== "solo" ? quotationId : undefined,
  );

  if (!quotationKind || quotationKind === "solo") return null;

  const label =
    quotationKind === "inhouse" ? "สมาชิกทีม (In-House)" : "สมาชิก Studio (an1hem nest)";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-xs text-muted-foreground">กำลังโหลด...</p>
        ) : collaborators.length === 0 ? (
          <p className="text-xs text-muted-foreground">ยังไม่มีสมาชิกในใบเสนอราคานี้</p>
        ) : (
          <ul className="space-y-2">
            {collaborators.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span>{c.displayName || "สมาชิก"}</span>
                <div className="flex items-center gap-2">
                  {c.revenuePercent != null && (
                    <span className="text-xs text-muted-foreground num">{c.revenuePercent}%</span>
                  )}
                  {c.role === "lead" && (
                    <Badge variant="secondary" className="text-[10px]">
                      Lead
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
