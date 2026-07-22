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
    // Backdrop: Centrado en PC, pegado abajo en móvil
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm sm:p-4">
      
      {/* Contenedor del Modal */}
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Cabecera (Fija) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">
            {initialData ? 'Editar Transacción' : 'Nueva Transacción'}
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Formulario que envuelve el scroll y el footer fijo */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
          
          {/* Cuerpo (Habilitado para Scroll) */}
          <div className="overflow-y-auto p-5 space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}

            {/* Selector de Tipo */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                disabled={!!initialData}
                onClick={() => setType('expense')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                  type === 'expense' ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                } ${!!initialData ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <TrendingDown className="h-6 w-6 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Gasto</span>
              </button>
              <button
                type="button"
                disabled={!!initialData}
                onClick={() => setType('income')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                  type === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                } ${!!initialData ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <TrendingUp className="h-6 w-6 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Ingreso</span>
              </button>
              <button
                type="button"
                disabled={!!initialData}
                onClick={() => setType('saving')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                  type === 'saving' ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                } ${!!initialData ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <PiggyBank className="h-6 w-6 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Ahorro</span>
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
                    className="w-full pl-7 pr-3 py-3 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-base sm:text-sm"
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
                  className="w-full px-3 py-3 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-base sm:text-sm"
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
                className="w-full px-3 py-3 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-base sm:text-sm"
                placeholder="Ej. Comida, Servicios, Entretenimiento..."
              />
            </div>

            {/* CONFIGURACIÓN DE GASTO RECURRENTE */}
            {type === 'expense' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 py-1">
                  <input 
                    type="checkbox" 
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-5 h-5 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                  />
                  <label htmlFor="recurring" className="text-base sm:text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 sm:h-4 sm:w-4 text-emerald-600" />
                    Gasto recurrente
                  </label>
                </div>

                {isRecurring && (
                  <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-5">
                    
                    {/* Nombre del servicio */}
                    <div>
                      <label className="block text-sm sm:text-xs font-medium text-slate-700 mb-1.5">Nombre del Servicio / Producto</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Netflix, Gimnasio, Laptop..."
                        required={isRecurring}
                        className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                    </div>

                    {/* Tipo de Recurrencia */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                      <label className="flex items-center gap-3 text-base sm:text-sm text-slate-700 cursor-pointer">
                        <input 
                          type="radio" 
                          name="reqType"
                          checked={recurringType === 'subscription'}
                          onChange={() => setRecurringType('subscription')}
                          className="w-5 h-5 sm:w-4 sm:h-4 text-slate-900 focus:ring-slate-900"
                        />
                        Suscripción
                      </label>
                      <label className="flex items-center gap-3 text-base sm:text-sm text-slate-700 cursor-pointer">
                        <input 
                          type="radio" 
                          name="reqType"
                          checked={recurringType === 'installment'}
                          onChange={() => setRecurringType('installment')}
                          className="w-5 h-5 sm:w-4 sm:h-4 text-slate-900 focus:ring-slate-900"
                        />
                        Pago a Meses
                      </label>
                    </div>

                    {/* Duración en meses */}
                    <div>
                      <label className="block text-sm sm:text-xs font-medium text-slate-700 mb-1.5">
                        Duración total {recurringType === 'subscription' && <span className="text-slate-500 font-normal">(Vacío si es indefinido)</span>}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          placeholder="Ej. 12"
                          required={recurringType === 'installment'}
                          className="w-full sm:w-28 px-3 py-3 sm:py-2 text-base sm:text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                        />
                        <span className="text-base sm:text-sm text-slate-600">meses</span>
                      </div>
                    </div>

                    {/* Próxima Fecha de Cobro */}
                    <div>
                      <label className="block text-sm sm:text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-blue-600" /> Próxima Fecha de Cobro Automático
                      </label>
                      <input
                        type="date"
                        value={nextPaymentDate}
                        onChange={(e) => setNextPaymentDate(e.target.value)}
                        required={isRecurring}
                        className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                    </div>

                    {/* Estado Activo / Pausado */}
                    <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-sm sm:text-xs font-medium text-slate-700 flex items-center gap-2">
                        <Power className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-slate-500" /> Cobro Automático Activo
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isActive} 
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
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
                className="w-full px-3 py-3 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all resize-none text-base sm:text-sm"
                placeholder="Detalles adicionales..."
              />
            </div>

            {/* Vincular Gasto */}
            {type === 'expense' && availableSources.length > 0 && !initialData && !isRecurring && (
              <div className="space-y-1.5 pb-2">
                <label className="text-sm font-medium text-slate-700">Vincular a (Opcional)</label>
                <select
                  value={linkedTo}
                  onChange={(e) => setLinkedTo(e.target.value)}
                  className="w-full px-3 py-3 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-base sm:text-sm"
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
          </div>

          {/* Footer (Fijo) */}
          <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-white sm:rounded-b-2xl pb-6 sm:pb-5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 sm:py-2.5 bg-slate-900 text-white rounded-xl font-medium text-base sm:text-sm hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? 'Guardando...' : (initialData ? 'Actualizar Transacción' : 'Guardar Transacción')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};