// src/components/TransactionDetailModal.tsx
import React, { useState } from 'react';
import { X, Calendar, Wallet, CheckCircle2, Edit2, RefreshCw, Power, Clock, Link as LinkIcon } from 'lucide-react';
import type { Transaction } from '../types/transcations';
import { transactionService } from '../features/transactions/transactionService';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface Props {
  transaction: Transaction | null;
  allTransactions?: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onEdit: () => void;
}

const LinkedExpenseItem: React.FC<{
  expense: Transaction;
  onUpdate: () => void;
}> = ({ expense, onUpdate }) => {
  const [abono, setAbono] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const paidAmount = expense.paidAmount || 0;
  const remaining = expense.amount - paidAmount;
  const progress = Math.min((paidAmount / expense.amount) * 100, 100);
  const isFullyPaid = remaining === 0;

  const handleAbonar = async (e: React.FormEvent) => {
    e.preventDefault();
    const abonoNum = parseFloat(abono);
    if (!abono || abonoNum <= 0) return;
    if (abonoNum > remaining) {
      toast.error('El abono no puede superar el saldo pendiente');
      return;
    }

    try {
      setIsLoading(true);
      await transactionService.addPayment(expense.id, abonoNum, description);

      if (abonoNum === remaining) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#059669', '#FCD34D']
        });
        toast.success('¡DEUDA SALDADA!', {
          style: { background: '#10B981', color: '#fff', fontWeight: 'bold' }
        });
      } else {
        toast.success('Abono registrado correctamente');
      }
      setAbono('');
      setDescription('');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Error al abonar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-slate-900 capitalize text-sm">{expense.category}</p>
          {expense.description && (
            <p className="text-xs text-slate-500 mt-0.5">{expense.description}</p>
          )}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isFullyPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isFullyPaid ? 'Saldado' : 'Pendiente'}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <span>Abonado: ${paidAmount.toFixed(2)}</span>
          <span>Total: ${expense.amount.toFixed(2)}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${isFullyPaid ? 'bg-emerald-500' : 'bg-emerald-600'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
          <span>Progreso: {progress.toFixed(1)}%</span>
          <span className="font-semibold text-slate-700">Saldo pendiente: ${remaining.toFixed(2)}</span>
        </div>
      </div>

      {expense.payments && expense.payments.length > 0 && (
        <div className="pt-2 border-t border-slate-200/80">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Historial de Abonos</p>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {expense.payments.map((payment, idx) => (
              <div key={payment._id || idx} className="flex justify-between items-center text-xs p-2 bg-white rounded border border-slate-100">
                <div>
                  <p className="font-medium text-slate-700">{payment.description || 'Abono sin descripción'}</p>
                  <p className="text-[10px] text-slate-400">{new Date(payment.date).toLocaleDateString()}</p>
                </div>
                <span className="font-bold text-emerald-600">+${payment.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isFullyPaid && (
        <form onSubmit={handleAbonar} className="pt-2 border-t border-slate-200/80 space-y-2">
          <label className="text-xs font-medium text-slate-700 block">Abonar a este gasto</label>
          <div className="flex gap-2">
            <div className="relative w-1/3">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
              <input
                type="number"
                step="0.01"
                max={remaining}
                value={abono}
                onChange={(e) => setAbono(e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                placeholder="0.00"
              />
            </div>
            <div className="w-2/3">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                placeholder="Descripción (ej. Quincena)"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !abono}
            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Wallet className="h-3.5 w-3.5" />
            {isLoading ? 'Registrando...' : 'Confirmar Abono'}
          </button>
        </form>
      )}
    </div>
  );
};

export const TransactionDetailsModal: React.FC<Props> = ({
  transaction,
  allTransactions = [],
  isOpen,
  onClose,
  onUpdate,
  onEdit
}) => {
  const [abono, setAbono] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  if (!isOpen || !transaction) return null;

  const paidAmount = transaction.paidAmount || 0;
  const remaining = transaction.amount - paidAmount;
  const isIncome = transaction.type === 'income';
  const isExpense = transaction.type === 'expense';

  // Cálculos de vinculaciones y abonos
  const linkedExpenses = allTransactions.filter((tx) => tx.linkedTo === transaction.id);
  const hasLinkedExpenses = isIncome && linkedExpenses.length > 0;
  
  const linkedExpensesTotal = linkedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const linkedExpensesPaid = linkedExpenses.reduce((sum, exp) => sum + (exp.paidAmount || 0), 0);
  
  // La deuda que realmente falta por pagar
  const linkedExpensesRemaining = linkedExpensesTotal - linkedExpensesPaid;
  
  // Balance real sumando los abonos (Monto inicial - Deuda restante)
  const currentBalance = transaction.amount - linkedExpensesRemaining;

  const totalMonths = transaction.duration || 0;
  const currentPaymentsMade = transaction.paymentsMade || 1;
  const monthsRemaining = Math.max(0, totalMonths - currentPaymentsMade);

  const handleAbonar = async (e: React.FormEvent) => {
    e.preventDefault();
    const abonoNum = parseFloat(abono);
    if (!abono || abonoNum <= 0) return;
    if (abonoNum > remaining) {
      toast.error('El abono no puede superar el saldo pendiente');
      return;
    }
    
    try {
      setIsLoading(true);
      await transactionService.addPayment(transaction.id, abonoNum, description);
      
      if (abonoNum === remaining) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#059669', '#FCD34D']
        });
        toast.success('¡DEUDA SALDADA!', {
          style: { background: '#10B981', color: '#fff', fontWeight: 'bold' }
        });
      } else {
        toast.success('Abono registrado correctamente');
      }
      setAbono('');
      setDescription('');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al abonar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setIsTogglingStatus(true);
      await transactionService.updateTransaction(transaction.id, {
        amount: transaction.amount,
        category: transaction.category,
        isActive: !transaction.isActive
      });
      toast.success(transaction.isActive ? 'Recurrencia pausada' : 'Recurrencia activada');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error('No se pudo cambiar el estado de la recurrencia');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Detalles del Movimiento</h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={onEdit} 
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Editar transacción"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Categoría</p>
            <p className="text-lg font-medium text-slate-900 capitalize">{transaction.category}</p>
          </div>
          
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Fecha de Registro</p>
            <div className="flex items-center gap-2 text-slate-900">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{new Date(transaction.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Recurrencia */}
          {transaction.isRecurring && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <RefreshCw className="h-4 w-4 text-emerald-600" />
                  <span>{transaction.recurringType === 'subscription' ? 'Suscripción' : 'Pago a Meses'}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  transaction.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {transaction.isActive ? 'Activo' : 'Pausado'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Servicio / Producto</p>
                  <p className="font-medium text-slate-900">{transaction.name || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Meses Restantes</p>
                  <p className="font-bold text-slate-900">
                    {totalMonths > 0 
                      ? `${monthsRemaining} de ${totalMonths} mes(es)` 
                      : 'Indefinido'}
                  </p>
                </div>
              </div>

              {transaction.nextPaymentDate && transaction.isActive && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>
                    Próximo cobro: <strong>{new Date(transaction.nextPaymentDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isTogglingStatus}
                className={`w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                  transaction.isActive 
                    ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {transaction.isActive ? 'Pausar Cobro Automático' : 'Reactivar Cobro Automático'}
              </button>
            </div>
          )}

          {transaction.description && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Descripción</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{transaction.description}</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 font-medium">
                {hasLinkedExpenses ? 'Monto Inicial:' : 'Monto Total:'}
              </span>
              <span className={`font-bold text-lg ${hasLinkedExpenses ? 'text-slate-900' : ''}`}>
                ${transaction.amount.toFixed(2)}
              </span>
            </div>
            
            {hasLinkedExpenses && (
              <>
                <div className="flex justify-between items-center text-slate-600 mb-2">
                  <span className="text-sm">Deuda Vinculada Total:</span>
                  <span className="font-semibold text-sm">-${linkedExpensesTotal.toFixed(2)}</span>
                </div>
                {linkedExpensesPaid > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 mb-2">
                    <span className="text-sm">Deuda Abonada:</span>
                    <span className="font-semibold text-sm">+${linkedExpensesPaid.toFixed(2)}</span>
                  </div>
                )}
                {linkedExpensesRemaining > 0 && (
                  <div className="flex justify-between items-center text-red-500 mb-3">
                    <span className="text-sm">Deuda por Pagar:</span>
                    <span className="font-semibold text-sm">-${linkedExpensesRemaining.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span>Balance Actual del Ingreso:</span>
                  <span>${currentBalance.toFixed(2)}</span>
                </div>
              </>
            )}

            {isExpense && paidAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 mb-2">
                <span>Total Abonado:</span>
                <span className="font-medium">-${paidAmount.toFixed(2)}</span>
              </div>
            )}
            
            {isExpense && (
              <div className="flex justify-between items-center text-slate-900 font-bold bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span>Saldo Pendiente:</span>
                <span>${remaining.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* SECCIÓN DE GASTOS VINCULADOS */}
          {hasLinkedExpenses && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Gastos Vinculados ({linkedExpenses.length})
                </h3>
              </div>
              <div className="space-y-3">
                {linkedExpenses.map((expense) => (
                  <LinkedExpenseItem 
                    key={expense.id} 
                    expense={expense} 
                    onUpdate={onUpdate} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Historial de Abonos del Movimiento Principal */}
          {isExpense && transaction.payments && transaction.payments.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Historial de Abonos</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {transaction.payments.map((payment, idx) => (
                  <div key={payment._id || idx} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{payment.description || 'Abono sin descripción'}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(payment.date).toLocaleDateString()} {new Date(payment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                      +${payment.amount.toFixed(2)} <CheckCircle2 className="h-3 w-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulario de Abono Principal */}
          {isExpense && remaining > 0 && (
            <form onSubmit={handleAbonar} className="pt-4 mt-4 border-t border-slate-100 space-y-3">
              <label className="text-xs font-medium text-slate-700 block">Registrar nuevo abono</label>
              
              <div className="flex gap-2">
                <div className="relative w-1/3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    max={remaining}
                    value={abono}
                    onChange={(e) => setAbono(e.target.value)}
                    className="w-full pl-7 pr-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="w-2/3">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                    placeholder="Ej. Quincena, Bono..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !abono}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                {isLoading ? 'Registrando...' : 'Confirmar Abono'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
