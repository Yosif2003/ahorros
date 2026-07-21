import React, { useState } from 'react';
import { X, Users, Copy, CheckCircle2 } from 'lucide-react';
import { sharedSavingService } from '../features/sharedSavings/sharedSavingService';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSharedModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const newSaving = await sharedSavingService.create(title, parseFloat(goalAmount));
      setGeneratedCode(newSaving.sharedCode);
      toast.success('Meta compartida creada');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast.success('Código copiado al portapapeles');
    }
  };

  const handleClose = () => {
    setTitle('');
    setGoalAmount('');
    setGeneratedCode(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" /> Crear Compartido
          </h2>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {generatedCode ? (
            <div className="text-center space-y-4 animate-in zoom-in-95">
              <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Tu código para invitar a otros es:</p>
                <div className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-2xl font-bold tracking-widest text-slate-900">{generatedCode}</span>
                  <button onClick={copyCode} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors">
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <button onClick={handleClose} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium mt-4">
                Entendido
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700">¿Para qué están ahorrando?</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1"
                  placeholder="Ej. Viaje a la playa"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Meta total ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1"
                  placeholder="10000"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 mt-4"
              >
                {isLoading ? 'Creando...' : 'Crear Meta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};