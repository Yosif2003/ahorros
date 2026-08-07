// src/components/TransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp, PiggyBank, RefreshCw } from 'lucide-react';
import { transactionService } from '../features/transactions/transactionService';
import type { Transaction, TransactionType, CreateTransactionPayload } from '../types/transcations';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Transaction | null;
}

const CATEGORIES = [
  'Alimentación', 'Transporte', 'Entretenimiento', 
  'Hogar', 'Salud', 'Educación', 'Ropa', 'Otros'
];

export const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState(''); 
  const [category, setCategory] = useState(CATEGORIES[0]);
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'subscription' | 'installment'>('subscription');
  const [duration, setDuration] = useState('');
  
  const [description, setDescription] = useState('');
  const [linkedTo, setLinkedTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // NUEVO: Estado para guardar los ingresos disponibles para vincular
  const [availableIncomes, setAvailableIncomes] = useState<Transaction[]>([]);

  useEffect(() => {
    // NUEVO: Cargar los ingresos disponibles cuando se abre el modal
    if (isOpen) {
      const fetchIncomes = async () => {
        try {
          // Asegúrate de que getTransactions() exista en tu transactionService
          const transactions = await transactionService.getTransactions();
          const incomes = transactions.filter((t: Transaction) => t.type === 'income');
          setAvailableIncomes(incomes);
        } catch (error) {
          console.error('Error al cargar transacciones para vincular:', error);
        }
      };
      fetchIncomes();
    }

    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
      setName(initialData.name || ''); 
      setCategory(initialData.category || CATEGORIES[0]);
      setIsRecurring(initialData.isRecurring || false);
      setRecurringType(initialData.recurringType === 'installment' ? 'installment' : 'subscription');
      setDuration(initialData.duration ? initialData.duration.toString() : '');
      setDescription(initialData.description || '');
      setLinkedTo(initialData.linkedTo || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setName('');
    setCategory(CATEGORIES[0]);
    setIsRecurring(false);
    setRecurringType('subscription');
    setDuration('');
    setDescription('');
    setLinkedTo('');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return toast.error('Monto inválido');
    if (!name.trim()) return toast.error('Ingresa un nombre para el movimiento');
    
    if (isRecurring && recurringType === 'installment' && (!duration || Number(duration) <= 0)) {
      return toast.error('Ingresa los meses de duración para el pago a plazos');
    }

    setIsLoading(true);
    try {
      const payload: CreateTransactionPayload = {
        type,
        amount: Number(amount),
        date,
        name,
        category,
        isRecurring: type === 'expense' ? isRecurring : false,
        recurringType: (type === 'expense' && isRecurring ? recurringType : 'none') as 'subscription' | 'installment' | 'none',
        duration: (type === 'expense' && isRecurring && recurringType === 'installment') ? Number(duration) : null,
        description,
        linkedTo: linkedTo || undefined
      };

      if (initialData) {
        await transactionService.updateTransaction(initialData.id, payload);
        toast.success('Movimiento actualizado');
      } else {
        await transactionService.createTransaction(payload);
        toast.success('Movimiento guardado');
      }
      onSuccess();
    } catch (error) {
      toast.error('Error al guardar el movimiento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-slate-900">
            {initialData ? 'Editar Transacción' : 'Nueva Transacción'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="grid grid-cols-3 gap-3">
            <button type="button" onClick={() => setType('expense')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${type === 'expense' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              <TrendingDown className="h-5 w-5 mb-1" />
              <span className="text-sm font-medium">Gasto</span>
            </button>
            <button type="button" onClick={() => setType('income')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              <TrendingUp className="h-5 w-5 mb-1" />
              <span className="text-sm font-medium">Ingreso</span>
            </button>
            <button type="button" onClick={() => setType('saving')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${type === 'saving' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              <PiggyBank className="h-5 w-5 mb-1" />
              <span className="text-sm font-medium">Ahorro</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-7 pr-4 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none" min="0.01" step="0.01" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Registro</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Tacos del viernes, Recibo de luz..." className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none bg-white">
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {type === 'expense' && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                  <RefreshCw className="h-4 w-4 text-indigo-500" />
                  Convertir en Gasto Recurrente automático
                </span>
              </label>

              {isRecurring && (
                <div className="pl-6 space-y-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de recurrencia</label>
                    <select
                      value={recurringType}
                      onChange={(e) => setRecurringType(e.target.value as 'subscription' | 'installment')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 text-sm outline-none bg-white"
                    >
                      <option value="subscription">Suscripción (Mensual, sin límite)</option>
                      <option value="installment">Pago a plazos (Límite de meses)</option>
                    </select>
                  </div>
                  
                  {recurringType === 'installment' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Duración (Meses totales)</label>
                      <input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Ej. 12"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 text-sm outline-none"
                        required={recurringType === 'installment'}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles adicionales..." rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none resize-none" />
          </div>

          {/* CORRECCIÓN: Renderizado dinámico de los ingresos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vincular a (Opcional)</label>
            <select value={linkedTo} onChange={(e) => setLinkedTo(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none bg-white">
              <option value="">✓ No vincular</option>
              {availableIncomes.map((income) => (
                <option key={income.id} value={income.id}>
                  {income.name} - ${income.amount}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
              {isLoading ? 'Guardando...' : 'Guardar Transacción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};