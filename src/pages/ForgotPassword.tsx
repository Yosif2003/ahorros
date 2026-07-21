import React, { useState } from 'react';
import { Mail, AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../features/auth/authService';
import { useNavigate } from 'react-router-dom';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await authService.forgotPassword(email);
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
        
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver al login
        </button>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Recuperar clave</h1>
          <p className="text-xs text-slate-500">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
        </div>

        {status === 'error' && (
          <div className="rounded-xl bg-red-50 border border-red-200/60 p-3 text-xs text-red-600 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{message}</span>
          </div>
        )}

        {status === 'success' ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200/60 p-4 text-sm text-emerald-800 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p>{message}</p>
            <p className="text-xs mt-2 text-emerald-600">Revisa tu consola en el backend (Dev Mode) para ver el enlace.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Correo electrónico</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full rounded-lg bg-white border border-slate-200 pl-9 pr-3.5 py-2.5 text-xs outline-none transition-all focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 py-2.5 px-4 text-xs font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando...</> : 'Enviar enlace'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};