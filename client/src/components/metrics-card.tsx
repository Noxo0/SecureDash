import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function MetricsCard({ title, value, change, changeType = "neutral", icon: Icon }: MetricsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-accent";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline space-x-2">
          <p className="text-2xl font-bold text-foreground" data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
          {change && (
            <span className={`text-xs ${getChangeColor()}`}>
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
