import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import type { SwotType } from '../store/useRoadmapStore';
import { Plus, Trash2, Shield, Target, Zap, AlertTriangle } from 'lucide-react';

const QUADRANTS: { type: SwotType; title: string; color: string; icon: any; bg: string; border: string }[] = [
  { type: 'S', title: 'Güçlü Yönler (Strengths)', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-900/50', icon: Shield },
  { type: 'W', title: 'Zayıf Yönler (Weaknesses)', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-900/50', icon: AlertTriangle },
  { type: 'O', title: 'Fırsatlar (Opportunities)', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900/50', icon: Zap },
  { type: 'T', title: 'Tehditler (Threats)', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-900/50', icon: Target },
];

export default function SwotCanvas() {
  const { swot, addSwotItem, updateSwotItem, deleteSwotItem } = useRoadmapStore();
  const [inputs, setInputs] = useState<Record<SwotType, string>>({ S: '', W: '', O: '', T: '' });

  const handleAdd = (e: React.FormEvent, type: SwotType) => {
    e.preventDefault();
    if (!inputs[type].trim()) return;
    addSwotItem(type, inputs[type]);
    setInputs(prev => ({ ...prev, [type]: '' }));
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 transition-colors overflow-hidden">
      <div className="flex-none p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">SWOT Analizi</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Projenizin stratejik avantaj ve dezavantajlarını haritalandırın.</p>
      </div>

      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[600px]">
          {QUADRANTS.map((quadrant) => {
            const Icon = quadrant.icon;
            const items = swot.filter(item => item.type === quadrant.type);

            return (
              <div key={quadrant.type} className={`flex flex-col rounded-3xl border-2 ${quadrant.border} ${quadrant.bg} shadow-sm overflow-hidden`}>
                <div className="p-4 flex items-center gap-3 border-b border-white/20 dark:border-black/20 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                  <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${quadrant.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className={`text-lg font-bold ${quadrant.color}`}>{quadrant.title}</h3>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="group relative flex items-start gap-3 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                      <textarea
                        value={item.text}
                        onChange={(e) => updateSwotItem(item.id, e.target.value)}
                        className="flex-1 resize-none bg-transparent outline-none text-slate-700 dark:text-slate-200 text-sm"
                        rows={2}
                      />
                      <button
                        onClick={() => deleteSwotItem(item.id)}
                        className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="flex h-32 items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-medium opacity-50">
                      Henüz madde eklenmedi
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-white/20 dark:border-black/20">
                  <form onSubmit={(e) => handleAdd(e, quadrant.type)} className="flex gap-2">
                    <input
                      type="text"
                      value={inputs[quadrant.type]}
                      onChange={(e) => setInputs(prev => ({ ...prev, [quadrant.type]: e.target.value }))}
                      placeholder="Yeni madde ekle..."
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={!inputs[quadrant.type].trim()}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 ${
                        quadrant.type === 'S' ? 'bg-indigo-500' :
                        quadrant.type === 'W' ? 'bg-rose-500' :
                        quadrant.type === 'O' ? 'bg-emerald-500' :
                        'bg-amber-500'
                      }`}
                    >
                      <Plus size={20} />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
