import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, Target, AlertCircle, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { budgetService } from '../features/budgets/budgetService';
import type { Budget } from '../types/budget';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Comida',
  'Transporte',
  'Entretenimiento',
  'Servicios',
  'Salud',
  'Educación',
  'Compras',
  'Otros'
];

export const BudgetWidget: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const data = await budgetService.getBudgets();
      setBudgets(data);
    } catch (error) {
      toast.error('Error al cargar presupuestos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    window.addEventListener('transaction-updated', fetchBudgets);
    return () => window.removeEventListener('transaction-updated', fetchBudgets);
  }, []);

  // Lógica de fechas
  const today = new Date();
  const currentMonth = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(today);
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = lastDayOfMonth.getDate() - today.getDate();

  // Abrir modal para Crear
  const handleOpenCreateModal = () => {
    setEditingBudget(null);
    setCategory(CATEGORIES[0]);
    setAmount('');
    setIsModalOpen(true);
  };

  // Abrir modal para Editar
  const handleOpenEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setAmount(budget.amount.toString());
    setIsModalOpen(true);
  };

  // Borrar Presupuesto
  const handleDeleteBudget = async (id: string, categoryName: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el presupuesto de "${categoryName}"?`)) {
      return;
    }

    try {
      await budgetService.deleteBudget(id);
      toast.success(`Presupuesto de "${categoryName}" eliminado`);
      fetchBudgets();
    } catch (error) {
      toast.error('Error al eliminar el presupuesto');
    }
  };

  // Guardar/Actualizar
  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || Number(amount) <= 0) {
      toast.error('Ingresa una categoría y un monto válido');
      return;
    }

    try {
      setIsSubmitting(true);
      await budgetService.setBudget(category, Number(amount));
      
      toast.success(
        editingBudget 
          ? `Presupuesto de "${category}" actualizado` 
          : `Presupuesto de "${category}" creado`
      );

      setAmount('');
      setIsModalOpen(false);
      fetchBudgets();
    } catch (error) {
      toast.error('Error al guardar el presupuesto');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 h-full animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col h-full relative">
      
      {/* HEADER */}
      <div className="mb-5 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Presupuestos
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {capitalizedMonth}
            </span>

            <button
              onClick={handleOpenCreateModal}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
              title="Añadir presupuesto"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          Quedan <span className="text-slate-900 font-bold">{daysLeft} días</span> de presupuesto
        </p>
      </div>

      {/* LISTA */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
        {budgets.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center">
            <p className="text-slate-400 text-sm font-medium mb-3">
              No has configurado presupuestos este mes.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Crear presupuesto
            </button>
          </div>
        ) : (
          budgets.map((budget) => {
            const spent = budget.spent || 0;
            const limit = budget.amount || 0;
            const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            
            let barColor = 'bg-emerald-500';
            if (percentage >= 100) barColor = 'bg-red-500';
            else if (percentage >= 80) barColor = 'bg-amber-500';

            return (
              <div key={budget._id} className="group p-2 -mx-2 rounded-xl hover:bg-slate-50/80 transition-colors">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-700">{budget.category}</span>
                    {percentage >= 100 && (
                      <AlertCircle className="h-4 w-4 text-red-500 inline" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">${spent.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 font-medium ml-1">/ ${limit.toFixed(2)}</span>
                    </div>

                    {/* Botones Acciones (Hover) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
                      <button
                        onClick={() => handleOpenEditModal(budget)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                        title="Editar presupuesto"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget._id, budget.category)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        title="Eliminar presupuesto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="mt-1 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">
                    Disponible: ${(Math.max(limit - spent, 0)).toFixed(2)}
                  </span>
                  <span className={`font-bold ${percentage >= 80 ? 'text-amber-600' : 'text-slate-500'}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm p-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                {editingBudget ? 'Editar Presupuesto' : 'Definir Presupuesto'}
              </h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!!editingBudget} // Si editamos, deshabilitamos la selección de categoría
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Límite Mensual ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Ej. 2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : editingBudget ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};