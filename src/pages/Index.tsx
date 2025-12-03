import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { LayoutDashboard, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddInvestmentDialog } from "@/components/AddInvestmentDialog";
import { CategoryManager } from "@/components/CategoryManager";
import { BudgetManager, CategoryBudgetManager } from "@/components/BudgetManager";
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
  const [prevBudget, setPrevBudget] = useState<MonthlyBudget | null>(null);
  const [loading, setLoading] = useState(true);

  const currentMonth = format(new Date(), "yyyy-MM");

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const prevMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), "yyyy-MM");
      
      console.log('🔄 Loading data for:', currentMonth);
      console.log('📅 Previous month:', prevMonth);
      
      const [investmentsData, categoriesData, currentBudgetData, prevBudgetData] = await Promise.all([
        api.getInvestments(),
        api.getCategories(),
        api.getBudgetForMonth(currentMonth),
        api.getBudgetForMonth(prevMonth)
      ]);
      
      console.log('💰 Current budget exists:', !!currentBudgetData);
      console.log('📊 Previous budget exists:', !!prevBudgetData);
      
      setInvestments(investmentsData);
      setCategories(categoriesData);
      
      if (!currentBudgetData) {
  console.log('🚀 Auto-creating budget with carryover...');
  
  // Find the most recent budget (could be previous month or further back)
  let recentBudget = prevBudgetData;
  let recentMonth = prevMonth;
  
  // If no immediate previous month budget, look further back
  if (!recentBudget) {
    for (let i = 2; i <= 12; i++) { // Look back up to 12 months
      const checkMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() - i, 1), "yyyy-MM");
      const checkBudget = await api.getBudgetForMonth(checkMonth);
      if (checkBudget) {
        recentBudget = checkBudget;
        recentMonth = checkMonth;
        break;
      }
    }
  }
  
  if (recentBudget) {
    const recentInvestments = investmentsData.filter(
      (inv) => format(inv.date, "yyyy-MM") === recentMonth
    );
    const recentSpent = recentInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const recentTotal = (recentBudget.totalAmount || 0) + (recentBudget.totalCarryOver || 0);
    const carryover = Math.max(0, recentTotal - recentSpent);
    
    console.log('💸 Recent spent:', recentSpent);
    console.log('💵 Recent total:', recentTotal);
    console.log('🔄 Calculated carryover:', carryover);
    
    if (carryover > 0) {
      // Copy category allocations with updated carryovers
      const updatedCategoryAllocations = (recentBudget.categoryAllocations || []).map(allocation => {
        const categoryInvestments = recentInvestments.filter(inv => inv.category === allocation.categoryName);
        const categorySpent = categoryInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        const categoryCarryover = Math.max(0, allocation.allocatedAmount - categorySpent);
        
        return {
          categoryName: allocation.categoryName,
          allocatedAmount: allocation.allocatedAmount,
          carryOver: categoryCarryover,
          spent: 0,
          remaining: allocation.allocatedAmount + categoryCarryover
        };
      });

      const newBudget = {
        month: currentMonth,
        totalAmount: recentBudget.totalAmount,
        totalCarryOver: carryover,
        categoryAllocations: updatedCategoryAllocations
      };
      
      console.log('📝 Creating budget:', newBudget);
      const createdBudget = await api.setBudget(newBudget);
      console.log('✅ Budget created successfully:', createdBudget);
      setCurrentBudget(createdBudget);
    } else {
      console.log('❌ No carryover to create budget');
      setCurrentBudget(null);
    }
  } else {
    console.log('📋 No previous budget found');
    setCurrentBudget(null);
  }
} else {
  console.log('📋 Using existing budget');
  setCurrentBudget(currentBudgetData);
}

      
      setPrevBudget(prevBudgetData);
    } catch (error) {
      console.error('❌ Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [currentMonth]);

const calculateCarryOver = useMemo(() => {
  // Get all previous months that have budgets or investments
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth();
  
  let totalCarryover = 0;
  
  // Check all previous months from January to current month
  for (let i = 0; i < currentMonthNum; i++) {
    const checkMonth = format(new Date(currentYear, i, 1), "yyyy-MM");
    
    // Get budget for this month
    const monthBudget = checkMonth === format(new Date(currentYear, currentMonthNum - 1, 1), "yyyy-MM") 
      ? prevBudget 
      : null; // For now, only check immediate previous month
    
    if (monthBudget) {
      // Get investments for this month
      const monthInvestments = investments.filter(
        (inv) => format(inv.date, "yyyy-MM") === checkMonth
      );
      
      const monthSpent = monthInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      const monthTotal = (monthBudget.totalAmount || 0) + (monthBudget.totalCarryOver || 0);
      const monthRemaining = monthTotal - monthSpent;
      
      totalCarryover += Math.max(0, monthRemaining);
    }
  }
  
  return totalCarryover;
}, [investments, prevBudget, currentMonth]);

const stats: InvestmentStats = useMemo(() => {
  const currentMonthInvestments = investments.filter(
    (inv) => format(inv.date, "yyyy-MM") === currentMonth
  );

  const totalInvested = currentMonthInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  // Calculate spending priority: carryover first, then current budget
  const manualCarryOver = currentBudget?.totalCarryOver || 0;
  const autoCarryOver = manualCarryOver > 0 ? manualCarryOver : calculateCarryOver;
  const currentMonthBudget = currentBudget?.totalAmount || 0;

  // Spending logic: use carryover first
  const spentFromCarryover = Math.min(totalInvested, autoCarryOver);
  const spentFromCurrentBudget = Math.max(0, totalInvested - autoCarryOver);
  const remainingCarryover = Math.max(0, autoCarryOver - totalInvested);
  const remainingCurrentBudget = Math.max(0, currentMonthBudget - spentFromCurrentBudget);

  const totalBudget = currentMonthBudget + autoCarryOver;
  const remainingBudget = remainingCarryover + remainingCurrentBudget;

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

  // Calculate category-wise spending with carryover priority
  const updatedCategoryAllocations = (currentBudget?.categoryAllocations || []).map(allocation => {
    const categorySpent = categoryBreakdown.find(cb => cb.category === allocation.categoryName)?.amount || 0;
    
    // Get previous month's carryover for this category (from prevBudget)
    const prevAllocation = prevBudget?.categoryAllocations?.find(prev => prev.categoryName === allocation.categoryName);
    const categoryCarryover = prevAllocation ? Math.max(0, prevAllocation.allocatedAmount - (prevAllocation.spent || 0)) : 0;
    
    // Spending priority: use carryover first, then current month allocation
    const spentFromCategoryCarryover = Math.min(categorySpent, categoryCarryover);
    const spentFromCurrentAllocation = Math.max(0, categorySpent - categoryCarryover);
    
    const remainingCategoryCarryover = categoryCarryover - spentFromCategoryCarryover;
    const remainingCurrentAllocation = allocation.allocatedAmount - spentFromCurrentAllocation;
    
    return {
      ...allocation,
      carryOver: remainingCategoryCarryover,
      spent: categorySpent,
      remaining: remainingCurrentAllocation + remainingCategoryCarryover
    };
  });

  return {
    totalInvested,
    remainingBudget,
    totalBudget,
    categoryBreakdown,
    carryOver: updatedCategoryAllocations.reduce((total, alloc) => total + alloc.carryOver, 0),
    categoryAllocations: updatedCategoryAllocations,
    spentFromCarryover,
    spentFromCurrentBudget,
    remainingCarryover,
    remainingCurrentBudget,
    currentMonthBudget,
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
                <CategoryBudgetManager
                  currentMonth={currentMonth}
                  budget={currentBudget}
                  categories={categories}
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  const prevMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), "yyyy-MM");
                  const currentBudgetData = await api.getBudgetForMonth(currentMonth);
                  const prevBudgetData = await api.getBudgetForMonth(prevMonth);
                  
                  console.log('Current Month:', currentMonth);
                  console.log('Previous Month:', prevMonth);
                  console.log('Current Budget exists:', !!currentBudgetData);
                  console.log('Previous Budget exists:', !!prevBudgetData);
                  console.log('Previous Budget data:', prevBudgetData);
                  
                  if (!currentBudgetData && prevBudgetData) {
                    console.log('Should auto-create budget');
                    const prevInvestments = investments.filter(
                      (inv) => format(inv.date, "yyyy-MM") === prevMonth
                    );
                    const prevSpent = prevInvestments.reduce((sum, inv) => sum + inv.amount, 0);
                    const prevTotal = (prevBudgetData.totalAmount || 0) + (prevBudgetData.totalCarryOver || 0);
                    const carryover = Math.max(0, prevTotal - prevSpent);
                    console.log('Calculated carryover:', carryover);
                  }
                  
                  alert(`Current: ${currentMonth}\nPrev: ${prevMonth}\nCurrent Budget: ${!!currentBudgetData}\nPrev Budget: ${!!prevBudgetData}`);
                }}
              >
                Debug
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
