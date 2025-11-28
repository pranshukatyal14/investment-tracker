import { Investment, Category, MonthlyBudget } from "@/types/investment";

const API_BASE = 'https://investment-tracker-7nx8.onrender.com';

export const api = {
  // Investments
  getInvestments: async (): Promise<Investment[]> => {
    const response = await fetch(`${API_BASE}/investments`);
    const data = await response.json();
    return data.map((inv: any) => ({
      ...inv,
      id: inv._id,
      date: new Date(inv.date)
    }));
  },
  
  addInvestment: async (investment: Omit<Investment, "id">): Promise<Investment> => {
    const response = await fetch(`${API_BASE}/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investment)
    });
    const data = await response.json();
    return {
      ...data,
      id: data._id,
      date: new Date(data.date)
    };
  },
  
  deleteInvestment: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/investments/${id}`, { method: 'DELETE' });
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await response.json();
    return data.map((cat: any) => ({
      ...cat,
      id: cat._id,
      subcategories: cat.subcategories?.map((sub: any) => ({
        ...sub,
        id: sub._id
      })) || []
    }));
  },
  
  addCategory: async (category: Omit<Category, "id">): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    const data = await response.json();
    return {
      ...data,
      id: data._id,
      subcategories: data.subcategories?.map((sub: any) => ({
        ...sub,
        id: sub._id
      })) || []
    };
  },

  deleteCategory: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
  },

  addSubcategory: async (categoryId: string, subcategory: { name: string; parentCategoryId: string }): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories/${categoryId}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subcategory)
    });
    const data = await response.json();
    return {
      ...data,
      id: data._id,
      subcategories: data.subcategories?.map((sub: any) => ({
        ...sub,
        id: sub._id
      })) || []
    };
  },

  // Budgets
  getBudgets: async (): Promise<MonthlyBudget[]> => {
    const response = await fetch(`${API_BASE}/budgets`);
    const data = await response.json();
    return data.map((budget: any) => ({
      ...budget,
      id: budget._id
    }));
  },
  
  setBudget: async (budget: MonthlyBudget): Promise<MonthlyBudget> => {
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    });
    const data = await response.json();
    return {
      ...data,
      id: data._id
    };
  },

  getBudgetForMonth: async (month: string): Promise<MonthlyBudget | null> => {
    const response = await fetch(`${API_BASE}/budgets/${month}`);
    if (response.status === 404) return null;
    const data = await response.json();
    return data ? {
      ...data,
      id: data._id
    } : null;
  }
};