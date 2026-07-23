import { useState, useRef, useEffect } from 'react';

import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import { ChevronRight, ChevronLeft, AlertOctagon, Scale, GitMerge, BarChart2, BarChart, FileText, ListTodo } from 'lucide-react';
import clsx from 'clsx';
import packageJson from '../../package.json';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const {  activeTool, setActiveTool, projects, createProject  } = useRoadmapStore(useShallow((state) => ({
      activeTool: state.activeTool,
      setActiveTool: state.setActiveTool,
      projects: state.projects,
      createProject: state.createProject
    })));
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToolClick = (tool: any) => {
    if (projects.length === 0) {
      createProject(t('new_project'), tool);
    }
    setActiveTool(tool);
    setIsExpanded(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    const forceClose = () => setIsExpanded(false);
    
    document.addEventListener("mousedown", handleClickOutside, { capture: true });
    document.addEventListener("close-menus", forceClose);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, { capture: true });
      document.removeEventListener("close-menus", forceClose);
    };
  }, []);



  return (
    <div
      ref={menuRef}
      className={clsx(
        "relative flex h-full flex-col bg-white dark:bg-slate-900 transition-all duration-300 z-50",
        isExpanded ? "w-72 border-e border-slate-200 dark:border-slate-800" : "w-0 border-0"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        aria-label={t(isExpanded ? 'collapse_sidebar' : 'expand_sidebar', { defaultValue: 'Toggle sidebar' })}
        aria-expanded={isExpanded}
        className={clsx(
          "absolute top-1/2 -translate-y-1/2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 z-10 text-slate-500 dark:text-slate-400 transition-all hover:scale-110 active:scale-95 rtl:rotate-180",
          isExpanded ? "-end-5" : "start-4"
        )}
      >
        {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>

      <div className={clsx("flex h-full flex-col w-72 transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 pointer-events-none")}>
      {/* Logo Area */}
      <div className="flex p-4 items-center justify-center shrink-0">
        <button
          onClick={() => {
            setActiveTool(null);
            setIsExpanded(false);
          }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 transition-transform hover:scale-105 active:scale-95 overflow-hidden p-1"
        >
          <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Solvinger Logo" className="h-full w-full object-contain rounded-xl" />
        </button>
      </div>

            <div className="flex-1 flex flex-col py-2 px-3 gap-1 overflow-y-auto custom-scrollbar">
        
        {/* Kategori 1: Kök Neden Analizi */}
        <div className="mt-2 mb-1 px-3 shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('cat_root_cause')}</h3>
        </div>
        
        <button
          onClick={() => handleToolClick('5whys')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === '5whys' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <span>{t('tool_5whys')}</span>
        </button>

        <button
          onClick={() => handleToolClick('ishikawa')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'ishikawa' ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16s5-1 6-4 4-4 9-4c2 0 4 1 4 1s-1.5 2-4 2c-3.5 0-6.5 2.5-9 6-1.5 2-4.5 2.5-4.5 2.5s1-3 1.5-5.5z"/><path d="M12 8v4"/><path d="M15 11v4"/><path d="M9 13v4"/></svg>
          </div>
          <span>{t('tool_ishikawa')}</span>
        </button>

        {/* Kategori 2: Veri ve İstatistiksel Analiz */}
        <div className="mt-4 mb-1 px-3 shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('cat_data_stats')}</h3>
        </div>

        <button
          onClick={() => handleToolClick('pareto')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'pareto' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
             <BarChart2 size={14} />
          </div>
          <span>{t('tool_pareto')}</span>
        </button>

        <button
          onClick={() => handleToolClick('histogram')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'histogram' ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
             <BarChart size={14} />
          </div>
          <span>{t('tool_histogram')}</span>
        </button>


        {/* Kategori 3: Strateji, Karar ve Risk Analizi */}
        <div className="mt-4 mb-1 px-3 shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('cat_strategy_decision_risk')}</h3>
        </div>

        <button
          onClick={() => handleToolClick('swot')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'swot' ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>
          </div>
          <span>{t('tool_swot')}</span>
        </button>

        <button
          onClick={() => handleToolClick('decision')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'decision' ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
             <Scale size={14} />
          </div>
          <span>{t('decision_title')}</span>
        </button>

        <button
          onClick={() => handleToolClick('fta')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'fta' ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
             <AlertOctagon size={14} />
          </div>
          <span>{t('fta_title')}</span>
        </button>


        {/* Kategori 4: Süreç ve Proje Yönetimi */}
        <div className="mt-4 mb-1 px-3 shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('cat_process_project')}</h3>
        </div>

        <button
          onClick={() => handleToolClick('wbs')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'wbs' ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
          </div>
          <span>{t('tool_wbs')}</span>
        </button>

        <button
          onClick={() => handleToolClick('pdca')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'pdca' ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
          </div>
          <span>{t('tool_pdca')}</span>
        </button>

        <button
          onClick={() => handleToolClick('waterfall')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'waterfall' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>
          </div>
          <span>{t('tool_waterfall')}</span>
        </button>

        <button
          onClick={() => handleToolClick('flowchart')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'flowchart' ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
             <GitMerge size={14} />
          </div>
          <span>{t('tool_flowchart')}</span>
        </button>


        {/* Kategori 5: Günlük Verimlilik ve Belgeleme */}
        <div className="mt-4 mb-1 px-3 shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('cat_productivity_docs')}</h3>
        </div>

        <button
          onClick={() => handleToolClick('eod')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'eod' ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
             <ListTodo size={14} />
          </div>
          <span>{t('tool_eod')}</span>
        </button>

        <button
          onClick={() => handleToolClick('notepad')}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors",
            activeTool === 'notepad' ? "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/50 dark:text-fuchsia-400">
             <FileText size={14} />
          </div>
          <span>{t('notepad_title')}</span>
        </button>

      </div>

      {/* Version Info */}
      <div className="py-3 text-center opacity-50 flex flex-col items-center shrink-0">
        <span className={clsx("font-bold text-slate-400 dark:text-slate-500", isExpanded ? "text-[10px]" : "text-[8px]")}>
          v{packageJson.version}
        </span>
        {isExpanded && (
          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 whitespace-nowrap px-2">
            {t('in_development')}
          </span>
        )}
      </div>
      </div>
    </div>
  );
}
