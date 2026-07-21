import React, { useState } from 'react';
import { Wallet, AlertCircle, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '../features/auth/authService';
import type { LoginProps } from '../types/auth';

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 text-slate-900">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 border border-slate-200/80 shadow-sm">
        
        {/* Encabezado */}
        <div className="space-y-2 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-1">
            <Wallet className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Iniciar sesión
          </h1>
          <p className="text-xs text-slate-500">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200/60 p-3 text-xs text-red-600 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Correo electrónico
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full rounded-lg bg-white border border-slate-200 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">
                Contraseña
              </label>
              <button 
  type="button"
  onClick={() => window.location.href = '/forgot-password'} // o usa navigate('/forgot-password')
  className="text-xs text-slate-500 hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer"
>
  ¿Olvidaste la clave?
</button>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg bg-white border border-slate-200 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 py-2.5 px-4 text-xs font-medium text-white transition-colors duration-200 focus:ring-2 focus:ring-slate-900/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Ingresando...</span>
              </>
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer / Navegación */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          ¿No tienes cuenta?{' '}
          <button 
            type="button"
            onClick={onNavigateToRegister}
            className="font-semibold text-slate-900 hover:underline bg-transparent border-0 cursor-pointer"
          >
            Regístrate
          </button>
        </div>

      </div>
    </div>
  );
};