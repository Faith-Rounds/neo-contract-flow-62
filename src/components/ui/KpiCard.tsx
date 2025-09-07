import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  hint?: string;
  accent?: "blue" | "green";
  className?: string;
}

export function KpiCard({ label, value, delta, hint, accent, className }: KpiCardProps) {
  return (
    <Card className={cn("hover-glow animate-fade-up", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {delta && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              delta.startsWith("+") ? "text-accent bg-accent/10" : "text-muted-foreground bg-muted"
            )}>
              {delta}
            </span>
          )}
        </div>
        <div className={cn(
          "text-3xl font-heading animate-count-up",
          accent === "green" ? "text-accent" : accent === "blue" ? "text-primary" : "text-ink"
        )}>
          {value}
        </div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}