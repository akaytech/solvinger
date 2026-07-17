import { Network, Activity, Target, Fish, RefreshCcw, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';

export default function WelcomeScreen() {
  const { setActiveTool, projects, createProject } = useRoadmapStore();
  const { t } = useTranslation();

  const handleToolClick = (tool: any) => {
    if (projects.length === 0) {
      createProject(t('new_project'));
    }
    setActiveTool(tool);
  };

  return (
    <div className="flex h-full w-full flex-col items-center bg-slate-50 dark:bg-slate-900 p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl text-center my-auto py-8">

        <h1 className="mb-6 text-center text-4xl font-black text-slate-800 dark:text-slate-100 md:text-6xl">
          {t('ws_title')}
        </h1>
        <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-slate-600 dark:text-slate-400">
          {t('ws_subtitle')}
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => handleToolClick('wbs')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-indigo-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-indigo-500"
          >
            <Network size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-indigo-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">{t('tool_wbs')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('wbs_desc')}</p>
          </button>

          <button
            onClick={() => handleToolClick('5whys')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-emerald-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-emerald-500"
          >
            <Activity size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-emerald-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">{t('tool_5whys')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('whys_desc')}</p>
          </button>

          <button
            onClick={() => handleToolClick('swot')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-rose-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-rose-500"
          >
            <Target size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-rose-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">{t('tool_swot')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('swot_desc')}</p>
          </button>

          <button
            onClick={() => handleToolClick('ishikawa')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-cyan-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-cyan-500"
          >
            <Fish size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-cyan-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">{t('tool_ishikawa')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('ishi_desc')}</p>
          </button>

          <button
            onClick={() => handleToolClick('pdca')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-indigo-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-indigo-500"
          >
            <RefreshCcw size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-indigo-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">{t('tool_pdca')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('pdca_desc')}</p>
          </button>

          <button
            onClick={() => handleToolClick('waterfall')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-blue-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-blue-500"
          >
            <Layers size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-blue-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">{t('tool_waterfall')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('wf_desc')}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
