import { Wallet, TrendingUp, PiggyBank, Target, ArrowRightLeft , Edit} from "lucide-react";
import { Button } from "@/components/ui/button";

import { StatsCard } from "@/components/StatsCard";
import { InvestmentHistory } from "@/components/InvestmentHistory";
import { InvestmentChart } from "@/components/InvestmentChart";
import { Investment, Category, InvestmentStats } from "@/types/investment";

interface DashboardViewProps {
  stats: InvestmentStats;
  investments: Investment[];
  categories: Category[];
  currentMonthInvestmentCount: number;
  onDelete: (id: string) => void;
  onEditCarryover?: () => void; // Add this prop

}

export function DashboardView({
  stats,
  investments,
  categories,
  currentMonthInvestmentCount,
  onDelete,
    onEditCarryover, // Add this

}: DashboardViewProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatsCard
          title="Total Budget"
          value={`₹${stats.totalBudget.toLocaleString("en-IN")}`}
          subtitle="This month's allocation"
          icon={Wallet}
          variant="default"
        />
        <StatsCard
          title="Invested This Month"
          value={`₹${stats.totalInvested.toLocaleString("en-IN")}`}
          subtitle={`${currentMonthInvestmentCount} transactions`}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title="Remaining Budget"
          value={`₹${stats.remainingBudget.toLocaleString("en-IN")}`}
          subtitle={
            stats.totalBudget > 0
              ? `${((stats.remainingBudget / stats.totalBudget) * 100).toFixed(1)}% available`
              : "Set budget to track"
          }
          icon={PiggyBank}
          variant="accent"
        />
        <StatsCard
          title="Investment Goal"
          value={stats.totalBudget > 0 ? `${((stats.totalInvested / stats.totalBudget) * 100).toFixed(1)}%` : "0%"}
          subtitle="of monthly target"
          icon={Target}
          variant="default"
        />

        <StatsCard
          title="Carried Over"
          value={`₹${stats.carryOver.toLocaleString("en-IN")}`}
          subtitle={
            stats.categoryAllocations.length > 0
              ? stats.categoryAllocations.map(alloc => {
                const spent = stats.categoryBreakdown.find(cb => cb.category === alloc.categoryName)?.amount || 0;
                const carryover = Math.max(0, alloc.allocatedAmount - spent);
                return carryover > 0 ? `${alloc.categoryName}: ₹${carryover.toLocaleString()}` : null;
              }).filter(Boolean).join(', ') || "From previous month"
              : "From previous month"
          }
          icon={ArrowRightLeft}
          variant="default"
        />


      </div>
        {stats.carryOver > 0 && (
        <div className="bg-card rounded-lg border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Carryover Breakdown</h3>
            {onEditCarryover && (
              <Button variant="outline" size="sm" onClick={onEditCarryover} className="self-start sm:self-auto">
                <Edit className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Edit Allocation</span>
              </Button>
            )}
          </div>
          <div className="grid gap-4">
            {/* Show total carryover */}
            <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded">
              <span className="font-medium text-blue-800">Total Carryover Available</span>
              <span className="font-bold text-blue-800">₹{stats.carryOver.toLocaleString("en-IN")}</span>
            </div>
            
            {/* Show spending from carryover by category */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Spent from Carryover by Category:</h4>
              {stats.categoryBreakdown.length > 0 ? (
                stats.categoryBreakdown.map((category) => {
                  const categorySpent = category.amount;
                  const spentFromCarryover = Math.min(categorySpent, stats.carryOver * (categorySpent / stats.totalInvested));
                  
                  return (
                    <div key={`${category.category}-${category.subcategory || 'main'}`} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">
                          {category.subcategory ? `${category.category} - ${category.subcategory}` : category.category}
                        </span>
                      </div>
                      <div className="text-right text-sm">
                        <div>Total Spent: ₹{categorySpent.toLocaleString("en-IN")}</div>
                        <div className="text-blue-600 font-semibold">
                        From Carryover: ₹{Math.round(spentFromCarryover).toLocaleString("en-IN")}

                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground p-3 border rounded">
                  No investments made yet this month
                </div>
              )}
            </div>
            
            {/* Show remaining carryover */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Remaining Carryover:</span>
                <span className="font-bold text-green-600">
                  ₹{stats.remainingCarryover.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Available for future investments
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Category Budget vs Spending */}
      {/* Category Budget vs Spending */}
      {stats.categoryAllocations.length > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Category Budget vs Spending</h3>
          <div className="grid gap-4">
            {stats.categoryAllocations.map((allocation) => {
              const spent = stats.categoryBreakdown.find(cb => cb.category === allocation.categoryName)?.amount || 0;
              const remaining = allocation.allocatedAmount - spent;
              const carryover = Math.max(0, remaining); // Only positive amounts carry over

              return (
                <div key={allocation.categoryName} className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">{allocation.categoryName}</span>
                  <div className="text-right text-sm">
                    <div>Allocated: ₹{allocation.allocatedAmount.toLocaleString()}</div>
                    <div>Spent: ₹{spent.toLocaleString()}</div>
                    <div className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Remaining: ₹{remaining.toLocaleString()}
                    </div>
                    {carryover > 0 && (
                      <div className="text-blue-600 font-semibold">
                        Will carry over: ₹{carryover.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Total Carryover Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center font-bold">
                <span>Total Carryover to Next Month:</span>
                <span className="text-blue-600">
                  ₹{stats.categoryAllocations.reduce((total, allocation) => {
                    const spent = stats.categoryBreakdown.find(cb => cb.category === allocation.categoryName)?.amount || 0;
                    const remaining = allocation.allocatedAmount - spent;
                    return total + Math.max(0, remaining);
                  }, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add this section after the carryover breakdown */}
{stats.categoryAllocations.length > 0 && stats.categoryAllocations.some(alloc => alloc.carryOver > 0) && (
  <div className="bg-card rounded-lg border p-6">
    <h3 className="text-lg font-semibold mb-4">Category-wise Carryover Remaining</h3>
    <div className="grid gap-3">
      {stats.categoryAllocations.map((allocation) => {
        if (allocation.carryOver <= 0) return null;
        
        const categoryData = categories.find(c => c.name === allocation.categoryName);
        
        return (
          <div key={allocation.categoryName} className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: categoryData?.color || "#6b7280" }}
              />
              <span className="font-medium text-green-800">{allocation.categoryName}</span>
            </div>
            <span className="font-bold text-green-800">
              ₹{allocation.carryOver.toLocaleString("en-IN")} remaining
            </span>
          </div>
        );
      })}
      
      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center font-bold">
          <span>Total Category Carryover Remaining:</span>
          <span className="text-green-600">
            ₹{stats.categoryAllocations.reduce((total, alloc) => total + alloc.carryOver, 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  </div>
)}


      


      {/* Charts and History */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <InvestmentChart stats={stats} />
        <InvestmentHistory
          investments={investments}
          categories={categories}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

