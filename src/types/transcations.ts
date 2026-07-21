// src/types/transcations.ts
export type TransactionType = 'income' | 'expense' | 'saving';

export interface Payment {
  _id?: string;
  amount: number;
  date: string;
  description?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  createdAt?: string;
  paidAmount?: number;
  payments?: Payment[];
  linkedTo?: string;

  // Propiedades de Gastos Recurrentes
  name?: string;
  isRecurring?: boolean;
  recurringType?: 'none' | 'subscription' | 'installment';
  duration?: number | null;
  paymentsMade?: number;
  nextPaymentDate?: string;
  isActive?: boolean;
}

export interface CreateTransactionPayload {
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  date?: string;
  linkedTo?: string;
  name?: string;
  isRecurring?: boolean;
  recurringType?: 'none' | 'subscription' | 'installment';
  duration?: number | null;
  isActive?: boolean;
}