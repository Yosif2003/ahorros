// src/components/NotificationsHistoryModal.tsx
import React, { useState, useMemo } from 'react';
import { X, Calendar, Check, Info } from 'lucide-react';
import type { AppNotification } from '../types/notifications';
import { Bell } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string, e: React.MouseEvent) => void;
}

export const NotificationsHistoryModal: React.FC<Props> = ({ isOpen, onClose, notifications, onMarkAsRead }) => {
  const [filterDate, setFilterDate] = useState<string>('');

  // Filtrar y agrupar notificaciones por fecha
  const groupedNotifications = useMemo(() => {
    // 1. Filtrar por fecha exacta (si el usuario seleccionó una)
    const filtered = filterDate
      ? notifications.filter(n => new Date(n.createdAt).toISOString().split('T')[0] === filterDate)
      : notifications;

    // 2. Agrupar por texto de fecha (Ej. "jueves, 23 de julio de 2026")
    const groups: { [key: string]: AppNotification[] } = {};
    filtered.forEach(n => {
      const dateStr = new Date(n.createdAt).toLocaleDateString('es-ES', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(n);
    });

    return groups;
  }, [notifications, filterDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8 max-h-[85vh] flex flex-col animate-in zoom-in-95">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-500" /> Historial de Notificaciones
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0 flex items-center gap-3">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-white border border-slate-200 text-sm px-3 py-1.5 rounded-lg outline-none focus:border-slate-400 transition-colors"
          />
          {filterDate && (
            <button 
              onClick={() => setFilterDate('')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 whitespace-nowrap"
            >
              Ver todas
            </button>
          )}
        </div>

        {/* Lista Agrupada */}
        <div className="p-6 overflow-y-auto space-y-6">
          {Object.keys(groupedNotifications).length === 0 ? (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-2">
              <Info className="h-6 w-6" />
              <p className="text-sm">No hay notificaciones para esta fecha.</p>
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([dateLabel, notifs]) => (
              <div key={dateLabel}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 capitalize">{dateLabel}</h3>
                <div className="space-y-2">
                  {notifs.map(notif => (
                    <div key={notif._id} className={`p-3 rounded-xl border flex gap-3 transition-colors ${notif.isRead ? 'bg-white border-slate-100 opacity-75' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        notif.type === 'success' ? 'bg-emerald-500' : 
                        notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}></div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>

                      {!notif.isRead && (
                        <button 
                          onClick={(e) => onMarkAsRead(notif._id, e)}
                          className="shrink-0 p-1.5 h-fit text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Marcar como leída"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

