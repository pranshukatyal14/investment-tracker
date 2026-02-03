import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, DollarSign } from "lucide-react";
import { Dividend } from "@/types/investment";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DividendHistoryProps {
  dividends: Dividend[];
  onDelete: (id: string) => void;
}

// Generate consistent colors for companies
const generateCompanyColor = (company: string): string => {
  const colors = [
    "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
    "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1"
  ];
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function DividendHistory({ dividends, onDelete }: DividendHistoryProps) {
  const sortedDividends = [...dividends].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  ).slice(0, 10); // Show only last 10 dividends

  if (dividends.length === 0) {
    return (
      <Card className="p-12 text-center">
        <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No dividends recorded yet</h3>
        <p className="text-muted-foreground">
          Start tracking your dividend income by adding your first entry
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-4">Recent Dividends</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {sortedDividends.map((dividend) => (
            <Card key={dividend.id} className="p-3 sm:p-4 hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: generateCompanyColor(dividend.company) }}
                    />
                    <span className="font-semibold text-foreground text-sm sm:text-base truncate">
                      {dividend.company}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {dividend.stockSymbol}
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-success">
                    ₹{dividend.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(dividend.date, "PPP")}
                  </p>
                  {dividend.notes && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                      {dividend.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(dividend.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
