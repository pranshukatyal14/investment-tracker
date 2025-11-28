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
        subtitle="From previous month"
        icon={ArrowRightLeft}
        variant="default"
      />
        
      </div>

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
