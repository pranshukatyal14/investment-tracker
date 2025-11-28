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

export interface InvestmentStats {
  totalInvested: number;
  remainingBudget: number;
  totalBudget: number;
  carryOver: number;
  categoryAllocations: CategoryAllocation[];
  categoryBreakdown: {
    category: string;
    subcategory?: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
}
