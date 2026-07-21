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
    } fontally {
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
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* SECCIÓN SUPERIOR: BALANCE & BOTÓN DE ACCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="text-center sm:text-left">
          <p className="text-slate-400 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">Balance Disponible</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">${balance.toFixed(2)}</h2>
        </div>

        <button
          onClick={() => {
            setSelectedTx(null);
            setIsEditing(false);
            setIsCreateModalOpen(true);
          }}
          className="w-full md:w-auto px-4 py-2.5 sm:px-5 sm:py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Nuevo Movimiento</span>
        </button>
      </div>

      {/* TARJETAS DE RESUMEN (3 columnas en móvil) */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
        
        {/* INGRESOS */}
        <div 
          onClick={() => setHistoryType('income')}
          className="bg-white border border-slate-100 hover:border-emerald-300 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-4 cursor-pointer group"
        >
          <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
            <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider truncate">Ingresos</p>
            <p className="text-xs sm:text-xl font-bold text-slate-900 truncate">${totals.income.toFixed(2)}</p>
          </div>
        </div>

        {/* DEUDA PENDIENTE */}
        <div 
          onClick={() => setHistoryType('expense')}
          className="bg-white border border-slate-100 hover:border-red-300 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-4 cursor-pointer group"
        >
          <div className="p-2 sm:p-3 bg-red-50 text-red-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
            <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider truncate">Pendiente</p>
            <p className="text-xs sm:text-xl font-bold text-slate-900 truncate">${totals.expense.toFixed(2)}</p>
          </div>
        </div>

        {/* AHORROS */}
        <div 
          onClick={() => setHistoryType('saving')}
          className="bg-white border border-slate-100 hover:border-blue-300 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-4 cursor-pointer group"
        >
          <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
            <PiggyBank className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider truncate">Ahorros</p>
            <p className="text-xs sm:text-xl font-bold text-slate-900 truncate">${totals.saving.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* LISTADO DE ÚLTIMOS MOVIMIENTOS */}
      <div>
        {/* ENCABEZADO CON CONTROLES DE VISTA */}
        <div className="flex justify-between items-center mb-3 sm:mb-4 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Últimos Movimientos</h3>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium">({mainTransactions.length})</span>
          </div>

          {/* Selector Lista / Cuadrícula */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
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
            <p className="text-slate-500 text-xs sm:text-sm">Aún no tienes movimientos registrados. ¡Crea el primero!</p>
          </div>
        ) : (
          /* Renderizado dinámico según el modo de vista */
          <div
            className={
              viewMode === 'grid'
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5"
                : "flex flex-col gap-2.5"
            }
          >
            {mainTransactions.map((tx) => (
              <TransactionCard 
                key={tx.id} 
                transaction={tx}
                allTransactions={transactions}
                onDelete={handleDelete} 
                onClick={(tx) => setSelectedTx(tx)} 
              />
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
