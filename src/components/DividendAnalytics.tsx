import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Dividend } from "@/types/investment";
import { format, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";

interface DividendAnalyticsProps {
  dividends: Dividend[];
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

export function DividendAnalytics({ dividends }: DividendAnalyticsProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Get current month dividends for pie chart
  const currentMonthDividends = dividends.filter(
    div => div.date.getMonth() === currentMonth && div.date.getFullYear() === currentYear
  );

  const totalCurrentMonth = currentMonthDividends.reduce((sum, div) => sum + div.amount, 0);

  // Pie chart data - company breakdown for current month
  const pieData = (() => {
    const companyMap = new Map<string, { amount: number; company: string; stockSymbol: string; count: number }>();
    currentMonthDividends.forEach((div) => {
      const key = `${div.company}-${div.stockSymbol}`;
      const current = companyMap.get(key) || { amount: 0, company: div.company, stockSymbol: div.stockSymbol, count: 0 };
      companyMap.set(key, { 
        amount: current.amount + div.amount, 
        company: div.company, 
        stockSymbol: div.stockSymbol,
        count: current.count + 1
      });
    });

    return Array.from(companyMap.entries()).map(([key, data]) => ({
      name: `${data.company} (${data.stockSymbol})`,
      value: data.amount,
      percentage: totalCurrentMonth > 0 ? (data.amount / totalCurrentMonth) * 100 : 0,
      color: generateCompanyColor(data.company),
      count: data.count,
    }));
  })();

  // Bar chart data - monthly comparison for the year
  const barData = (() => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map((month) => {
      const monthDividends = dividends.filter(
        div => div.date.getMonth() === month.getMonth() && div.date.getFullYear() === currentYear
      );

      const total = monthDividends.reduce((sum, div) => sum + div.amount, 0);
      
      // Calculate company breakdown for each month
      const companyBreakdown: { [key: string]: number } = {};

      monthDividends.forEach(div => {
        const key = `${div.company} (${div.stockSymbol})`;
        if (companyBreakdown[key] === undefined) {
          companyBreakdown[key] = 0;
        }
        companyBreakdown[key] += div.amount;
      });

      return {
        month: format(month, "MMM"),
        total,
        ...companyBreakdown,
      };
    });
  })();

  // Calculate year totals
  const yearDividends = dividends.filter(div => div.date.getFullYear() === currentYear);
  const yearTotal = yearDividends.reduce((sum, div) => sum + div.amount, 0);
  const yearTransactions = yearDividends.length;

  return (
    <div className="space-y-6">
      {/* Year Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 bg-gradient-success text-success-foreground">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Dividends ({currentYear})</h3>
          <p className="text-3xl font-bold">₹{yearTotal.toLocaleString("en-IN")}</p>
        </Card>
        <Card className="p-6 bg-gradient-primary text-primary-foreground">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Payments</h3>
          <p className="text-3xl font-bold">{yearTransactions}</p>
        </Card>
        <Card className="p-6 bg-gradient-accent text-accent-foreground">
          <h3 className="text-sm font-medium opacity-90 mb-2">Average per Month</h3>
          <p className="text-3xl font-bold">
            ₹{Math.round(yearTotal / (currentMonth + 1)).toLocaleString("en-IN")}
          </p>
        </Card>
      </div>

      {/* Pie Chart - Current Month Company Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">
          {format(new Date(), "MMMM yyyy")} - Dividend Distribution by Company
        </h3>
        
        {pieData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No dividends for this month yet
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <span className="font-medium block">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.count} {item.count === 1 ? 'payment' : 'payments'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.value.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Bar Chart - Monthly Comparison */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">
          {currentYear} - Monthly Dividend Comparison
        </h3>
        
        {yearTotal === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No dividends for this year yet
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                />
                <Legend />
                {(() => {
                  const allKeys = new Set<string>();
                  barData.forEach(row => {
                    Object.keys(row).forEach(key => {
                      if (key !== 'month' && key !== 'total') {
                        allKeys.add(key);
                      }
                    });
                  });
                  return Array.from(allKeys).map((key) => {
                    const companyName = key.split(' (')[0];
                    return (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={generateCompanyColor(companyName)}
                      />
                    );
                  });
                })()}
              </BarChart>
            </ResponsiveContainer>

            {/* Monthly breakdown table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Month</th>
                    <th className="text-right p-2 font-semibold">Total</th>
                    {(() => {
                      const allKeys = new Set<string>();
                      barData.forEach(row => {
                        Object.keys(row).forEach(key => {
                          if (key !== 'month' && key !== 'total') {
                            allKeys.add(key);
                          }
                        });
                      });
                      return Array.from(allKeys).map((key) => (
                        <th key={key} className="text-right p-2 font-semibold">{key}</th>
                      ));
                    })()}
                  </tr>
                </thead>
                <tbody>
                  {barData.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{row.month}</td>
                      <td className="text-right p-2 font-semibold text-success">
                        ₹{row.total.toLocaleString("en-IN")}
                      </td>
                      {(() => {
                        const allKeys = new Set<string>();
                        barData.forEach(r => {
                          Object.keys(r).forEach(key => {
                            if (key !== 'month' && key !== 'total') {
                              allKeys.add(key);
                            }
                          });
                        });
                        return Array.from(allKeys).map((key) => (
                          <td key={key} className="text-right p-2 text-muted-foreground">
                            ₹{(row[key as keyof typeof row] as number || 0).toLocaleString("en-IN")}
                          </td>
                        ));
                      })()}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
