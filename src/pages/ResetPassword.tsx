import React, { useState } from 'react';
import { Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../features/auth/authService';
import { useNavigate, useParams } from 'react-router-dom';

export const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');
    try {
      const res = await authService.resetPassword(token, password);
      setMessage(res.message);
      setStatus('success');
    } catch (err: any) {
      setMessage(err.message || 'Ocurrió un error');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 text-slate-900">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 border border-slate-200/80 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Nueva contraseña</h1>
          <p className="text-xs text-slate-500">Ingresa tu nueva clave de acceso.</p>
        </div>

        {status === 'error' && (
          <div className="rounded-xl bg-red-50 border border-red-200/60 p-3 text-xs text-red-600 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{message}</span>
          </div>
        )}

        {status === 'success' ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200/60 p-5 text-center space-y-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-medium text-emerald-800">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 px-4 text-xs font-medium text-white transition-colors"
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Nueva contraseña</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg bg-white border border-slate-200 pl-9 pr-3.5 py-2.5 text-xs outline-none transition-all focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || password.length < 6}
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 py-2.5 px-4 text-xs font-medium text-white transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? <><Loader2 className="h-3.5 w-3.5 animate-spin inline mr-2" /> Guardando...</> : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};