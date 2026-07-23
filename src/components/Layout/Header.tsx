// src/components/Layout/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Flame, Wallet, User as UserIcon, Bell, Plus, Users, Search, Target, Menu, X, Check } from 'lucide-react';
import { authService } from '../../features/auth/authService';
import { ProfileModal } from '../ProfileModal';
import { TransactionModal } from '../TransactionModal';
import { CreateSharedModal } from '../CreateSharedModal';
import { JoinSharedModal } from '../JoinSharedModal';
import { SharedSavingsListModal } from '../SharedSavingsListModal';
import { NotificationsHistoryModal } from '../NotificationsHistoryModal';
import type { User } from '../../types/auth';
import toast from 'react-hot-toast';

// Importaciones para Notificaciones
import { notificationService } from '../../features/notifications/notificationService';
import type { AppNotification } from '../../types/notifications';

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
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Estado para el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- ESTADOS PARA NOTIFICACIONES ---
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar notificaciones
  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error al cargar notificaciones', error);
    }
  };

  // Cargar al inicio y consultar cada 30 segundos (Polling básico)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Cerrar el dropdown si haces clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Marcar como leída
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      // Actualizar el estado local para que se vea reflejado al instante
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('No se pudo marcar como leída');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadNotifications = notifications.filter(n => !n.isRead);

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  // Función de ayuda para cerrar el menú móvil al ejecutar una acción
  const executeAndCloseMenu = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* SECCIÓN IZQUIERDA: Logo y Navegación Desktop */}
          <div className="flex items-center gap-4 sm:gap-8">
            
            {/* Botón Menú Móvil */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-slate-900 text-white rounded-xl">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-slate-900 hidden sm:block">
                SI
              </span>
            </Link>
            
            {/* Navegación Principal (Desktop) */}
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
            
            {/* Botones de Ahorro Compartido (Desktop) */}
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
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              title="Nueva Transacción"
            >
              <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Nueva</span>
            </button>

            {/* Notificaciones (Dropdown) */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                title="Notificaciones"
                className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white box-content animate-pulse"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-semibold text-slate-900 text-sm">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>
                  
                  <div className="max-h-[320px] overflow-y-auto">
                    {unreadNotifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                        <Check className="h-6 w-6 text-emerald-400" />
                        ¡Todo al día! No tienes notificaciones nuevas.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {unreadNotifications.map((notif) => (
                          <div key={notif._id} className="p-4 flex gap-3 transition-colors bg-slate-50/80 hover:bg-slate-50">
                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                              notif.type === 'success' ? 'bg-emerald-500' : 
                              notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                            }`}></div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{notif.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1.5 block">
                                {new Date(notif.createdAt).toLocaleDateString()} a las {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>

                            <button 
                              onClick={(e) => handleMarkAsRead(notif._id, e)}
                              className="shrink-0 p-1.5 h-fit text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                              title="Marcar como leída"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Botón inferior para abrir el Historial */}
                  <div className="border-t border-slate-100 bg-slate-50 p-2">
                    <button 
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        setIsHistoryModalOpen(true);
                      }}
                      className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
                    >
                      Ver historial completo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Racha (Desktop) */}
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

            {/* Botón Salir (Desktop) */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="hidden sm:flex p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* --- MENÚ MÓVIL DESPLEGABLE --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 bg-white px-4 py-3 space-y-3 absolute w-full shadow-xl">
            {/* Racha (Versión Móvil) */}
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200/60 text-amber-700 rounded-lg text-sm font-medium">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>Racha actual: {user?.streak ?? 0} días</span>
            </div>

            <nav className="flex flex-col gap-1">
              <Link 
                to="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard' 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Resumen
              </Link>
              <button 
                onClick={() => executeAndCloseMenu(() => setIsSavingsListOpen(true))}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Target className="h-4 w-4" />
                Mis Metas
              </button>

              <div className="h-px bg-slate-100 my-1"></div>
              
              <button 
                onClick={() => executeAndCloseMenu(() => setIsJoinSharedOpen(true))}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Search className="h-4 w-4" />
                Unirse a Meta
              </button>
              
              <button 
                onClick={() => executeAndCloseMenu(() => setIsCreateSharedOpen(true))}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors text-left cursor-pointer"
              >
                <Users className="h-4 w-4" />
                Crear Compartido
              </button>

              <div className="h-px bg-slate-100 my-1"></div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* --- MODALES --- */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onUserUpdated={onUserUpdated} />
      <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} onSuccess={() => { window.dispatchEvent(new Event('transaction-updated')); }} />
      <CreateSharedModal isOpen={isCreateSharedOpen} onClose={() => setIsCreateSharedOpen(false)} />
      <JoinSharedModal isOpen={isJoinSharedOpen} onClose={() => setIsJoinSharedOpen(false)} />
      <SharedSavingsListModal isOpen={isSavingsListOpen} onClose={() => setIsSavingsListOpen(false)} />
      <NotificationsHistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
};