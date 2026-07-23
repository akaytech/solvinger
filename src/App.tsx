import React, { Suspense, useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import AuthModal from './components/AuthModal';
import { useAuthStore } from './store/useAuthStore';

const AuthenticatedApp = React.lazy(() => import('./AuthenticatedApp'));
const LandingPage = React.lazy(() => import('./components/LandingPage'));

function App() {
  const user = useAuthStore(state => state.user);
  const isAuthModalOpen = useAuthStore(state => state.isAuthModalOpen);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      <Toaster position="bottom-center" theme={theme} richColors />
      {isAuthModalOpen && <AuthModal />}
      
      {!user ? (
        <Suspense fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <LandingPage />
        </Suspense>
      ) : (
        <Suspense fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <AuthenticatedApp />
        </Suspense>
      )}
    </div>
  );
}

export default App;
