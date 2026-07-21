// src/components/HistoryModal.tsx
import React, { useMemo } from 'react';
import { X, TrendingUp, TrendingDown, PiggyBank, Calendar } from 'lucide-react';
import type { Transaction, TransactionType } from '../types/transcations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType | null;
  transactions: Transaction[];
}

export const HistoryModal: React.FC<Props> = ({ isOpen, onClose, type, transactions }) => {
  if (!isOpen || !type) return null;

  // 1. Filtrar transacciones según el tipo seleccionado
  const filteredTxs = useMemo(() => {
    return transactions.filter((t) => t.type === type);
  }, [transactions, type]);

  // 2. Agrupar montos por mes (Ej: "2026-07")
  const monthlyData = useMemo(() => {
    const monthsMap: { [key: string]: { label: string; yearMonth: string; total: number; count: number } } = {};

    filteredTxs.forEach((tx) => {
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return;

      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });

      if (!monthsMap[yearMonth]) {
        monthsMap[yearMonth] = { label, yearMonth, total: 0, count: 0 };
      }
      monthsMap[yearMonth].total += tx.amount;
      monthsMap[yearMonth].count += 1;
    });

    // Ordenar cronológicamente
    return Object.values(monthsMap).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
  }, [filteredTxs]);

  const maxAmount = Math.max(...monthlyData.map((m) => m.total), 1);
  const totalAccumulated = filteredTxs.reduce((sum, t) => sum + t.amount, 0);

  // Configuración de estilo e íconos dinámicos
  const config = {
    income: {
      title: 'Historial de Ingresos',
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-600',
      barBg: 'bg-emerald-500',
      icon: TrendingUp,
    },
    expense: {
      title: 'Historial de Gastos',
      bgLight: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      barBg: 'bg-red-500',
      icon: TrendingDown,
    },
    saving: {
      title: 'Historial de Ahorros',
      bgLight: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      barBg: 'bg-blue-500',
      icon: PiggyBank,
    },
  }[type];

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${config.bgLight} ${config.text}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{config.title}</h2>
              <p className="text-xs text-slate-500">{filteredTxs.length} registros en total</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tarjeta Resumen */}
          <div className={`p-4 rounded-xl border ${config.border} ${config.bgLight} flex items-center justify-between`}>
            <div>
              <span className="text-xs font-medium text-slate-500">Acumulado Total</span>
              <p className={`text-2xl font-bold ${config.text}`}>${totalAccumulated.toFixed(2)}</p>
            </div>
            {monthlyData.length > 0 && (
              <div className="text-right">
                <span className="text-xs font-medium text-slate-500">Promedio Mensual</span>
                <p className="text-sm font-semibold text-slate-700">
                  ${(totalAccumulated / Math.max(monthlyData.length, 1)).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Gráfico de Evolución Mensual */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Evolución Mensual
            </h3>
            {monthlyData.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl text-xs text-slate-400 border border-dashed border-slate-200">
                No hay movimientos registrados para esta categoría.
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="h-36 flex items-end justify-between gap-2 pt-6">
                  {monthlyData.map((m) => {
                    const heightPercent = Math.max((m.total / maxAmount) * 100, 10);
                    return (
                      <div key={m.yearMonth} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip flotante */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-medium whitespace-nowrap shadow-lg pointer-events-none z-10">
                          ${m.total.toFixed(2)}
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[32px] ${config.barBg} rounded-t-md transition-all duration-500 group-hover:opacity-80`}
                        ></div>
                        <span className="text-[10px] text-slate-500 mt-2 font-medium capitalize truncate w-full text-center">
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Lista de Movimientos Filtrados */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Historial de Movimientos
            </h3>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {filteredTxs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Sin registros disponibles.</p>
              ) : (
                filteredTxs.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors">
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-medium text-slate-900 truncate capitalize">{tx.category}</p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                        {tx.name && <span className="truncate">· {tx.name}</span>}
                      </div>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${config.text}`}>
                      ${tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};