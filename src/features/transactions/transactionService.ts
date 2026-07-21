// src/features/transactions/transactionService.ts

import { apiFetch } from '../../services/api';
import type { Transaction, CreateTransactionPayload } from '../../types/transcations';

export const transactionService = {
  
  // 1. Obtener todas las transacciones del usuario actual
  getTransactions: async (): Promise<Transaction[]> => {
    return await apiFetch<Transaction[]>('/transactions', {
      method: 'GET',
    });
  },

  // 2. Crear un nuevo gasto, ingreso o ahorro
  createTransaction: async (data: CreateTransactionPayload): Promise<Transaction> => {
    return await apiFetch<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 3. Eliminar una transacción por accidente o ajuste
  deleteTransaction: async (id: string): Promise<{ message: string }> => {
    return await apiFetch<{ message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
  addPayment: async (id: string, paymentAmount: number, description?: string): Promise<Transaction> => {
    return await apiFetch<Transaction>(`/transactions/${id}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentAmount, description }), // <-- Ahora enviamos la descripción
    });
  },
  updateTransaction: async (id: string, data: Partial<CreateTransactionPayload>): Promise<Transaction> => {
    return await apiFetch<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};