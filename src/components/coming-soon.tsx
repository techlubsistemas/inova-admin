import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  fase,
  description,
}: {
  fase: string;
  description: string;
}) {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="flex flex-col gap-2 p-8 text-center">
        <div className="text-xs font-medium uppercase tracking-wider text-primary">
          {fase}
        </div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </CardContent>
    </Card>
  );
}
