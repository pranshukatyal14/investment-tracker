export interface Investment {
  id: string;
  amount: number;
  category: string;
  subcategory?: string; // Add subcategory field
  date: Date;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  subcategories?: Subcategory[]; // Add subcategories array
}

export interface Subcategory {
  id: string;
  name: string;
  parentCategoryId: string;
}





export interface CategoryAllocation {
  categoryName: string;
  allocatedAmount: number;
  carryOver: number;
  spent: number;
  remaining: number;
}

export interface MonthlyBudget {
  month: string;
  totalAmount: number;
  categoryAllocations: CategoryAllocation[];
  totalCarryOver: number;
}
export interface CategoryBreakdown {
  category: string;
  subcategory?: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface InvestmentStats {
  totalInvested: number;
  remainingBudget: number;
  totalBudget: number;
  categoryBreakdown: CategoryBreakdown[];
  carryOver: number;
  categoryAllocations: CategoryAllocation[];
  // Add these:
  spentFromCarryover: number;
  spentFromCurrentBudget: number;
  remainingCarryover: number;
  remainingCurrentBudget: number;
  currentMonthBudget: number;
}
