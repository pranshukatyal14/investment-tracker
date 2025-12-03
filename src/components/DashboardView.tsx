import { Wallet, TrendingUp, PiggyBank, Target, ArrowRightLeft } from "lucide-react";
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
}

export function DashboardView({
  stats,
  investments,
  categories,
  currentMonthInvestmentCount,
  onDelete,
}: DashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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



      {/* Charts and History */}
      <div className="grid gap-6 lg:grid-cols-2">
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
