import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import type { SwotType } from '../store/useRoadmapStore';
import { Plus, Trash2, Shield, Target, Zap, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ToolHeader from './ToolHeader';

export default function SwotCanvas() {
  const { t } = useTranslation();

  const QUADRANTS: { type: SwotType; title: string; color: string; icon: any; bg: string; border: string }[] = [
    { type: 'S', title: t('swot_s'), color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-900/50', icon: Shield },
    { type: 'W', title: t('swot_w'), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-900/50', icon: AlertTriangle },
    { type: 'O', title: t('swot_o'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900/50', icon: Zap },
    { type: 'T', title: t('swot_t'), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-900/50', icon: Target },
  ];

  const {  swot, addSwot, updateSwotTitle, deleteSwot, addSwotItem, updateSwotItem, deleteSwotItem  } = useRoadmapStore(useShallow((state) => ({
      swot: state.swot,
      addSwot: state.addSwot,
      updateSwotTitle: state.updateSwotTitle,
      deleteSwot: state.deleteSwot,
      addSwotItem: state.addSwotItem,
      updateSwotItem: state.updateSwotItem,
      deleteSwotItem: state.deleteSwotItem
    })));
  const [newTitle, setNewTitle] = useState('');
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addSwot(newTitle);
    setNewTitle('');
  };

  const handleAddItem = (e: React.FormEvent, analysisId: string, type: SwotType) => {
    e.preventDefault();
    const key = `${analysisId}-${type}`;
    if (!inputs[key]?.trim()) return;
    addSwotItem(analysisId, type, inputs[key]);
    setInputs(prev => ({ ...prev, [key]: '' }));
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 transition-colors overflow-hidden">
      <ToolHeader title={t('tool_swot')} subtitle={t('swot_subtitle')} icon={<Target />} iconColor="text-amber-500" dividerOnTop={true} />

      <div className="flex-1 overflow-auto p-6 md:p-8 space-y-12">
        {/* Create Form */}
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('swot_name_placeholder')}
              className="flex-1 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 text-lg outline-none focus:border-indigo-500 dark:focus:border-indigo-500 shadow-sm text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              <Plus size={24} />
              <span className="font-bold">{t('btn_create')}</span>
            </button>
          </form>
        </div>

        <div className="mx-auto max-w-7xl space-y-16">
        {swot.map((analysis: any) => {
          const isOldFormat = !analysis.items;
          const safeItems = isOldFormat ? (swot as any) : analysis.items;
          const safeTitle = isOldFormat ? t('default_swot_title') : analysis.title;
          const safeId = isOldFormat ? 'migrated-swot' : analysis.id;

          // If it's old format, we only want to render one "Varsayılan" analysis block for the whole array
          // so we skip rendering if this is not the first item in the old array.
          if (isOldFormat && analysis.id !== swot[0].id) return null;

          return (
          <div key={safeId} className="mx-auto max-w-6xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <input
                type="text"
                value={safeTitle}
                onChange={(e) => updateSwotTitle(safeId, e.target.value)}
                className="text-xl font-bold bg-transparent outline-none border-none text-slate-800 dark:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 px-2 py-1 rounded-lg transition-colors flex-1 mr-4"
              />
              <button
                onClick={() => deleteSwot(safeId)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                title={t('delete')}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[500px]">
              {QUADRANTS.map((quadrant) => {
                const Icon = quadrant.icon;
                const items = safeItems.filter((item: any) => item.type === quadrant.type);
                const inputKey = `${safeId}-${quadrant.type}`;

                return (
                  <div key={quadrant.type} className={`flex flex-col rounded-3xl border-2 ${quadrant.border} ${quadrant.bg} shadow-sm overflow-hidden`}>
                    <div className="p-4 flex items-center gap-3 border-b border-white/20 dark:border-black/20 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                      <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${quadrant.color}`}>
                        <Icon size={24} />
                      </div>
                      <h3 className={`text-lg font-bold ${quadrant.color}`}>{quadrant.title}</h3>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[150px]">
                      {items.map((item: any) => (
                        <div key={item.id} className="group relative flex items-start gap-3 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                          <textarea
                            value={item.text}
                            onChange={(e) => updateSwotItem(safeId, item.id, e.target.value)}
                            className="flex-1 resize-none bg-transparent outline-none text-slate-700 dark:text-slate-200 text-sm"
                            rows={2}
                          />
                          <button
                            onClick={() => deleteSwotItem(safeId, item.id)}
                            className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {items.length === 0 && (
                        <div className="flex h-32 items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-medium opacity-50">
                          {t('swot_empty')}
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-white/20 dark:border-black/20">
                      <form onSubmit={(e) => handleAddItem(e, safeId, quadrant.type)} className="flex gap-2">
                        <input
                          type="text"
                          value={inputs[inputKey] || ''}
                          onChange={(e) => setInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
                          placeholder={t('swot_add')}
                          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-slate-400 dark:focus:border-slate-500 text-slate-800 dark:text-slate-100"
                        />
                        <button
                          type="submit"
                          disabled={!inputs[inputKey]?.trim()}
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
        )})}
        </div>

        {swot.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <Target size={64} className="mb-6 opacity-20" />
            <p className="text-lg mb-8">{t('swot_no_analysis')}</p>
            
            <div className="flex flex-col items-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-md text-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t('swot_example_heading')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {t('swot_example_hint')}
              </p>
              <button
                onClick={() => {
                  // We simulate addSwot but we need to do it via store.
                  // Since addSwot generates an ID internally, we can just call it, then find the newly created one.
                  // Wait, addSwot pushes to the array. We can just use the store's set function if we had access, 
                  // but we can just use the existing actions sequentially.
                  useRoadmapStore.getState().addSwot(t('swot_example_title'));

                  // Wait for state to update, then get the newest SWOT ID to add items.
                  setTimeout(() => {
                    const latestSwot = useRoadmapStore.getState().swot[0]; // because unshift is used, or push?
                    if (latestSwot) {
                      const sId = latestSwot.id;
                      const { addSwotItem } = useRoadmapStore.getState();
                      addSwotItem(sId, 'S', t('swot_example_s1'));
                      addSwotItem(sId, 'S', t('swot_example_s2'));
                      addSwotItem(sId, 'W', t('swot_example_w1'));
                      addSwotItem(sId, 'W', t('swot_example_w2'));
                      addSwotItem(sId, 'O', t('swot_example_o1'));
                      addSwotItem(sId, 'O', t('swot_example_o2'));
                      addSwotItem(sId, 'T', t('swot_example_t1'));
                      addSwotItem(sId, 'T', t('swot_example_t2'));
                    }
                  }, 50);
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-6 py-3 font-bold transition-all hover:bg-indigo-200 dark:hover:bg-indigo-900 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Zap size={20} />
                {t('load_example')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
