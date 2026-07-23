export interface Budget {
  _id: string;
  userId: string;
  category: string;
  amount: number;
  spent?: number; // Calculado por el backend
  createdAt: string;
  updatedAt: string;
}