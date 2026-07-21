// src/components/JoinSharedModal.tsx
import React, { useState } from 'react';
import { X, Search, Wallet, EyeOff, UserPlus, Check } from 'lucide-react';
import { sharedSavingService } from '../features/sharedSavings/sharedSavingService';
import { authService } from '../features/auth/authService';
import type { SharedSaving } from '../types/sharedSavings';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinSharedModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState<SharedSaving | null>(null);
  const [amount, setAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = authService.getCurrentUser();

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    try {
      setIsLoading(true);
      const data = await sharedSavingService.getByCode(code);
      setSaving(data);
    } catch (error: any) {
      toast.error('Código no encontrado');
      setSaving(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saving || !amount) return;
    try {
      setIsLoading(true);
      const updated = await sharedSavingService.contribute(saving.sharedCode, parseFloat(amount), isAnonymous);
      setSaving(updated);
      setAmount('');
      toast.success('¡Aporte realizado!');
    } catch (error: any) {
      toast.error(error.message || 'Error al aportar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWithoutContributing = async () => {
    if (!saving) return;
    try {
      setIsLoading(true);
      const updated = await sharedSavingService.join(saving.sharedCode);
      setSaving(updated);
      toast.success('¡Te has unido a la meta!');
    } catch (error: any) {
      toast.error(error.message || 'Error al unirse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setSaving(null);
    onClose();
  };

  // Verificamos si el usuario ya es creador o si ya ha aportado/se ha unido
  const isOwner = saving?.creatorId._id === currentUser?.id;
  const hasJoined = isOwner || saving?.contributions.some(c => c.userId._id === currentUser?.id);
  const progress = saving ? Math.min((saving.currentAmount / saving.goalAmount) * 100, 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden my-8">
        
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Unirse a Meta Compartida</h2>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!saving ? (
            /* Formulario de Búsqueda de Código */
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ingresa el código (Ej. A8X9WQ)"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 font-mono uppercase tracking-widest text-sm"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <Search className="h-4 w-4" /> Buscar
              </button>
            </form>
          ) : (
            /* Detalles de la Meta Encontrada */
            <div className="space-y-6 animate-in fade-in">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900">{saving.title}</h3>
                <p className="text-sm text-slate-500 mt-1">Creado por {saving.creatorId.name}</p>
              </div>

              {/* Barra de progreso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-emerald-600 font-bold">${saving.currentAmount.toFixed(2)}</span>
                  <span className="text-slate-500">Meta: ${saving.goalAmount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Bloque de Acciones (Aportar / Unirse) */}
              {saving.status === 'active' ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  {/* Formulario de Aporte */}
                  <form onSubmit={handleContribute} className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 text-sm"
                          placeholder="Monto a aportar"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || !amount}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 text-sm cursor-pointer shrink-0"
                      >
                        <Wallet className="h-4 w-4" /> Aportar
                      </button>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                      Hacer mi aporte de forma anónima
                    </label>
                  </form>

                  {/* BOTÓN UNIRSE SIN APORTAR */}
                  {!hasJoined ? (
                    <div className="pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={handleJoinWithoutContributing}
                        disabled={isLoading}
                        className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <UserPlus className="h-3.5 w-3.5 text-emerald-600" />
                        Unirme a la meta sin aportar ahora
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <Check className="h-4 w-4" /> Ya formas parte de esta meta
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-3 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-200 text-sm">
                  ¡Esta meta ha sido completada!
                </div>
              )}

              {/* Historial de Aportes */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Historial de Aportes</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {saving.contributions.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-2">Nadie ha aportado aún. ¡Sé el primero!</p>
                  ) : (
                    saving.contributions.map((cont, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                            {cont.isAnonymous ? <EyeOff className="h-4 w-4" /> : cont.userId.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {cont.isAnonymous ? 'Alguien (Anónimo)' : cont.userId.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{new Date(cont.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">+${cont.amount.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};