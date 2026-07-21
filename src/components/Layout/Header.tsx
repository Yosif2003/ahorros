// src/components/Layout/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Flame, Wallet, User as UserIcon, Bell, Plus, Users, Search, Target } from 'lucide-react';
import { authService } from '../../features/auth/authService';
import { ProfileModal } from '../ProfileModal';
import { TransactionModal } from '../TransactionModal';
import { CreateSharedModal } from '../CreateSharedModal';
import { JoinSharedModal } from '../JoinSharedModal';
import { SharedSavingsListModal } from '../SharedSavingsListModal';
import type { User } from '../../types/auth';

interface HeaderProps {
  user: User | null;
  onUserUpdated: (updatedUser: User) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onUserUpdated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados para controlar los modales
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCreateSharedOpen, setIsCreateSharedOpen] = useState(false);
  const [isJoinSharedOpen, setIsJoinSharedOpen] = useState(false);
  const [isSavingsListOpen, setIsSavingsListOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* SECCIÓN IZQUIERDA: Logo y Navegación */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-slate-900 text-white rounded-xl">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-slate-900">
                SI
              </span>
            </Link>
            
            {/* Navegación Principal */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard' 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Resumen
              </Link>

              {/* Botón Mis Metas */}
              <button 
                onClick={() => setIsSavingsListOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  location.pathname.startsWith('/shared-savings')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Target className="h-4 w-4" />
                Mis Metas
              </button>
            </nav>
          </div>

          {/* SECCIÓN DERECHA: Herramientas y Perfil */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Botones de Ahorro Compartido */}
            <div className="hidden lg:flex items-center gap-2 mr-2">
              <button 
                onClick={() => setIsJoinSharedOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Unirse a Meta</span>
              </button>
              
              <button 
                onClick={() => setIsCreateSharedOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Crear Compartido</span>
              </button>
            </div>

            {/* Botón Nueva Transacción */}
            <button 
              onClick={() => setIsTransactionModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nueva</span>
            </button>

            {/* Notificaciones */}
            <button 
              title="Notificaciones"
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white box-content"></span>
            </button>

            {/* Racha */}
            <div 
              title="Días seguidos iniciando sesión"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/60 text-amber-700 rounded-lg text-xs font-medium cursor-help"
            >
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>{user?.streak ?? 0}</span>
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200 ml-1"></div>

            {/* Menú Perfil */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer group text-left pl-1 sm:pl-2"
              title="Ver / Editar perfil"
            >
              <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 group-hover:border-slate-300 flex items-center justify-center text-slate-600 transition-colors overflow-hidden">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-slate-900 leading-none group-hover:underline">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-[10px] text-slate-500 leading-none mt-1 max-w-[120px] truncate">
                  {user?.email}
                </p>
              </div>
            </button>

            {/* Botón Salir */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* --- MODALES --- */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUserUpdated={onUserUpdated}
      />
      
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event('transaction-updated'));
        }}
      />
      
      <CreateSharedModal 
        isOpen={isCreateSharedOpen} 
        onClose={() => setIsCreateSharedOpen(false)} 
      />
      
      <JoinSharedModal 
        isOpen={isJoinSharedOpen} 
        onClose={() => setIsJoinSharedOpen(false)} 
      />
      
      <SharedSavingsListModal 
        isOpen={isSavingsListOpen} 
        onClose={() => setIsSavingsListOpen(false)}
      />
    </>
  );
};
