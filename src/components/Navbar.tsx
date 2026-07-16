import { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { ChevronRight, ChevronLeft, Folder, LogOut, User, Moon, Sun, Globe } from 'lucide-react';
import clsx from 'clsx';
import packageJson from '../../package.json';
import { useTranslation } from 'react-i18next';

export default function Navbar({ onOpenProjects }: { onOpenProjects: () => void }) {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { setCenter, getZoom } = useReactFlow();
  const { nodes, user, logout } = useRoadmapStore();
  
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLangMenu(false);
  };

  const focusRoot = () => {
    // Find a root node (prefer 'root' or first node)
    const rootNode = nodes.find((n) => n.id === 'root') || nodes[0];
    if (rootNode) {
      setCenter(rootNode.position.x + 220, rootNode.position.y + 55, { zoom: Math.max(getZoom(), 0.8), duration: 800 });
    }
  };

  return (
    <div
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
          "absolute top-8 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 z-10 text-slate-500 dark:text-slate-400 transition-all hover:scale-110 active:scale-95",
          isExpanded ? "-right-5" : "left-4"
        )}
      >
        {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>

      <div className={clsx("flex h-full flex-col w-64 overflow-hidden transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 pointer-events-none")}>
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

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col py-4 px-3 gap-2">
        <button
          onClick={onOpenProjects}
          title={t('my_projects')}
          className={clsx(
            "flex items-center gap-3 rounded-xl p-3 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400",
            !isExpanded && "justify-center"
          )}
        >
          <Folder size={20} className="shrink-0" />
          {isExpanded && <span className="font-bold whitespace-nowrap overflow-hidden">{t('my_projects')}</span>}
        </button>
      </div>

      {/* Settings Area (Theme & Lang) */}
      <div className="flex flex-col gap-2 px-3 py-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? t('light_mode') : t('dark_mode')}
          className={clsx(
            "flex items-center gap-3 rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
            !isExpanded && "justify-center"
          )}
        >
          {isDarkMode ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
          {isExpanded && <span className="text-sm font-bold truncate">{isDarkMode ? t('light_mode') : t('dark_mode')}</span>}
        </button>

        <div className="relative flex flex-col">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            title="Language"
            className={clsx(
              "flex items-center gap-3 rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
              !isExpanded && "justify-center"
            )}
          >
            <Globe size={20} className="shrink-0" />
            {isExpanded && <span className="text-sm font-bold truncate uppercase">{i18n.language}</span>}
          </button>
          
          {showLangMenu && isExpanded && (
            <div className="absolute bottom-10 left-full ml-2 w-32 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
              {['tr','en','es','fr','de','pt','ru','ar','zh','ja'].map(lng => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className="w-full text-left px-4 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 uppercase"
                >
                  {lng}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Profile Area */}
      {user && (
        <div className="border-t border-slate-100 dark:border-slate-800 p-3">
          <div className={clsx(
            "flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2 border border-slate-100 dark:border-slate-800",
            !isExpanded && "justify-center"
          )}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <User size={18} />
            </div>
            
            {isExpanded && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            )}
            
            {isExpanded && (
              <button
                onClick={logout}
                title={t('logout')}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors shrink-0"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
          {!isExpanded && (
            <button
              onClick={logout}
              title={t('logout')}
              className="mt-2 flex w-full justify-center p-2 text-slate-400 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      )}

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
