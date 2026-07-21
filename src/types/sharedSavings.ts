export interface Contribution {
  _id: string;
  userId: { _id: string; name: string };
  amount: number;
  date: string;
  isAnonymous: boolean;
}

// src/types/sharedSavings.ts
export interface SharedSaving {
  _id: string;
  title: string;
  goalAmount: number;
  currentAmount: number;
  creatorId: { _id: string; name: string };
  sharedCode: string;
  contributions: Contribution[];
  members?: string[]; // <-- Añadir esta línea
  status: 'active' | 'completed';
  createdAt: string;
}