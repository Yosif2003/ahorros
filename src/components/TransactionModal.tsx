// src/components/TransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp, PiggyBank, RefreshCw, Calendar, Power } from 'lucide-react';
import { transactionService } from '../features/transactions/transactionService';
import type { Transaction, TransactionType } from '../types/transcations';
import toast from 'react-hot-toast';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [linkedTo, setLinkedTo] = useState('');
  const [date, setDate] = useState('');

  // === ESTADOS PARA RECURRENCIA ADMINISTRABLE ===
  const [name, setName] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'none' | 'subscription' | 'installment'>('subscription');
  const [duration, setDuration] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [availableSources, setAvailableSources] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // MODO EDICIÓN: Cargamos los datos existentes
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setCategory(initialData.category);
        setDescription(initialData.description || '');
        setLinkedTo(initialData.linkedTo || '');

        setName(initialData.name || '');
        setIsRecurring(initialData.isRecurring || false);
        setRecurringType(initialData.recurringType || 'subscription');
        setDuration(initialData.duration ? initialData.duration.toString() : '');
        setIsActive(initialData.isActive ?? true);

        const formattedDate = initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        setDate(formattedDate);

        const formattedNextDate = initialData.nextPaymentDate
          ? new Date(initialData.nextPaymentDate).toISOString().split('T')[0]
          : '';
        setNextPaymentDate(formattedNextDate);
      } else {
        // MODO CREACIÓN: Limpiamos formulario
        setType('expense');
        setAmount('');
        setCategory('');
        setDescription('');
        setLinkedTo('');
        setName('');
        setIsRecurring(false);
        setRecurringType('subscription');
        setDuration('');
        setIsActive(true);

        const today = new Date().toISOString().split('T')[0];
        setDate(today);

        // Fecha sugerida para el próximo cobro (+1 mes)
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setNextPaymentDate(nextMonth.toISOString().split('T')[0]);
      }

      // Fuentes disponibles para gastos vinculados
      transactionService.getTransactions().then(data => {
        const filtered = data.filter(t => (t.type === 'income' || t.type === 'saving') && t.id !== initialData?.id);
        setAvailableSources(filtered);
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const baseData = {
      amount: parseFloat(amount),
      category,
      description,
      date,
      name: isRecurring ? name : undefined,
      isRecurring,
      recurringType: isRecurring ? recurringType : 'none',
      duration: isRecurring && duration ? parseInt(duration) : null,
      nextPaymentDate: isRecurring && nextPaymentDate ? nextPaymentDate : undefined,
      isActive: isRecurring ? isActive : true,
    };

    try {
      if (initialData) {
        await transactionService.updateTransaction(initialData.id, baseData);
        toast.success('Transacción actualizada correctamente');
      } else {
        await transactionService.createTransaction({
          ...baseData,
          type,
          linkedTo: linkedTo || undefined,
        });
        toast.success('Transacción guardada correctamente');
      }
      window.dispatchEvent(new Event('transaction-updated'));
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Error al procesar la transacción');
      setError(err.message || 'Error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {initialData ? 'Editar Transacción' : 'Nueva Transacción'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Selector de Tipo */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={!!initialData}
              onClick={() => setType('expense')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                type === 'expense' ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              } ${!!initialData ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <TrendingDown className="h-5 w-5" />
              <span className="text-xs">Gasto</span>
            </button>
            <button
              type="button"
              disabled={!!initialData}
              onClick={() => setType('income')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                type === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              } ${!!initialData ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Ingreso</span>
            </button>
            <button
              type="button"
              disabled={!!initialData}
              onClick={() => setType('saving')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                type === 'saving' ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              } ${!!initialData ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <PiggyBank className="h-5 w-5" />
              <span className="text-xs">Ahorro</span>
            </button>
          </div>

          {/* Monto y Fecha Inicial */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Fecha Registro</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Categoría</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm"
              placeholder="Ej. Comida, Servicios, Entretenimiento..."
            />
          </div>

          {/* CONFIGURACIÓN DE GASTO RECURRENTE */}
          {type === 'expense' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 py-1">
                <input 
                  type="checkbox" 
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4 text-emerald-600" />
                  EzU n GaSt0 rRecurRentE 0 ª Mecez
                </label>
              </div>

              {isRecurring && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  
                  {/* Nombre del servicio */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nombre del Servicio / Producto</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Netflix, Gimnasio, Laptop MSI..."
                      required={isRecurring}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>

                  {/* Tipo de Recurrencia */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="reqType"
                        checked={recurringType === 'subscription'}
                        onChange={() => setRecurringType('subscription')}
                        className="text-slate-900 focus:ring-slate-900"
                      />
                      Suscripción
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="reqType"
                        checked={recurringType === 'installment'}
                        onChange={() => setRecurringType('installment')}
                        className="text-slate-900 focus:ring-slate-900"
                      />
                      Pago a Meses
                    </label>
                  </div>

                  {/* Duración en meses */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Duración total {recurringType === 'subscription' && '(Opcional/Dejar vacío si es indefinido)'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Ej. 12"
                        required={recurringType === 'installment'}
                        className="w-28 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                      <span className="text-sm text-slate-500">meses</span>
                    </div>
                  </div>

                  {/* Próxima Fecha de Cobro */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" /> Próxima Fecha de Cobro Automático
                    </label>
                    <input
                      type="date"
                      value={nextPaymentDate}
                      onChange={(e) => setNextPaymentDate(e.target.value)}
                      required={isRecurring}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-500 focus:ring-1"
                    />
                  </div>

                  {/* Estado Activo / Pausado */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                      <Power className="h-3.5 w-3.5 text-slate-500" /> Cobro Automático Activo
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isActive} 
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Descripción (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all resize-none text-sm"
              placeholder="Detalles adicionales..."
            />
          </div>

          {/* Vincular Gasto */}
          {type === 'expense' && availableSources.length > 0 && !initialData && !isRecurring && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Vincular a (Opcional)</label>
              <select
                value={linkedTo}
                onChange={(e) => setLinkedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm"
              >
                <option value="">No vincular</option>
                {availableSources.map(src => (
                  <option key={src.id} value={src.id}>
                    {src.category} (${src.amount}) - {new Date(src.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-70 mt-4 cursor-pointer"
          >
            {isLoading ? 'Guardando...' : (initialData ? 'Actualizar Transacción' : 'Guardar Transacción')}
          </button>
        </form>
      </div>
    </div>
  );
};
