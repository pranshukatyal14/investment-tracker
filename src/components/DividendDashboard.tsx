import { DollarSign, TrendingUp, Award, Calendar } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { DividendHistory } from "@/components/DividendHistory";
import { DividendChart } from "@/components/DividendChart";
import { Dividend, DividendStats } from "@/types/investment";

interface DividendDashboardProps {
  stats: DividendStats;
  dividends: Dividend[];
  currentMonthDividendCount: number;
  onDelete: (id: string) => void;
}

export function DividendDashboard({
  stats,
  dividends,
  currentMonthDividendCount,
  onDelete,
}: DividendDashboardProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Dividends (Year)"
          value={`₹${stats.currentYearDividends.toLocaleString("en-IN")}`}
          subtitle="Year to date"
          icon={DollarSign}
          variant="success"
        />
        <StatsCard
          title="This Month"
          value={`₹${stats.currentMonthDividends.toLocaleString("en-IN")}`}
          subtitle={`${currentMonthDividendCount} ${currentMonthDividendCount === 1 ? 'payment' : 'payments'}`}
          icon={TrendingUp}
          variant="default"
        />
        <StatsCard
          title="Average per Month"
          value={`₹${Math.round(stats.averagePerMonth).toLocaleString("en-IN")}`}
          subtitle="Based on current year"
          icon={Calendar}
          variant="accent"
        />
        <StatsCard
          title="Top Paying Stock"
          value={
            stats.topPayingStock 
              ? `₹${stats.topPayingStock.amount.toLocaleString("en-IN")}`
              : "N/A"
          }
          subtitle={
            stats.topPayingStock 
              ? `${stats.topPayingStock.company} (${stats.topPayingStock.stockSymbol})`
              : "No data yet"
          }
          icon={Award}
          variant="default"
        />
      </div>

      {/* Charts and History */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <DividendChart stats={stats} />
        <DividendHistory dividends={dividends} onDelete={onDelete} />
      </div>
    </div>
  );
}
