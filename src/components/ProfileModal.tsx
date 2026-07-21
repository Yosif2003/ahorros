import React, { useState } from 'react';
import { X, User as UserIcon, Mail, Lock, Check, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../features/auth/authService';
import type { User } from '../types/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const updated = await authService.updateUsername(name);
      onUserUpdated(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Perfil de Usuario</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Alertas */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Nombre actualizado correctamente</span>
            </div>
          )}

          {/* Campo Nombre de usuario (Editable) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Nombre de usuario
            </label>
            <div className="relative flex items-center">
              <UserIcon className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg bg-white border border-slate-200 pl-9 pr-3.5 py-2 text-xs text-slate-900 outline-none transition-all focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Campo Email (Bloqueado / Solo Lectura) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">
                Correo electrónico
              </label>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock className="h-3 w-3" /> No modificable
              </span>
            </div>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                readOnly
                className="w-full rounded-lg bg-slate-100 border border-slate-200 pl-9 pr-3.5 py-2 text-xs text-slate-500 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || name.trim() === user?.name}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar cambios</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};