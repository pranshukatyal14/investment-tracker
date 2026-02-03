import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DividendStats } from "@/types/investment";

interface DividendChartProps {
  stats: DividendStats;
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

export function DividendChart({ stats }: DividendChartProps) {
  const data = stats.companyBreakdown.map((item) => ({
    name: `${item.company} (${item.stockSymbol})`,
    value: item.amount,
    percentage: item.percentage,
    color: generateCompanyColor(item.company),
  }));

  if (data.length === 0 || stats.currentMonthDividends === 0) {
    return (
      <Card className="p-6 sm:p-12 text-center">
        <p className="text-muted-foreground text-sm sm:text-base">
          No dividend data to display yet. Add your first dividend to see the breakdown.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
        Dividend Distribution by Company
      </h3>
      
      {/* Mobile view - smaller chart */}
      <div className="block sm:hidden">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Desktop view - larger chart with labels */}
      <div className="hidden sm:block">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown details */}
      <div className="mt-4 sm:mt-6 space-y-3">
        {stats.companyBreakdown.map((item) => (
          <div 
            key={`${item.company}-${item.stockSymbol}`} 
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: generateCompanyColor(item.company) }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium block truncate">
                  {item.company}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.stockSymbol} • {item.transactionCount} {item.transactionCount === 1 ? 'payment' : 'payments'}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold">
                ₹{item.amount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
