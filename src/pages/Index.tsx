import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { LayoutDashboard, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddInvestmentDialog } from "@/components/AddInvestmentDialog";
import { CategoryManager } from "@/components/CategoryManager";
import { BudgetManager } from "@/components/BudgetManager";
import { DashboardView } from "@/components/DashboardView";
import { CalendarView } from "@/components/CalendarView";
import { AnalyticsView } from "@/components/AnalyticsView";
import { Investment, Category, MonthlyBudget, InvestmentStats } from "@/types/investment";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";


type ViewType = "dashboard" | "calendar" | "analytics";

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentBudget, setCurrentBudget] = useState<MonthlyBudget | null>(null);
  const [loading, setLoading] = useState(true);

  const currentMonth = format(new Date(), "yyyy-MM");

  // Load data from MongoDB
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [investmentsData, categoriesData, currentBudgetData] = await Promise.all([
          api.getInvestments(),
          api.getCategories(),
          api.getBudgetForMonth(currentMonth)
        ]);
        
        setInvestments(investmentsData);
        setCategories(categoriesData);
        setCurrentBudget(currentBudgetData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentMonth]);

  // Calculate automatic carryover from previous month
  const calculateCarryOver = useMemo(() => {
    const currentDate = new Date();
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevMonthStr = format(prevMonth, "yyyy-MM");
    
    const prevMonthInvestments = investments.filter(
      (inv) => format(inv.date, "yyyy-MM") === prevMonthStr
    );
    
    const prevMonthInvested = prevMonthInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // For now, we'll use the manual carryover. You can implement automatic calculation later
    return 0;
  }, [investments, currentMonth]);

  // Calculate stats
  const stats: InvestmentStats = useMemo(() => {
    const currentMonthInvestments = investments.filter(
      (inv) => format(inv.date, "yyyy-MM") === currentMonth
    );

    const totalInvested = currentMonthInvestments.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );

    // Use manual carryover if set, otherwise use automatic calculation
    // const manualCarryOver = currentBudget?.carryOver || 0;
    // const autoCarryOver = manualCarryOver > 0 ? manualCarryOver : calculateCarryOver;
    // const totalBudget = (currentBudget?.amount || 0) + autoCarryOver;
    const manualCarryOver = currentBudget?.totalCarryOver || 0;
    const autoCarryOver = manualCarryOver > 0 ? manualCarryOver : calculateCarryOver;
    const totalBudget = (currentBudget?.totalAmount || 0) + autoCarryOver;
    const remainingBudget = totalBudget - totalInvested;

    // Calculate category breakdown
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

    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([key, data]) => {
        const categoryData = categories.find((c) => c.name === data.category);
        return {
          category: data.category,
          subcategory: data.subcategory,
          amount: data.amount,
          percentage: totalInvested > 0 ? (data.amount / totalInvested) * 100 : 0,
          color: categoryData?.color || "#6b7280",
        };
      }
    );

    return {
     totalInvested,
  remainingBudget,
  totalBudget,
  categoryBreakdown,
  carryOver: autoCarryOver,
  categoryAllocations: currentBudget?.categoryAllocations || [],
    };
  }, [investments, categories, currentBudget, currentMonth, calculateCarryOver]);

  // Handlers
  const handleAddInvestment = async (investment: Omit<Investment, "id">) => {
    try {
      await api.addInvestment(investment);
      const updatedInvestments = await api.getInvestments();
      setInvestments(updatedInvestments);
    } catch (error) {
      console.error('Failed to add investment:', error);
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    try {
      await api.deleteInvestment(id);
      const updatedInvestments = await api.getInvestments();
      setInvestments(updatedInvestments);
    } catch (error) {
      console.error('Failed to delete investment:', error);
    }
  };

  const handleAddCategory = async (category: Omit<Category, "id">) => {
    try {
      await api.addCategory(category);
      const updatedCategories = await api.getCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.deleteCategory(id);
      const updatedCategories = await api.getCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleAddSubcategory = async (categoryId: string, subcategory: { name: string; parentCategoryId: string }) => {
    try {
      await api.addSubcategory(categoryId, subcategory);
      const updatedCategories = await api.getCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Failed to add subcategory:', error);
    }
  };

  const handleSetBudget = async (budget: MonthlyBudget) => {
    try {
      const updatedBudget = await api.setBudget(budget);
      setCurrentBudget(updatedBudget);
    } catch (error) {
      console.error('Failed to set budget:', error);
    }
  };

  const currentMonthInvestmentCount = investments.filter(
    (inv) => format(inv.date, "yyyy-MM") === currentMonth
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your investment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Top row - Title and actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Investment Tracker
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(), "MMMM yyyy")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <BudgetManager
                  currentMonth={currentMonth}
                  budget={currentBudget}
                  onSetBudget={handleSetBudget}
                />
                <CategoryManager
                  categories={categories}
                  onAdd={handleAddCategory}
                  onDelete={handleDeleteCategory}
                  onAddSubcategory={handleAddSubcategory}
                />
                <AddInvestmentDialog
                  categories={categories}
                  onAdd={handleAddInvestment}
                />
              </div>
             

            </div>

            {/* Navigation tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
              <Button
                variant={activeView === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("dashboard")}
                className={cn(
                  "flex-shrink-0",
                  activeView === "dashboard" && "bg-gradient-primary"
                )}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={activeView === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("calendar")}
                className={cn(
                  "flex-shrink-0",
                  activeView === "calendar" && "bg-gradient-primary"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant={activeView === "analytics" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("analytics")}
                className={cn(
                  "flex-shrink-0",
                  activeView === "analytics" && "bg-gradient-primary"
                )}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {activeView === "dashboard" && (
          <DashboardView
            stats={stats}
            investments={investments}
            categories={categories}
            currentMonthInvestmentCount={currentMonthInvestmentCount}
            onDelete={handleDeleteInvestment}
          />
        )}

        {activeView === "calendar" && (
          <CalendarView
            investments={investments}
            categories={categories}
          />
        )}

        {activeView === "analytics" && (
          <AnalyticsView
            investments={investments}
            categories={categories}
          />
        )}
      </main>
    </div>
  );
};

export default Index;