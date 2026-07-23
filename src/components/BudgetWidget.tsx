import React, { useEffect, useState } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import { budgetService } from '../features/budgets/budgetService';
import type { Budget } from '../types/budget';
import { BudgetModal } from './BudgetModal';
import toast from 'react-hot-toast';

export const BudgetWidget: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBudgets = async () => {
    try {
      const data = await budgetService.getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    // Escuchar actualizaciones de transacciones para recalcular lo gastado
    window.addEventListener('transaction-updated', fetchBudgets);
    return () => window.removeEventListener('transaction-updated', fetchBudgets);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    try {
      await budgetService.deleteBudget(id);
      setBudgets(prev => prev.filter(b => b._id !== id));
      toast.success('Presupuesto eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (isLoading) return <div className="animate-pulse bg-slate-100 h-48 rounded-2xl"></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-500" />
          Presupuestos Mensuales
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
          title="Nuevo Presupuesto"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
          <p className="text-sm text-slate-500 mb-2">No has definido presupuestos</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {budgets.map(budget => {
            const spent = budget.spent || 0;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            
            // Determinar color de la barra
            let barColor = 'bg-emerald-500';
            if (percentage >= 100) barColor = 'bg-red-500';
            else if (percentage >= 80) barColor = 'bg-amber-500';

            return (
              <div key={budget._id} className="group">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{budget.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">
                      ${spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                    </span>
                    <button 
                      onClick={() => handleDelete(budget._id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {/* Barra de progreso */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 text-right">
                  {percentage.toFixed(1)}% consumido
                </p>
              </div>
            );
          })}
        </div>
      )}

      <BudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchBudgets}
      />
    </div>
  );
};