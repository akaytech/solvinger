import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useAuthStore } from '../store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';
import { LogOut, Sun, Moon, User, Shield, FileText } from 'lucide-react';
import LegalModal from './LegalModal';

export default function TopRightUserMenu() {
  const { t, i18n } = useTranslation();
  const { resetState } = useRoadmapStore(useShallow((state) => ({ resetState: state.resetState })));
  const {  user, logout  } = useAuthStore(useShallow((state) => ({
      user: state.user,
      logout: () => {
         state.logout();
         resetState();
      }
    })));
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    const forceClose = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside, { capture: true });
    document.addEventListener("close-menus", forceClose);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, { capture: true });
      document.removeEventListener("close-menus", forceClose);
    };
  }, []);

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
  };

  if (!user) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute top-4 right-4 z-[100]"
    >
      <button 
        onClick={(e) => {
           e.stopPropagation();
           setIsOpen(!isOpen);
        }}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:scale-105 transition-transform text-indigo-500 dark:text-indigo-400 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <User size={20} className="text-slate-600 dark:text-slate-300" />
        )}
      </button>

      <div 
        className={`absolute right-0 top-12 w-64 origin-top-right rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="mb-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
          <p className="truncate font-bold text-slate-800 dark:text-slate-100">{user.name || t('user')}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>

        <button
          onClick={toggleDarkMode}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          {isDarkMode ? t('light_mode') : t('dark_mode')}
        </button>

        <div className="mt-2 mb-2">
           <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">{t('language_selector')}</div>
           <div className="grid grid-cols-5 gap-2 px-3 mt-2">
             {[
               { code: 'zh', flag: 'cn' },
               { code: 'de', flag: 'de' },
               { code: 'es', flag: 'es' },
               { code: 'fr', flag: 'fr' },
               { code: 'en', flag: 'gb' },
               { code: 'ja', flag: 'jp' },
               { code: 'pt', flag: 'pt' },
               { code: 'ru', flag: 'ru' },
               { code: 'ar', flag: 'sa' },
               { code: 'tr', flag: 'tr' }
             ].map(({ code, flag }) => (
                <button
                  key={code}
                  onClick={() => changeLanguage(code)}
                  className={`flex h-8 w-10 items-center justify-center rounded-md transition-all ${i18n.language === code ? 'bg-indigo-100 dark:bg-indigo-900/50 scale-110 shadow-sm ring-2 ring-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700 opacity-60 hover:opacity-100'}`}
                  title={code.toUpperCase()}
                >
                  <img src={`https://flagcdn.com/w40/${flag}.png`} alt={code} className="h-5 w-7 object-cover rounded-sm shadow-sm" />
                </button>
             ))}
           </div>
        </div>

        <div className="my-2 h-px w-full bg-slate-100 dark:bg-slate-700" />
        
        <div className="mb-2">
           <button
             onClick={() => setLegalType('terms')}
             className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
           >
             <FileText size={18} />
             {t('terms_of_use_title') || 'Terms of Use'}
           </button>
           <button
             onClick={() => setLegalType('privacy')}
             className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
           >
             <Shield size={18} />
             {t('privacy_policy_title') || 'Privacy Policy'}
           </button>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <LogOut size={18} />
          {t('logout')}
        </button>
      </div>

      <LegalModal 
        isOpen={legalType !== null} 
        onClose={() => setLegalType(null)} 
        type={legalType || 'privacy'} 
      />
    </div>
  );
}
