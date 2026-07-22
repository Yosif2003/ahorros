// src/components/TransactionCard.tsx
import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Calendar, Trash2 } from 'lucide-react';
import type { Transaction } from '../types/transcations';

interface TransactionCardProps {
  transaction: Transaction;
  allTransactions?: Transaction[];
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClick: (transaction: Transaction) => void;
  viewMode?: 'grid' | 'list';
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  allTransactions = [],
  onDelete,
  onClick,
  viewMode = 'grid',
}) => {
  const isIncome = transaction.type === 'income';
  const isExpense = transaction.type === 'expense';

  const paidAmount = transaction.paidAmount || 0;
  const remaining = transaction.amount - paidAmount;
  const isFullyPaid = isExpense && remaining === 0;

  // Lógica para ingresos con deudas vinculadas y abonos
  const linkedExpenses = allTransactions.filter(tx => tx.linkedTo === transaction.id);
  const hasLinkedExpenses = isIncome && linkedExpenses.length > 0;

  const linkedExpensesTotal = linkedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const linkedExpensesPaid = linkedExpenses.reduce((sum, exp) => sum + (exp.paidAmount || 0), 0);

  // La deuda que realmente falta por pagar
  const linkedExpensesRemaining = linkedExpensesTotal - linkedExpensesPaid;

  // El balance es el monto inicial menos la deuda restante (los abonos suman al balance)
  const currentBalance = transaction.amount - linkedExpensesRemaining;

  const icon = isIncome ? <TrendingUp className="h-5 w-5" /> :
    isExpense ? <TrendingDown className="h-5 w-5" /> :
    <PiggyBank className="h-5 w-5" />;

  const iconColorClasses = isIncome ? 'bg-emerald-50 text-emerald-600' :
    isExpense ? 'bg-red-50 text-red-600' :
    'bg-blue-50 text-blue-600';

  const mainLabel = isExpense && paidAmount > 0 ? 'Pendiente' : (hasLinkedExpenses ? 'Balance Actual' : 'Monto');
  const mainAmount = hasLinkedExpenses ? currentBalance : (isExpense ? remaining : transaction.amount);
  const mainAmountColor = isIncome ? 'text-emerald-600' :
    isFullyPaid ? 'text-emerald-600' :
    isExpense ? 'text-slate-900' :
    'text-blue-600';

  const badges = (
    <>
      {isFullyPaid && (
        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ring-1 ring-emerald-300 whitespace-nowrap">
          Saldado
        </span>
      )}
      {hasLinkedExpenses && (
        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ring-1 ring-amber-300 whitespace-nowrap">
          Con Deuda
        </span>
      )}
    </>
  );

  const extraInfo = (
    <>
      {isExpense && paidAmount > 0 && !isFullyPaid && (
        <div className="text-xs text-emerald-600 font-medium">
          Abonado: ${paidAmount.toFixed(2)}
        </div>
      )}
      {hasLinkedExpenses && (
        <div className="text-[11px] text-slate-500 font-medium flex flex-col gap-0.5">
          <span>Inicial: <span className="font-semibold text-slate-700">${transaction.amount.toFixed(2)}</span></span>
          {linkedExpensesRemaining > 0 && (
            <span className="text-red-500 font-semibold" title="Deuda restante por pagar">
              Deuda: -${linkedExpensesRemaining.toFixed(2)}
            </span>
          )}
          {linkedExpensesPaid > 0 && (
            <span className="text-emerald-600 font-semibold" title="Total abonado a deudas vinculadas">
              Abonado: +${linkedExpensesPaid.toFixed(2)}
            </span>
          )}
        </div>
      )}
    </>
  );

  // ===================== VISTA DE LISTA =====================
  // Fila horizontal compacta: icono + categoría/fecha a la izquierda, monto a la derecha.
  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onClick(transaction)}
        className={`group bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3 relative cursor-pointer text-left ${
          isFullyPaid ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 hover:border-slate-300'
        }`}
      >
        <div className={`p-2.5 rounded-xl shrink-0 ${iconColorClasses}`}>
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-900 capitalize truncate flex items-center gap-1.5 flex-wrap">
            {transaction.category}
            {badges}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
            <Calendar className="h-3 w-3" />
            <span>{new Date(transaction.date).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 gap-0.5 text-right">
          <span className="text-xs font-medium text-slate-400">{mainLabel}</span>
          <span className={`font-bold text-lg ${mainAmountColor}`}>
            {isExpense ? '-' : '+'}${mainAmount.toFixed(2)}
          </span>
          {extraInfo}
        </div>

        <button
          onClick={(e) => onDelete(transaction.id, e)}
          className="shrink-0 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all"
          title="Eliminar movimiento"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ===================== VISTA DE CUADRÍCULA =====================
  // Todo apilado en columna: nada se comprime lado a lado, así ningún dato queda oculto
  // aunque la tarjeta sea angosta (2-3 columnas).
  return (
    <div
      onClick={() => onClick(transaction)}
      className={`group bg-white border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 relative h-full cursor-pointer text-left ${
        isFullyPaid ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 hover:border-slate-300'
      }`}
    >
      <button
        onClick={(e) => onDelete(transaction.id, e)}
        className="absolute top-3 right-3 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Eliminar movimiento"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className={`p-3 rounded-xl shrink-0 ${iconColorClasses}`}>
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-900 capitalize break-words flex items-center gap-1.5 flex-wrap">
            {transaction.category}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(transaction.date).toLocaleDateString()}</span>
          </div>
          {(isFullyPaid || hasLinkedExpenses) && (
            <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
              {badges}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-50 pt-3 flex flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-400">{mainLabel}</span>
          <span className={`font-bold text-xl break-words ${mainAmountColor}`}>
            {isExpense ? '-' : '+'}${mainAmount.toFixed(2)}
          </span>
        </div>
        {extraInfo}
      </div>
    </div>
  );
};