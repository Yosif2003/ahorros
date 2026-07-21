// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Plus } from 'lucide-react';
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

  const totals = transactions.reduce(
    (acc, curr) => {
      acc[curr.type] += curr.amount;
      return acc;
    },
    { income: 0, expense: 0, saving: 0 }
  );

  const balance = totals.income + totals.saving - totals.expense;

  // Ocultamos los gastos vinculados del tablero principal
  const mainTransactions = transactions.filter(tx => !tx.linkedTo);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500 font-medium animate-pulse">Cargando tu información financiera...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* 1. SECCIÓN SUPERIOR: BALANCE & BOTÓN DE ACCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">Balance Disponible</p>
          <h2 className="text-4xl font-bold tracking-tight">${balance.toFixed(2)}</h2>
        </div>
        <button
          onClick={() => {
            setSelectedTx(null);
            setIsEditing(false);
            setIsCreateModalOpen(true);
          }}
          className="w-full md:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Movimiento</span>
        </button>
      </div>

      {/* 2. TARJETAS DE RESUMEN (VER HISTORIAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setHistoryType('income')}
          className="bg-white border border-slate-100 hover:border-emerald-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer group"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Ingresos</p>
            <p className="text-xl font-bold text-slate-900">${totals.income.toFixed(2)}</p>
          </div>
        </div>

        <div 
          onClick={() => setHistoryType('expense')}
          className="bg-white border border-slate-100 hover:border-red-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer group"
        >
          <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Gastos</p>
            <p className="text-xl font-bold text-slate-900">${totals.expense.toFixed(2)}</p>
          </div>
        </div>

        <div 
          onClick={() => setHistoryType('saving')}
          className="bg-white border border-slate-100 hover:border-blue-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer group"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Ahorros</p>
            <p className="text-xl font-bold text-slate-900">${totals.saving.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 3. LISTADO DE ÚLTIMOS MOVIMIENTOS */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Últimos Movimientos</h3>
          <span className="text-xs text-slate-500 font-medium">{mainTransactions.length} registrados</span>
        </div>
        
        {mainTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl border-dashed">
            <p className="text-slate-500 text-sm">Aún no tienes movimientos registrados. ¡Crea el primero!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mainTransactions.map((tx) => (
              <TransactionCard 
                key={tx.id} 
                transaction={tx} 
                onDelete={handleDelete} 
                onClick={(tx) => setSelectedTx(tx)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* === MODAL 1: DETALLE DEL MOVIMIENTO Y ABONOS === */}
      <TransactionDetailsModal
        isOpen={!!selectedTx && !isEditing}
        transaction={selectedTx}
        allTransactions={transactions}
        onClose={() => setSelectedTx(null)}
        onUpdate={fetchTransactions}
        onEdit={() => setIsEditing(true)}
      />

      {/* === MODAL 2: CREACIÓN Y EDICIÓN DE MOVIMIENTOS === */}
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

      {/* === MODAL 3: HISTORIAL Y EVOLUCIÓN MENSUAL === */}
      <HistoryModal
        isOpen={!!historyType}
        type={historyType}
        onClose={() => setHistoryType(null)}
        transactions={transactions}
      />
    </div>
  );
};