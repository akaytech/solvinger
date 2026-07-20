import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

export default function AuthModal() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  
  const {  login, fetchProjects, createProject, loadProject  } = useRoadmapStore(useShallow((state) => ({
      login: state.login,
      fetchProjects: state.fetchProjects,
      createProject: state.createProject,
      loadProject: state.loadProject
    })));

  const handleSuccess = async (user: any) => {
    login(user.uid, user.email || '', user.displayName || t('default_user'), user.photoURL);
    await fetchProjects(user.uid);
    
    // Auto-create or load after fetching projects
    const currentProjects = useRoadmapStore.getState().projects;
    if (currentProjects.length === 0) {
      createProject(t('first_project'));
    } else {
      loadProject(currentProjects[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLoginMode) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await handleSuccess(cred.user);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await handleSuccess(cred.user);
      }
    } catch (err: any) {
      setError(err.message || t('auth_error_generic'));
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await handleSuccess(cred.user);
    } catch (err: any) {
      setError(err.message || t('auth_error_google'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 md:p-8">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex-col md:flex-row h-auto md:h-[600px]">
        
        {/* Left Side (2/3) - Promotional Content */}
        <div className="hidden md:flex flex-col justify-between w-2/3 bg-slate-50 dark:bg-slate-800 p-12 border-r border-slate-200 dark:border-slate-700">
          <div>
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Solvinger Logo" className="h-20 w-20 rounded-2xl shadow-md mb-8" />
            <h1 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-slate-100 mb-6">{t('hero_title')}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              {t('hero_subtitle')}
            </p>
          </div>
          
          <div className="mt-8 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex gap-6">
             <div className="flex-1 flex items-center gap-4 border-r border-slate-200 dark:border-slate-700">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                   <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="pr-4">
                   <h3 className="font-bold text-slate-800 dark:text-slate-100">{t('auth_feature_1_title')}</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400">{t('auth_feature_1_desc')}</p>
                </div>
             </div>
             <div className="flex-1 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                   <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                   <h3 className="font-bold text-slate-800 dark:text-slate-100">{t('auth_feature_2_title')}</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400">{t('auth_feature_2_desc')}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side (1/3) - Form */}
        <div className="flex w-full md:w-1/3 flex-col justify-center p-8 lg:p-10 overflow-y-auto">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Solvinger</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('welcome_msg')}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@sirket.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('password')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            
            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-slate-800 dark:bg-slate-100 px-4 py-3 font-bold text-white dark:text-slate-900 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoginMode ? t('login') : t('register')}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">{t('or')}</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            {t('continue_google')}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLoginMode ? t('no_account') : t('have_account')}
            <button 
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isLoginMode ? t('register_now') : t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
