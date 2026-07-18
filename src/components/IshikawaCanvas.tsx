import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import type { IshikawaCategory } from '../store/useRoadmapStore';
import { Plus, Trash2, Fish, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function IshikawaCanvas() {
  const { t } = useTranslation();
  
  const CATEGORIES: { id: IshikawaCategory; title: string; color: string; bg: string; border: string; buttonBg: string }[] = [
    { id: 'Manpower', title: t('manpower'), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900/50', buttonBg: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'Machine', title: t('machine'), color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-900/50', buttonBg: 'bg-orange-500 hover:bg-orange-600' },
    { id: 'Material', title: t('material'), color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-900/50', buttonBg: 'bg-teal-500 hover:bg-teal-600' },
    { id: 'Method', title: t('method'), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-900/50', buttonBg: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'Measurement', title: t('measurement'), color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-900/50', buttonBg: 'bg-pink-500 hover:bg-pink-600' },
    { id: 'Milieu', title: t('milieu'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900/50', buttonBg: 'bg-emerald-500 hover:bg-emerald-600' },
  ];

  const { ishikawa, addIshikawa, updateIshikawaProblem, deleteIshikawa, addIshikawaItem, updateIshikawaItem, deleteIshikawaItem } = useRoadmapStore();
  const [newProblem, setNewProblem] = useState('');
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblem.trim()) return;
    addIshikawa(newProblem);
    setNewProblem('');
  };

  const handleAddItem = (e: React.FormEvent, analysisId: string, category: IshikawaCategory) => {
    e.preventDefault();
    const key = `${analysisId}-${category}`;
    const text = inputs[key];
    if (!text?.trim()) return;
    addIshikawaItem(analysisId, category, text);
    setInputs(prev => ({ ...prev, [key]: '' }));
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 transition-colors overflow-hidden">
      <div className="flex-none p-6 pl-16 md:pl-16 pr-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Fish className="text-cyan-500" />
            {t('ishi_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('ishi_subtitle')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 md:p-8 space-y-12">
        {/* Create Form */}
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newProblem}
              onChange={(e) => setNewProblem(e.target.value)}
              placeholder={t('ishi_placeholder')}
              className="flex-1 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 text-lg outline-none focus:border-cyan-500 dark:focus:border-cyan-500 shadow-sm text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!newProblem.trim()}
              className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-8 py-4 text-white shadow-sm transition-all hover:bg-cyan-700 active:scale-95 disabled:opacity-50"
            >
              <Plus size={24} />
              <span className="font-bold">{t('start')}</span>
            </button>
          </form>
        </div>

        {/* Analyses List */}
        <div className="mx-auto max-w-7xl space-y-16">
          {ishikawa.map((analysis) => (
            <div key={analysis.id} className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 md:p-10 shadow-xl">
              
              {/* Problem Head (The Fish Head) */}
              <div className="mb-12 flex items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 shadow-inner">
                    <Fish size={32} />
                  </div>
                  <input
                    type="text"
                    value={analysis.problemStatement}
                    onChange={(e) => updateIshikawaProblem(analysis.id, e.target.value)}
                    className="flex-1 bg-transparent text-3xl font-black text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-300"
                  />
                </div>
                <button
                  onClick={() => deleteIshikawa(analysis.id)}
                  className="flex shrink-0 items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 size={18} />
                  {t('delete')}
                </button>
              </div>

              {/* 6M Grid (The Bones) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                
                {/* Central Spine visual element (visible on large screens) */}
                <div className="hidden lg:block absolute top-1/2 left-0 w-full h-2 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full z-0 opacity-50"></div>

                {CATEGORIES.map((cat) => {
                  const items = analysis.items.filter(i => i.category === cat.id);
                  const inputKey = `${analysis.id}-${cat.id}`;
                  
                  return (
                    <div key={cat.id} className={`relative z-10 flex flex-col rounded-2xl border-2 ${cat.border} ${cat.bg} bg-opacity-50 backdrop-blur-md overflow-hidden shadow-sm`}>
                      <div className="p-4 border-b border-white/20 dark:border-black/20 bg-white/40 dark:bg-black/20 flex justify-between items-center">
                        <h4 className={`font-bold ${cat.color}`}>{cat.title}</h4>
                      </div>
                      
                      <div className="flex-1 p-4 space-y-3 min-h-[150px] max-h-[300px] overflow-y-auto">
                        {items.map(item => (
                          <div key={item.id} className="group relative flex items-start gap-2 rounded-xl bg-white dark:bg-slate-800 p-3 shadow-sm border border-slate-100 dark:border-slate-700">
                            <ArrowRight size={14} className={`mt-1 shrink-0 ${cat.color} opacity-50`} />
                            <textarea
                              value={item.text}
                              onChange={(e) => updateIshikawaItem(analysis.id, item.id, e.target.value)}
                              className="flex-1 resize-none bg-transparent outline-none text-slate-700 dark:text-slate-200 text-sm"
                              rows={2}
                            />
                            <button
                              onClick={() => deleteIshikawaItem(analysis.id, item.id)}
                              className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-white/40 dark:bg-black/20 border-t border-white/20 dark:border-black/20">
                        <form onSubmit={(e) => handleAddItem(e, analysis.id, cat.id)} className="flex gap-2">
                          <input
                            type="text"
                            value={inputs[inputKey] || ''}
                            onChange={(e) => setInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
                            placeholder={t('ishi_add_reason')}
                            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm outline-none focus:border-slate-400 text-slate-800 dark:text-slate-100"
                          />
                          <button
                            type="submit"
                            disabled={!inputs[inputKey]?.trim()}
                            className={`flex w-8 items-center justify-center rounded-lg text-white shadow-sm disabled:opacity-50 transition-colors ${cat.buttonBg}`}
                          >
                            <Plus size={16} />
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
          
          {ishikawa.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <Fish size={64} className="mb-4 opacity-20" />
              <p className="text-lg">{t('ishi_empty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
