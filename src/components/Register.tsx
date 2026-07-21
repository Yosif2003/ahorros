import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, UserPlus, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../features/auth/authService';
import type { RegisterProps } from '../types/auth';

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({ name, email, password });

      if (onRegisterSuccess) {
        onRegisterSuccess(response.user);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al crear la cuenta');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4 text-zinc-100">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-zinc-900/50 p-8 backdrop-blur-xl border border-zinc-800 shadow-2xl shadow-black/50">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-2 border border-emerald-500/20">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Crea tu cuenta
          </h1>
          <p className="text-sm text-zinc-400">
            Empieza a gestionar tus finanzas hoy mismo
          </p>
        </div>

        {/* Banner de Error */}
        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Nombre Completo
            </label>
            <div className="relative flex items-center">
              <UserIcon className="absolute left-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Tu Nombre"
                className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700/50 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700/50 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700/50 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Confirmar Contraseña
            </label>
            <div className="relative flex items-center">
              <CheckCircle2 className="absolute left-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700/50 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3 px-4 text-sm font-semibold text-zinc-950 transition-all duration-200 hover:bg-emerald-400 focus:ring-2 focus:ring-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creando cuenta...</span>
              </>
            ) : (
              <>
                <span>Registrarse</span>
                <UserPlus className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-zinc-500">
          ¿Ya tienes una cuenta?{' '}
          <button 
            type="button" 
            onClick={onNavigateToLogin}
            className="font-medium text-emerald-400 hover:underline bg-transparent border-0 cursor-pointer"
          >
            Inicia Sesión
          </button>
        </div>

      </div>
    </div>
  );
};