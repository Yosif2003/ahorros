// src/features/budgets/budgetService.ts
import { apiFetch } from '../../services/api';
import type { Budget } from '../../types/budget';

export const budgetService = {
  getBudgets: async (): Promise<Budget[]> => {
    return await apiFetch<Budget[]>('/budgets', {
      method: 'GET',
    });
  },

  setBudget: async (category: string, amount: number): Promise<Budget> => {
    return await apiFetch<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify({ category, amount }),
    });
  },

  deleteBudget: async (id: string): Promise<void> => {
    return await apiFetch<void>(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }
};