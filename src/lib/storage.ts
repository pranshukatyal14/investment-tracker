import { Investment, Category, MonthlyBudget,Subcategory } from "@/types/investment";

const STORAGE_KEYS = {
  INVESTMENTS: "investment-tracker-investments",
  CATEGORIES: "investment-tracker-categories",
  BUDGETS: "investment-tracker-budgets",
};

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { 
    id: "1", 
    name: "Mutual Funds", 
    color: "#10b981",
    subcategories: [
      { id: "1-1", name: "Large Cap", parentCategoryId: "1" },
      { id: "1-2", name: "Mid Cap", parentCategoryId: "1" },
      { id: "1-3", name: "Small Cap", parentCategoryId: "1" },
      { id: "1-4", name: "Multi Cap", parentCategoryId: "1" },
      { id: "1-5", name: "Sectoral/Thematic", parentCategoryId: "1" }
    ]
  },
  { id: "2", name: "Fixed Deposit", color: "#3b82f6" },
  { id: "3", name: "Stocks", color: "#f59e0b" },
  { id: "4", name: "Gold", color: "#eab308" },
];

export const storage = {
  // Investments
  getInvestments: (): Investment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    if (!data) return [];
    return JSON.parse(data).map((inv: any) => ({
      ...inv,
      date: new Date(inv.date),
    }));
  },

  saveInvestments: (investments: Investment[]) => {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
  },

  addInvestment: (investment: Investment) => {
    const investments = storage.getInvestments();
    investments.push(investment);
    storage.saveInvestments(investments);
  },

  deleteInvestment: (id: string) => {
    const investments = storage.getInvestments();
    storage.saveInvestments(investments.filter((inv) => inv.id !== id));
  },

  // Categories
  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) {
      storage.saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory: (category: Category) => {
    const categories = storage.getCategories();
    categories.push(category);
    storage.saveCategories(categories);
  },

  deleteCategory: (id: string) => {
    const categories = storage.getCategories();
    storage.saveCategories(categories.filter((cat) => cat.id !== id));
  },

  // Budgets
  getBudgets: (): MonthlyBudget[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!data) return [];
    return JSON.parse(data);
  },

  saveBudgets: (budgets: MonthlyBudget[]) => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  getBudgetForMonth: (month: string): MonthlyBudget | null => {
    const budgets = storage.getBudgets();
    return budgets.find((b) => b.month === month) || null;
  },

  setBudgetForMonth: (budget: MonthlyBudget) => {
    const budgets = storage.getBudgets();
    const existingIndex = budgets.findIndex((b) => b.month === budget.month);
    
    if (existingIndex >= 0) {
      budgets[existingIndex] = budget;
    } else {
      budgets.push(budget);
    }
    
    storage.saveBudgets(budgets);
  },
    addSubcategory: (categoryId: string, subcategory: Omit<Subcategory, "id">) => {
    const categories = storage.getCategories();
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      if (!category.subcategories) category.subcategories = [];
      const newSubcategory: Subcategory = {
        ...subcategory,
        id: `${categoryId}-${Date.now()}`,
        parentCategoryId: categoryId
      };
      category.subcategories.push(newSubcategory);
      storage.saveCategories(categories);
    }
  },

  deleteSubcategory: (categoryId: string, subcategoryId: string) => {
    const categories = storage.getCategories();
    const category = categories.find(c => c.id === categoryId);
    if (category?.subcategories) {
      category.subcategories = category.subcategories.filter(s => s.id !== subcategoryId);
      storage.saveCategories(categories);
    }
  }

};
