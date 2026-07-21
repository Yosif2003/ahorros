// src/components/SharedSavingsListModal.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. Importar useNavigate
import { X, Target, Users, Copy, ArrowRight } from 'lucide-react';
import { sharedSavingService } from '../features/sharedSavings/sharedSavingService';
import { authService } from '../features/auth/authService';
import type { SharedSaving } from '../types/sharedSavings';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SharedSavingsListModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [savings, setSavings] = useState<SharedSaving[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate(); // <-- 2. Hook de navegación
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (isOpen) {
      loadSavings();
    }
  }, [isOpen]);

  const loadSavings = async () => {
    try {
      setIsLoading(true);
      const data = await sharedSavingService.getMySavings();
      setSavings(data);
    } catch (error) {
      toast.error('Error al cargar tus metas compartidas');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success('Código copiado: ' + code);
  };

  const handleCardClick = (code: string) => {
    onClose();
    navigate(`/shared-savings/${code}`); // <-- 3. Redirección directa a la página
  };

  if (!isOpen) return null;

  const misMetas = savings.filter(s => s.creatorId._id === currentUser?.id);
  const metasUnidas = savings.filter(s => s.creatorId._id !== currentUser?.id);

  const renderSavingCard = (saving: SharedSaving) => {
    const progress = Math.min((saving.currentAmount / saving.goalAmount) * 100, 100);
    const isCompleted = saving.status === 'completed';

    return (
      <div 
        key={saving._id} 
        onClick={() => handleCardClick(saving.sharedCode)}
        className="group bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl p-4 transition-all cursor-pointer relative"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
              {saving.title}
            </h4>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Users className="h-3 w-3" /> Creado por {saving.creatorId.name}
            </p>
          </div>
          <div 
            onClick={(e) => copyCode(saving.sharedCode, e)}
            className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md text-xs font-mono font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            title="Copiar código"
          >
            {saving.sharedCode} <Copy className="h-3 w-3 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1 mt-3">
          <div className="flex justify-between text-xs font-medium">
            <span className={isCompleted ? 'text-emerald-600' : 'text-slate-700'}>
              ${saving.currentAmount.toFixed(2)}
            </span>
            <span className="text-slate-400">/ ${saving.goalAmount.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`${isCompleted ? 'bg-emerald-500' : 'bg-slate-900'} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-emerald-600">
          <span>Ver detalles y aportes</span>
          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" /> Mis Metas Compartidas
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500 animate-pulse">Cargando tus metas...</div>
          ) : savings.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
              Aún no tienes metas compartidas.<br/>¡Crea una o únete con un código!
            </div>
          ) : (
            <>
              {misMetas.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Creadas por mí</h3>
                  <div className="grid gap-3">
                    {misMetas.map(renderSavingCard)}
                  </div>
                </div>
              )}

              {metasUnidas.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">A las que me he unido</h3>
                  <div className="grid gap-3">
                    {metasUnidas.map(renderSavingCard)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};