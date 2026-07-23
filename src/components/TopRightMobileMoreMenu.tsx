import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store/useUIStore';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import { MoreVertical, User, Folder, Link, Camera } from 'lucide-react';

export default function TopRightMobileMoreMenu() {
  const { t } = useTranslation();
  const { activeTopMenu, setActiveTopMenu, triggerShare, triggerExport } = useUIStore(useShallow((state) => ({
    activeTopMenu: state.activeTopMenu,
    setActiveTopMenu: state.setActiveTopMenu,
    triggerShare: state.triggerShare,
    triggerExport: state.triggerExport
  })));
  
  const activeTool = useRoadmapStore(state => state.activeTool);
  const isOpen = activeTopMenu === 'more';
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (useUIStore.getState().activeTopMenu === 'more') {
          useUIStore.getState().setActiveTopMenu(null);
        }
      }
    }
    const forceClose = () => {
      if (useUIStore.getState().activeTopMenu === 'more') {
        useUIStore.getState().setActiveTopMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, { capture: true });
    document.addEventListener("close-menus", forceClose);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, { capture: true });
      document.removeEventListener("close-menus", forceClose);
    };
  }, []);

  return (
    <div ref={menuRef} className="absolute top-4 end-4 z-[100] sm:hidden flex flex-col items-end">
      <button 
        onClick={(e) => {
           e.stopPropagation();
           setActiveTopMenu(isOpen ? null : 'more');
        }}
        aria-label={t('more_options', { defaultValue: 'More options' })}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:scale-105 transition-transform text-slate-600 dark:text-slate-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <MoreVertical size={20} className={isOpen ? 'text-indigo-500' : ''} />
      </button>

      <div 
        className={`absolute top-14 end-0 w-48 origin-top-right rtl:origin-top-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xl transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTopMenu('user')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <User size={18} className="text-slate-500" />
            {t('user', { defaultValue: 'My Account' })}
          </button>
          
          <button
            onClick={() => setActiveTopMenu('projects')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Folder size={18} className="text-slate-500" />
            {t('my_projects', { defaultValue: 'My Projects' })}
          </button>

          {activeTool && (
            <>
              <div className="my-1 h-px w-full bg-slate-100 dark:bg-slate-700" />
              
              <button
                onClick={() => { triggerShare(); setActiveTopMenu(null); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors"
              >
                <Link size={18} className="text-indigo-500" />
                {t('share', { defaultValue: 'Share' })}
              </button>

              <button
                onClick={() => { triggerExport(); setActiveTopMenu(null); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Camera size={18} className="text-slate-500" />
                {t('export_image', { defaultValue: 'Export' })}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
