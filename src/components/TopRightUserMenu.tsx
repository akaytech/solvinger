import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useAuthStore } from '../store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseCore';
import { LogOut, Sun, Moon, User, Shield, FileText, Languages, ChevronLeft, Check } from 'lucide-react';
import LegalModal from './LegalModal';

const SUPPORTED_LANGUAGES = [
  { code: 'tr', nativeName: 'Türkçe' },
  { code: 'en', nativeName: 'English' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'es', nativeName: 'Español' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'ja', nativeName: '日本語' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'ru', nativeName: 'Русский' },
  { code: 'ar', nativeName: 'العربية' },
  { code: 'zh', nativeName: '中文' },
];

export default function TopRightUserMenu() {
  const { t, i18n } = useTranslation();
  const { resetState } = useRoadmapStore(useShallow((state) => ({ resetState: state.resetState })));
  const user = useAuthStore((state) => state.user);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('signOut error:', err);
      useAuthStore.getState().logout();
    } finally {
      resetState();
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLanguagePicker(false);
      }
    }
    const forceClose = () => { setIsOpen(false); setShowLanguagePicker(false); };

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
    setShowLanguagePicker(false);
  };

  if (!user) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute top-4 end-4 sm:end-8 z-[100]"
    >
      <button 
        onClick={(e) => {
           e.stopPropagation();
           setIsOpen(!isOpen);
           if (isOpen) {
             setShowLanguagePicker(false);
           }
        }}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:scale-105 transition-transform text-indigo-500 dark:text-indigo-400 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.name || 'User'} className="h-full w-full rounded-full object-cover" />
        ) : (
          <User size={20} className="text-slate-600 dark:text-slate-300" />
        )}
      </button>

      <div 
        className={`absolute end-0 top-12 w-64 origin-top-right rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        {!showLanguagePicker ? (
          <>
            <div className="mb-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
              <p className="truncate font-bold text-slate-800 dark:text-slate-100">{user.name || t('user')}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>

            <button
              onClick={toggleDarkMode}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              {isDarkMode ? t('light_mode', { defaultValue: 'Light Mode' }) : t('dark_mode', { defaultValue: 'Dark Mode' })}
            </button>

            <button
              onClick={() => setShowLanguagePicker(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Languages size={18} />
              {t('change_language_settings', { defaultValue: 'Change Language Settings' })}
            </button>

            <div className="my-2 h-px w-full bg-slate-100 dark:bg-slate-700" />
            
            <div className="mb-2">
              <button
                onClick={() => setLegalType('terms')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <FileText size={18} />
                {t('terms_of_use_title', { defaultValue: 'Terms of Use' })}
              </button>
              <button
                onClick={() => setLegalType('privacy')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Shield size={18} />
                {t('privacy_policy_title', { defaultValue: 'Privacy Policy' })}
              </button>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut size={18} />
              {t('logout', { defaultValue: 'Logout' })}
            </button>
          </>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setShowLanguagePicker(false)}
                className="p-1 -ms-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <ChevronLeft size={18} className="rtl:rotate-180" />
              </button>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('language_selector', { defaultValue: 'Language' })}</span>
            </div>
            
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto px-1">
              {SUPPORTED_LANGUAGES.map(({ code, nativeName }) => {
                const isActive = i18n.language === code;
                return (
                  <button
                    key={code}
                    onClick={() => changeLanguage(code)}
                    className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{nativeName}</span>
                    {isActive && <Check size={16} className="text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <LegalModal 
        isOpen={legalType !== null} 
        onClose={() => setLegalType(null)} 
        type={legalType || 'privacy'} 
      />
    </div>
  );
}
