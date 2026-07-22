// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Plus, LayoutGrid, List } from 'lucide-react';
import { transactionService } from '../features/transactions/transactionService';
import type { Transaction, TransactionType } from '../types/transcations';
import { TransactionCard } from '../components/TransactionCard';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionDetailsModal } from '../components/TransactionDetailModal';
import { HistoryModal } from '../components/HistoryModal';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // === ESTADO PARA MODO DE VISTA (CUADRÍCULA O LISTA) ===
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // === ESTADOS DE MODALES Y SELECCIÓN ===
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [historyType, setHistoryType] = useState<TransactionType | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await transactionService.getTransactions();
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(sortedData);
    } catch (error) {
      toast.error('Error al cargar los movimientos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    window.addEventListener('transaction-updated', fetchTransactions);
    return () => window.removeEventListener('transaction-updated', fetchTransactions);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que deseas eliminar este movimiento?')) return;
    
    try {
      await transactionService.deleteTransaction(id);
      toast.success('Movimiento eliminado');
      fetchTransactions();
    } catch (error) {
      toast.error('No se pudo eliminar');
    }
  };

  // === CÁLCULO DE TOTALES (TOMANDO EN CUENTA LOS ABONOS) ===
  const totals = transactions.reduce(
    (acc, curr) => {
      if (curr.type === 'expense') {
        const remainingDebt = curr.amount - (curr.paidAmount || 0);
        acc.expense += remainingDebt;
      } else {
        acc[curr.type] += curr.amount;
      }
      return acc;
    },
    { income: 0, expense: 0, saving: 0 }
  );

  // El balance ahora es: Ingresos + Ahorros - Deudas Pendientes
  const balance = totals.income + totals.saving - totals.expense;

  // Filtrar para ocultar los gastos vinculados del tablero principal
  const mainTransactions = transactions.filter(tx => !tx.linkedTo);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <p className="text-slate-500 font-medium animate-pulse text-sm">Cargando tu información financiera...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* SECCIÓN SUPERIOR: BALANCE & BOTÓN DE ACCIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1">Balance Disponible</p>
          <h2 className="text-4xl sm:text-4xl font-bold tracking-tight break-words">${balance.toFixed(2)}</h2>
        </div>

        <button
          onClick={() => {
            setSelectedTx(null);
            setIsEditing(false);
            setIsCreateModalOpen(true);
          }}
          className="w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Movimiento</span>
        </button>
      </div>

      {/* TARJETAS DE RESUMEN (Optimizadas para que no corten números grandes) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        
        {/* INGRESOS */}
        <div 
          onClick={() => setHistoryType('income')}
          className="bg-white border border-slate-100 hover:border-emerald-300 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-4 cursor-pointer group"
        >
          <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform shrink-0">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="w-full">
            <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider line-clamp-1">Ingresos</p>
            {/* Se reemplaza truncate por break-words/text-wrap para que los números bajen de línea si no caben */}
            <p className="text-sm sm:text-xl font-bold text-slate-900 break-words mt-0.5">${totals.income.toFixed(2)}</p>
          </div>
        </div>

        {/* DEUDA PENDIENTE */}
        <div 
          onClick={() => setHistoryType('expense')}
          className="bg-white border border-slate-100 hover:border-red-300 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-4 cursor-pointer group"
        >
          <div className="p-2 sm:p-3 bg-red-50 text-red-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform shrink-0">
            <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="w-full">
            <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider line-clamp-1">Pendiente</p>
            <p className="text-sm sm:text-xl font-bold text-slate-900 break-words mt-0.5">${totals.expense.toFixed(2)}</p>
          </div>
        </div>

        {/* AHORROS */}
        <div 
          onClick={() => setHistoryType('saving')}
          className="bg-white border border-slate-100 hover:border-blue-300 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-4 cursor-pointer group"
        >
          <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform shrink-0">
            <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="w-full">
            <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider line-clamp-1">Ahorros</p>
            <p className="text-sm sm:text-xl font-bold text-slate-900 break-words mt-0.5">${totals.saving.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* LISTADO DE ÚLTIMOS MOVIMIENTOS */}
      <div>
        {/* ENCABEZADO CON CONTROLES DE VISTA */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Últimos Movimientos</h3>
            <span className="text-xs text-slate-500 font-medium">({mainTransactions.length})</span>
          </div>

          {/* Selector Lista / Cuadrícula */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista en Lista"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {mainTransactions.length === 0 ? (
          <div className="text-center py-10 sm:py-12 bg-white border border-slate-100 rounded-2xl border-dashed px-4">
            <p className="text-slate-500 text-sm">Aún no tienes movimientos registrados. ¡Crea el primero!</p>
          </div>
        ) : (
          /* Renderizado dinámico: Se ajustó a grid-cols-1 en móvil para evitar que se aplasten las tarjetas */
          <div
            className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                : "flex flex-col gap-3"
            }
          >
            {mainTransactions.map((tx) => (
              <div key={tx.id} className="w-full">
                <TransactionCard 
                  transaction={tx}
                  allTransactions={transactions}
                  onDelete={handleDelete} 
                  onClick={(tx) => setSelectedTx(tx)}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALES */}
      <TransactionDetailsModal
        isOpen={!!selectedTx && !isEditing}
        transaction={selectedTx}
        allTransactions={transactions}
        onClose={() => setSelectedTx(null)}
        onUpdate={fetchTransactions}
        onEdit={() => setIsEditing(true)}
      />

      <TransactionModal
        isOpen={isCreateModalOpen || isEditing}
        initialData={isEditing ? selectedTx : null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditing(false);
          setSelectedTx(null);
        }}
        onSuccess={() => {
          fetchTransactions();
          setIsCreateModalOpen(false);
          setIsEditing(false);
          setSelectedTx(null);
        }}
      />

      <HistoryModal
        isOpen={!!historyType}
        type={historyType}
        onClose={() => setHistoryType(null)}
        transactions={transactions}
      />
    </div>
  );
};