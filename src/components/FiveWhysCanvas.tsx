import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { Plus, Trash2, ArrowDown, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FiveWhysCanvas() {
  const { t } = useTranslation();
  const { fiveWhys, addFiveWhys, updateFiveWhys, deleteFiveWhys } = useRoadmapStore();
  const [newProblem, setNewProblem] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblem.trim()) return;
    addFiveWhys(newProblem);
    setNewProblem('');
  };

  const updateWhy = (id: string, index: number, value: string) => {
    const analysis = fiveWhys.find(fw => fw.id === id);
    if (!analysis) return;
    
    const newWhys = [...analysis.whys];
    newWhys[index] = value;
    updateFiveWhys(id, { whys: newWhys });
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="flex-none p-6 pl-14 md:pl-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">{t('tool_5whys')}</h2>
        </div>
        <form onSubmit={handleAdd} className="flex max-w-3xl gap-4">
          <input
            type="text"
            value={newProblem}
            onChange={(e) => setNewProblem(e.target.value)}
            placeholder={t('whys_placeholder')}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!newProblem.trim()}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            <Plus size={20} />
            {t('whys_start')}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-5xl gap-6 overflow-x-auto pb-8 snap-x">
          {fiveWhys.map(analysis => (
            <div key={analysis.id} className="w-[400px] shrink-0 snap-center">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-xl overflow-hidden flex flex-col h-full">
                <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start gap-4">
                  <div>
                     <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">{t('whys_problem')}</div>
                     <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{analysis.problemStatement}</h3>
                  </div>
                  <button 
                    onClick={() => deleteFiveWhys(analysis.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                  {analysis.whys.map((why, index) => (
                    <div key={index} className="relative">
                      {index > 0 && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center text-slate-300 dark:text-slate-600">
                          <ArrowDown size={16} />
                        </div>
                      )}
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                          {index + 1}. {t('whys_why')}
                        </label>
                        <textarea
                          value={why}
                          onChange={(e) => updateWhy(analysis.id, index, e.target.value)}
                          placeholder={t('whys_why_placeholder')}
                          rows={2}
                          className="w-full resize-none bg-transparent outline-none text-slate-700 dark:text-slate-300 text-sm placeholder-slate-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 block">
                    {t('whys_root')}
                  </label>
                  <textarea
                    value={analysis.rootCause}
                    onChange={(e) => updateFiveWhys(analysis.id, { rootCause: e.target.value })}
                    placeholder={t('whys_root_placeholder')}
                    rows={3}
                    className="w-full rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-800 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100 transition-all"
                  />
                </div>

              </div>
            </div>
          ))}
          
          {fiveWhys.length === 0 && (
            <div className="w-full py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
              <Activity size={64} className="mb-4 opacity-50" />
              <p className="text-lg">Henüz bir 5 Neden analizi başlatmadınız.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
