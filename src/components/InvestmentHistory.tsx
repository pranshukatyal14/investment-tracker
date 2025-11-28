import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp } from "lucide-react";
import { Investment, Category } from "@/types/investment";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InvestmentHistoryProps {
  investments: Investment[];
  categories: Category[];
  onDelete: (id: string) => void;
}

export function InvestmentHistory({ investments, categories, onDelete }: InvestmentHistoryProps) {
  const getCategoryColor = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)?.color || "#6b7280";
  };

  const sortedInvestments = [...investments].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  ).slice(0, 10); // Show only last 10 investments

  if (investments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
        <p className="text-muted-foreground">
          Start tracking your investments by adding your first entry
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Investments</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {sortedInvestments.map((investment) => (
            <Card key={investment.id} className="p-4 hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(investment.category) }}
                    />
                    <span className="font-semibold text-foreground">
                      {investment.subcategory ? `${investment.category} - ${investment.subcategory}` : investment.category}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-success">
                    ₹{investment.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(investment.date, "PPP")}
                  </p>
                  {investment.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {investment.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(investment.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
