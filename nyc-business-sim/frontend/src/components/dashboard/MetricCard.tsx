import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
};

const MetricCard = ({ title, value, change, icon: Icon, iconColor = "text-primary", trend, subtitle }: Props) => {
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  
  return (
    <div className="metric-card group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20"
        )}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        {change !== undefined && (
          <span className={cn("text-sm font-semibold", trendColor)}>
            {change > 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;
