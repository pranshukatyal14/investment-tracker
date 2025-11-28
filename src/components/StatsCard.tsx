import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "accent";
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-6 transition-all duration-300 hover:shadow-medium animate-fade-in",
        variant === "success" && "bg-gradient-success text-success-foreground",
        variant === "accent" && "bg-gradient-accent text-accent-foreground",
        variant === "default" && "bg-gradient-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === "default" ? "text-muted-foreground" : "opacity-90"
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-xs",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "rounded-full p-3",
          variant === "default" && "bg-primary/10 text-primary",
          variant === "success" && "bg-white/20 text-white",
          variant === "accent" && "bg-white/20 text-white"
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
