import { apiFetch } from '../../services/api';
import type { SharedSaving } from '../../types/sharedSavings';

export const sharedSavingService = {
  create: async (title: string, goalAmount: number): Promise<SharedSaving> => {
    return await apiFetch<SharedSaving>('/shared-savings', {
      method: 'POST',
      body: JSON.stringify({ title, goalAmount }),
    });
  },
  getByCode: async (code: string): Promise<SharedSaving> => {
    return await apiFetch<SharedSaving>(`/shared-savings/code/${code}`);
  },
  contribute: async (code: string, amount: number, isAnonymous: boolean): Promise<SharedSaving> => {
    return await apiFetch<SharedSaving>(`/shared-savings/${code}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount, isAnonymous }),
    });
  },
  join: async (code: string): Promise<SharedSaving> => {
    return await apiFetch<SharedSaving>(`/shared-savings/${code}/join`, {
      method: 'POST',
    });
  },
  getMySavings: async (): Promise<SharedSaving[]> => {
    return await apiFetch<SharedSaving[]>('/shared-savings', {
      method: 'GET',
    });
  }
};