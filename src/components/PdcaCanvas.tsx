import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import type { PdcaPhase } from '../store/useRoadmapStore';
import { Plus, Trash2, RefreshCcw, CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export default function PdcaCanvas() {
  const { t } = useTranslation();

  const PHASES: { id: PdcaPhase; title: string; color: string; bg: string; border: string; desc: string }[] = [
    { id: 'Plan', title: t('plan'), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900/50', desc: t('plan_desc') },
    { id: 'Do', title: t('do'), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-900/50', desc: t('do_desc') },
    { id: 'Check', title: t('check'), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-900/50', desc: t('check_desc') },
    { id: 'Act', title: t('act'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900/50', desc: t('act_desc') },
  ];

  const { pdca, addPdcaCycle, updatePdcaGoal, deletePdcaCycle, addPdcaItem, updatePdcaItem, deletePdcaItem, togglePdcaItemStatus } = useRoadmapStore();
  const [newGoal, setNewGoal] = useState('');
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    addPdcaCycle(newGoal);
    setNewGoal('');
  };

  const handleAddItem = (e: React.FormEvent, cycleId: string, phase: PdcaPhase) => {
    e.preventDefault();
    const key = `${cycleId}-${phase}`;
    const text = inputs[key];
    if (!text?.trim()) return;
    addPdcaItem(cycleId, phase, text);
    setInputs(prev => ({ ...prev, [key]: '' }));
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 transition-colors overflow-hidden">
      <div className="flex-none p-6 pl-14 md:pl-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <RefreshCcw className="text-indigo-500" />
          {t('pdca_title')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('pdca_subtitle')}</p>
      </div>

      <div className="flex-1 overflow-auto p-6 md:p-8 space-y-12">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder={t('pdca_placeholder')}
              className="flex-1 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 text-lg outline-none focus:border-indigo-500 dark:focus:border-indigo-500 shadow-sm text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!newGoal.trim()}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              <Plus size={24} />
              <span className="font-bold">{t('start')}</span>
            </button>
          </form>
        </div>

        <div className="mx-auto max-w-6xl space-y-16">
          {pdca.map((cycle) => (
            <div key={cycle.id} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 md:p-8 shadow-xl">
              
              <div className="mb-8 flex items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-inner">
                    <RefreshCcw size={24} />
                  </div>
                  <input
                    type="text"
                    value={cycle.goal}
                    onChange={(e) => updatePdcaGoal(cycle.id, e.target.value)}
                    className="flex-1 bg-transparent text-2xl font-bold text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-300"
                  />
                </div>
                <button
                  onClick={() => deletePdcaCycle(cycle.id)}
                  className="flex shrink-0 items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 size={18} />
                  {t('delete')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {PHASES.map((phase) => {
                  const items = cycle.items.filter(i => i.phase === phase.id);
                  const inputKey = `${cycle.id}-${phase.id}`;
                  
                  return (
                    <div key={phase.id} className={`flex flex-col rounded-2xl border-2 ${phase.border} ${phase.bg} shadow-sm overflow-hidden`}>
                      <div className="p-4 flex flex-col border-b border-white/20 dark:border-black/20 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                        <h4 className={`text-lg font-bold ${phase.color}`}>{phase.title}</h4>
                        <span className={`text-xs opacity-70 ${phase.color}`}>{phase.desc}</span>
                      </div>
                      
                      <div className="flex-1 p-4 space-y-3 min-h-[200px] max-h-[350px] overflow-y-auto">
                        {items.map(item => (
                          <div key={item.id} className="group relative flex items-start gap-3 rounded-xl bg-white dark:bg-slate-800 p-3 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <button
                              onClick={() => togglePdcaItemStatus(cycle.id, item.id)}
                              className={clsx(
                                "mt-1 shrink-0 transition-colors",
                                item.status === 'completed' ? "text-emerald-500" : "text-slate-300 dark:text-slate-600 hover:text-slate-400"
                              )}
                            >
                              {item.status === 'completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>
                            <textarea
                              value={item.text}
                              onChange={(e) => updatePdcaItem(cycle.id, item.id, e.target.value)}
                              className={clsx(
                                "flex-1 resize-none bg-transparent outline-none text-sm transition-all",
                                item.status === 'completed' ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"
                              )}
                              rows={2}
                            />
                            <button
                              onClick={() => deletePdcaItem(cycle.id, item.id)}
                              className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 shadow-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-white/20 dark:border-black/20">
                        <form onSubmit={(e) => handleAddItem(e, cycle.id, phase.id)} className="flex gap-2">
                          <input
                            type="text"
                            value={inputs[inputKey] || ''}
                            onChange={(e) => setInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
                            placeholder={t('pdca_add_item')}
                            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-slate-400 text-slate-800 dark:text-slate-100"
                          />
                          <button
                            type="submit"
                            disabled={!inputs[inputKey]?.trim()}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 ${phase.color.replace('text-', 'bg-').split(' ')[0]}`}
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
          ))}
          
          {pdca.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <RefreshCcw size={64} className="mb-4 opacity-20" />
              <p className="text-lg">{t('pdca_empty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
