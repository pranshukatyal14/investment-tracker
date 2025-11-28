import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Investment, Category } from "@/types/investment";
import { format, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";

interface AnalyticsViewProps {
  investments: Investment[];
  categories: Category[];
}

export function AnalyticsView({ investments, categories }: AnalyticsViewProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Get current month investments for pie chart
  const currentMonthInvestments = investments.filter(
    inv => inv.date.getMonth() === currentMonth && inv.date.getFullYear() === currentYear
  );

  const totalCurrentMonth = currentMonthInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  // Pie chart data - category breakdown for current month
  const pieData = (() => {
    const categoryMap = new Map<string, { amount: number; category: string; subcategory?: string }>();
    currentMonthInvestments.forEach((inv) => {
      const key = inv.subcategory ? `${inv.category}-${inv.subcategory}` : inv.category;
      const current = categoryMap.get(key) || { amount: 0, category: inv.category, subcategory: inv.subcategory };
      categoryMap.set(key, { 
        amount: current.amount + inv.amount, 
        category: inv.category, 
        subcategory: inv.subcategory 
      });
    });

    return Array.from(categoryMap.entries()).map(([key, data]) => {
      const categoryData = categories.find((c) => c.name === data.category);
      return {
        name: data.subcategory ? `${data.category} - ${data.subcategory}` : data.category,
        value: data.amount,
        percentage: totalCurrentMonth > 0 ? (data.amount / totalCurrentMonth) * 100 : 0,
        color: categoryData?.color || "#6b7280",
      };
    });
  })();

  // Bar chart data - monthly comparison for the year
  const barData = (() => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map((month) => {
      const monthInvestments = investments.filter(
        inv => inv.date.getMonth() === month.getMonth() && inv.date.getFullYear() === currentYear
      );

      const total = monthInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      
      // Calculate category breakdown for each month
      const categoryBreakdown: { [key: string]: number } = {};

      monthInvestments.forEach(inv => {
        const key = inv.subcategory ? `${inv.category} - ${inv.subcategory}` : inv.category;
        if (categoryBreakdown[key] === undefined) {
          categoryBreakdown[key] = 0;
        }
        categoryBreakdown[key] += inv.amount;
      });

      return {
        month: format(month, "MMM"),
        total,
        ...categoryBreakdown,
      };
    });
  })();

  // Calculate year totals
  const yearInvestments = investments.filter(inv => inv.date.getFullYear() === currentYear);
  const yearTotal = yearInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const yearTransactions = yearInvestments.length;

  return (
    <div className="space-y-6">
      {/* Year Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 bg-gradient-success text-success-foreground">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Invested ({currentYear})</h3>
          <p className="text-3xl font-bold">₹{yearTotal.toLocaleString("en-IN")}</p>
        </Card>
        <Card className="p-6 bg-gradient-primary text-primary-foreground">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold">{yearTransactions}</p>
        </Card>
        <Card className="p-6 bg-gradient-accent text-accent-foreground">
          <h3 className="text-sm font-medium opacity-90 mb-2">Average per Month</h3>
          <p className="text-3xl font-bold">
            ₹{Math.round(yearTotal / (currentMonth + 1)).toLocaleString("en-IN")}
          </p>
        </Card>
      </div>

      {/* Pie Chart - Current Month Category Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">
          {format(new Date(), "MMMM yyyy")} - Category Distribution
        </h3>
        
        {pieData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No investments for this month yet
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
                    <span className="font-medium">{item.name}</span>
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
          {currentYear} - Monthly Investment Comparison
        </h3>
        
        {yearTotal === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No investments for this year yet
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
                    const categoryName = key.includes(' - ') ? key.split(' - ')[0] : key;
                    const categoryData = categories.find(c => c.name === categoryName);
                    return (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={categoryData?.color || "#6b7280"}
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
