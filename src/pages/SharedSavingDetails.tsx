// src/pages/SharedSavingDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, EyeOff, Wallet, CheckCircle2, Users, Calendar, UserPlus, Check } from 'lucide-react';
import { sharedSavingService } from '../features/sharedSavings/sharedSavingService';
import { authService } from '../features/auth/authService';
import type { SharedSaving } from '../types/sharedSavings';
import toast from 'react-hot-toast';

export const SharedSavingDetails: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [saving, setSaving] = useState<SharedSaving | null>(null);
  const [amount, setAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const currentUser = authService.getCurrentUser();

  const fetchSavingDetails = async () => {
    if (!code) return;
    try {
      setIsLoading(true);
      const data = await sharedSavingService.getByCode(code);
      setSaving(data);
    } catch (error: any) {
      toast.error('No se pudo encontrar la meta compartida');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingDetails();
  }, [code]);

// Verificar si el usuario ya es creador o ha aportado/se ha unido a la meta
  const isOwner = saving?.creatorId?._id === currentUser?.id;
  const hasJoined = isOwner || saving?.contributions.some(c => c.userId?._id === currentUser?.id);

  const handleJoinWithoutContributing = async () => {
    if (!saving) return;
    try {
      setIsJoining(true);
      const updated = await sharedSavingService.join(saving.sharedCode);
      setSaving(updated);
      toast.success('¡Te has unido a la meta exitosamente!');
    } catch (error: any) {
      toast.error(error.message || 'Error al unirse a la meta');
    } finally {
      setIsJoining(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saving || !amount) return;
    try {
      setIsSubmitting(true);
      const updated = await sharedSavingService.contribute(saving.sharedCode, parseFloat(amount), isAnonymous);
      setSaving(updated);
      setAmount('');
      toast.success('¡Aporte realizado con éxito!');
    } catch (error: any) {
      toast.error(error.message || 'Error al realizar el aporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (saving?.sharedCode) {
      navigator.clipboard.writeText(saving.sharedCode);
      toast.success('Código copiado al portapapeles');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-slate-500 animate-pulse">
        Cargando detalles de la meta...
      </div>
    );
  }

  if (!saving) return null;

  const progress = Math.min((saving.currentAmount / saving.goalAmount) * 100, 100);
  const isCompleted = saving.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Botón Volver */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      {/* Header Principal */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{saving.title}</h1>
              {isCompleted && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Users className="h-3.5 w-3.5" /> Creado por <span className="font-medium text-slate-700">{saving.creatorId.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl self-start sm:self-auto">
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Código de Invitación</p>
              <p className="text-lg font-mono font-bold tracking-widest text-slate-900">{saving.sharedCode}</p>
            </div>
            <button
              onClick={copyCode}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Copiar Código"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Monto Recaudado</p>
              <p className="text-3xl font-bold text-emerald-600">${saving.currentAmount.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Meta Objetivo</p>
              <p className="text-xl font-semibold text-slate-700">${saving.goalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isCompleted ? 'bg-emerald-500' : 'bg-slate-900'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-right text-xs font-semibold text-slate-500">{progress.toFixed(1)}% Alcanzado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Acciones de Usuario (Unirse / Aportar) */}
        <div className="md:col-span-1 space-y-6">
          
          {/* BOTÓN DE UNIRSE SIN APORTAR */}
          {!hasJoined && !isCompleted && (
            <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <UserPlus className="h-5 w-5" />
                <h3 className="font-semibold text-sm">¿Solo quieres unirte?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Puedes unirte a esta meta para hacerle seguimiento desde tu sección de <strong>Mis Metas</strong> sin necesidad de aportar dinero ahora.
              </p>
              <button
                onClick={handleJoinWithoutContributing}
                disabled={isJoining}
                className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isJoining ? 'Uniéndote...' : 'Unirme sin aportar'}
              </button>
            </div>
          )}

          {/* Indicador de que ya pertenece a la meta */}
          {hasJoined && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 text-xs font-medium">
              <Check className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Ya estás participando en esta meta compartida.</span>
            </div>
          )}

          {/* Formulario de Aporte */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" /> Realizar Aporte
            </h3>

            {!isCompleted ? (
              <form onSubmit={handleContribute} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Monto a abonar ($)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <EyeOff className="h-4 w-4 text-slate-400 shrink-0" />
                  Hacer mi aporte de forma anónima
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || !amount}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Aporte'}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                <p className="font-semibold text-emerald-800 text-sm">Meta Alcanzada 🎉</p>
                <p className="text-xs text-emerald-600">Ya no se aceptan nuevos aportes para esta meta.</p>
              </div>
            )}
          </div>
        </div>

        {/* Historial de Aportes */}
        <div className="md:col-span-2">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">
              Historial de Aportes ({saving.contributions.length})
            </h3>

            {saving.contributions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500">Aún no hay aportes registrados. ¡Sé el primero!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {saving.contributions.map((cont) => (
                  <div
                    key={cont._id}
                    className="flex justify-between items-center p-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                        {cont.isAnonymous ? <EyeOff className="h-4 w-4" /> : cont.userId.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {cont.isAnonymous ? 'Usuario Anónimo' : cont.userId.name}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(cont.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-bold text-emerald-600">+${cont.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};