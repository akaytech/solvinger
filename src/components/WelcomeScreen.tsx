import { useEffect } from 'react';
import { Network, Activity, Target, Fish, RefreshCcw, Layers, AlertOctagon, Scale, GitMerge, BarChart2, BarChart, FileText, ListTodo } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import { logAppEvent } from '../firebase';

export default function WelcomeScreen() {
  const { setActiveTool, projects, createProject } = useRoadmapStore(useShallow((state) => ({
    setActiveTool: state.setActiveTool,
    projects: state.projects,
    createProject: state.createProject
  })));
  const { t } = useTranslation();

  useEffect(() => {
    logAppEvent('welcome_screen_viewed');
  }, []);

  const handleToolClick = (tool: any) => {
    logAppEvent('tool_selected', { tool });
    if (projects.length === 0) {
      createProject(t('new_project'), tool);
    }
    setActiveTool(tool);
  };

  const ToolCard = ({ id, icon: Icon, title, desc, color, bg, featured = false }: any) => (
    <button
      onClick={() => handleToolClick(id)}
      className={`group flex flex-col items-start rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:-translate-y-1 hover:shadow-xl dark:hover:border-${color.split('-')[1]}-500/50 hover:border-${color.split('-')[1]}-500/50 text-left ${featured ? 'p-8 md:p-10 shadow-sm' : 'p-6'}`}
    >
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${bg} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
        <Icon size={28} className={color} />
      </div>
      <h3 className={`font-bold text-slate-800 dark:text-slate-100 ${featured ? 'mb-3 text-2xl' : 'mb-2 text-lg'}`}>{title}</h3>
      <p className={`text-slate-500 dark:text-slate-400 ${featured ? 'text-base' : 'text-sm'}`}>{desc}</p>
    </button>
  );

  return (
    <div className="flex h-full w-full flex-col items-center bg-slate-50 dark:bg-slate-950 p-6 md:p-10 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-6xl pb-20">
        
        <header className="mb-12 mt-4">
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 md:text-5xl tracking-tight mb-4">
            Solvinger
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            {t('ws_subtitle')}
          </p>
        </header>

        {/* Featured / Recommended Tools */}
        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-indigo-500"></div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Önerilen Başlangıç Araçları</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <ToolCard 
              id="swot" icon={Target} title={t('tool_swot')} desc={t('swot_desc')} 
              color="text-rose-500" bg="bg-rose-100 dark:bg-rose-900/40" featured={true} 
            />
            <ToolCard 
              id="5whys" icon={Activity} title={t('tool_5whys')} desc={t('whys_desc')} 
              color="text-emerald-500" bg="bg-emerald-100 dark:bg-emerald-900/40" featured={true} 
            />
          </div>
        </section>

        {/* Categories */}
        <div className="space-y-12">
          
          <section>
            <h3 className="mb-6 text-xl font-bold text-slate-700 dark:text-slate-300">Kök Neden ve Problem Analizi</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ToolCard id="ishikawa" icon={Fish} title={t('tool_ishikawa')} desc={t('ishi_desc')} color="text-cyan-500" bg="bg-cyan-100 dark:bg-cyan-900/40" />
              <ToolCard id="wbs" icon={Network} title={t('tool_wbs')} desc={t('wbs_desc')} color="text-indigo-500" bg="bg-indigo-100 dark:bg-indigo-900/40" />
              <ToolCard id="fta" icon={AlertOctagon} title={t('fta_title')} desc={t('fta_desc')} color="text-rose-500" bg="bg-rose-100 dark:bg-rose-900/40" />
            </div>
          </section>

          <section>
            <h3 className="mb-6 text-xl font-bold text-slate-700 dark:text-slate-300">Strateji ve Karar Verme</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ToolCard id="decision" icon={Scale} title={t('decision_title')} desc={t('decision_desc')} color="text-violet-500" bg="bg-violet-100 dark:bg-violet-900/40" />
              <ToolCard id="pareto" icon={BarChart2} title={t('tool_pareto')} desc={t('pareto_desc')} color="text-blue-500" bg="bg-blue-100 dark:bg-blue-900/40" />
              <ToolCard id="histogram" icon={BarChart} title={t('tool_histogram')} desc={t('histogram_desc')} color="text-indigo-500" bg="bg-indigo-100 dark:bg-indigo-900/40" />
            </div>
          </section>

          <section>
            <h3 className="mb-6 text-xl font-bold text-slate-700 dark:text-slate-300">Süreç, Planlama ve Yardımcı Araçlar</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <ToolCard id="pdca" icon={RefreshCcw} title={t('tool_pdca')} desc={t('pdca_desc')} color="text-teal-500" bg="bg-teal-100 dark:bg-teal-900/40" />
              <ToolCard id="waterfall" icon={Layers} title={t('tool_waterfall')} desc={t('wf_desc')} color="text-blue-500" bg="bg-blue-100 dark:bg-blue-900/40" />
              <ToolCard id="flowchart" icon={GitMerge} title={t('tool_flowchart')} desc={t('flowchart_desc')} color="text-amber-500" bg="bg-amber-100 dark:bg-amber-900/40" />
              <ToolCard id="eod" icon={ListTodo} title={t('tool_eod')} desc={t('eod_desc')} color="text-orange-500" bg="bg-orange-100 dark:bg-orange-900/40" />
              <ToolCard id="notepad" icon={FileText} title={t('notepad_title')} desc={t('notepad_desc')} color="text-fuchsia-500" bg="bg-fuchsia-100 dark:bg-fuchsia-900/40" />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
