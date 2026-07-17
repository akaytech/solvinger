import { useState, useRef, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import packageJson from '../../package.json';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { setCenter, getZoom } = useReactFlow();
  const { nodes, activeTool, setActiveTool } = useRoadmapStore();
  const menuRef = useRef<HTMLDivElement>(null);

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

  const focusRoot = () => {
    // Find a root node (prefer 'root' or first node)
    const rootNode = nodes.find((n) => n.id === 'root') || nodes[0];
    if (rootNode) {
      setCenter(rootNode.position.x + 220, rootNode.position.y + 55, { zoom: Math.max(getZoom(), 0.8), duration: 800 });
    }
  };

  return (
    <div
      ref={menuRef}
      className={clsx(
        "relative flex h-full flex-col bg-white dark:bg-slate-900 transition-all duration-300 z-50",
        isExpanded ? "w-64 border-r border-slate-200 dark:border-slate-800" : "w-0 border-0"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className={clsx(
          "absolute top-8 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 z-10 text-slate-500 dark:text-slate-400 transition-all hover:scale-110 active:scale-95",
          isExpanded ? "-right-5" : "left-4"
        )}
      >
        {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>

      <div className={clsx("flex h-full flex-col w-64 transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 pointer-events-none")}>
      {/* Logo Area */}
      <div className="flex p-4 items-center justify-center">
        <button
          onClick={focusRoot}
          title={t('go_to_root')}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 transition-transform hover:scale-105 active:scale-95 overflow-hidden p-1"
        >
          <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Solvinger Logo" className="h-full w-full object-contain rounded-xl" />
        </button>
      </div>

      <div className="flex-1 flex flex-col py-4 px-3 gap-2">
        <div className="mb-2 px-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Araçlar</h3>
        </div>
        
        <button
          onClick={() => {
            setActiveTool('wbs');
            setIsExpanded(false);
          }}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
            activeTool === 'wbs' 
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" 
              : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
          </div>
          <span>İş Kırılım Yapısı</span>
        </button>

        <button
          onClick={() => {
            setActiveTool('5whys');
            setIsExpanded(false);
          }}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
            activeTool === '5whys' 
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
              : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <span>5 Neden Analizi</span>
        </button>

        <button
          onClick={() => {
            setActiveTool('swot');
            setIsExpanded(false);
          }}
          className={clsx(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
            activeTool === 'swot' 
              ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" 
              : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>
          </div>
          <span>SWOT Analizi</span>
        </button>
      </div>

      {/* Version Info */}
      <div className="py-3 text-center opacity-50">
        <span className={clsx("text-[10px] font-bold text-slate-400 dark:text-slate-500", !isExpanded && "text-[8px]")}>
          v{packageJson.version}
        </span>
      </div>
      </div>
    </div>
  );
}
