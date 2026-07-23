import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';
import { auth } from '../firebaseCore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import LegalModal from './LegalModal';

export default function AuthModal() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const authModalMode = useAuthStore(state => state.authModalMode);
  const [isLoginMode, setIsLoginMode] = useState(authModalMode !== 'register');
  const [error, setError] = useState('');
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  const { setAuthModalOpen } = useAuthStore(useShallow((state) => ({
      setAuthModalOpen: state.setAuthModalOpen
    })));

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAuthModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    
    // Auto-focus email input on mount
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      clearTimeout(timer);
    };
  }, [setAuthModalOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  // Not: Oturumu store'a yazmak artık firebaseCore'daki onAuthStateChanged
  // listener'ının işi. Burada sadece başarılı girişte modalı kapatıyoruz.
  
  const mapAuthError = (err: any) => {
    const code = err?.code;
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return t('auth_invalid_credential', { defaultValue: 'Invalid email or password' });
      case 'auth/email-already-in-use':
        return t('auth_email_in_use', { defaultValue: 'Email already in use' });
      case 'auth/weak-password':
        return t('auth_weak_password', { defaultValue: 'Password is too weak' });
      case 'auth/too-many-requests':
        return t('auth_too_many_requests', { defaultValue: 'Too many requests, try again later' });
      case 'auth/invalid-email':
        return t('auth_invalid_email', { defaultValue: 'Invalid email address' });
      case 'auth/popup-closed-by-user':
        return t('auth_popup_closed', { defaultValue: 'Sign-in popup was closed by the user' });
      case 'auth/popup-blocked-by-browser':
        return t('auth_popup_blocked', { defaultValue: 'Sign-in popup was blocked by the browser' });
      default:
        return t('auth_error_generic', { defaultValue: 'An error occurred during authentication' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error(t('enter_email_for_reset'));
      return;
    }
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(t('password_reset_sent'));
    } catch (err: any) {
      toast.error(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      // onAuthStateChanged halledecek
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // auth_legal_text çevirisi, __TERMS__/__PRIVACY__ yer tutuculu <button> etiketleri
  // içerir. Bunları tüm dillerde tıklanabilir gerçek butonlara dönüştürüyoruz.
  const renderLegalConsent = () => {
    const parts = t('auth_legal_text').split(/<button[^>]*onClick='(__TERMS__|__PRIVACY__)'[^>]*>(.*?)<\/button>/g);
    const nodes: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i += 3) {
      if (parts[i]) nodes.push(<span key={`t${i}`}>{parts[i]}</span>);
      const placeholder = parts[i + 1];
      const label = parts[i + 2];
      if (placeholder && label) {
        const target: 'terms' | 'privacy' = placeholder === '__TERMS__' ? 'terms' : 'privacy';
        nodes.push(
          <button
            key={`b${i}`}
            type="button"
            onClick={() => setLegalType(target)}
            className="font-bold hover:text-indigo-500 hover:underline"
          >
            {label}
          </button>
        );
      }
    }
    return nodes;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 md:p-8">
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onKeyDown={handleKeyDown}
        className="relative flex w-full max-w-6xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex-col md:flex-row h-auto md:h-[600px]"
      >
        
        {/* Close Button */}
        <button 
          onClick={() => setAuthModalOpen(false)}
          aria-label={t('close_modal', { defaultValue: 'Close' })}
          className="absolute top-4 end-4 z-10 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
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
          <div className="mb-8 text-center md:text-start">
            <h2 id="auth-modal-title" className="text-2xl font-black text-slate-800 dark:text-slate-100">Solvinger</h2>
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
                ref={emailInputRef}
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 pe-12 text-sm outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('hide_password') : t('show_password')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {isLoginMode && (
                <div className="mt-2 text-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {t('forgot_password')}
                  </button>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 dark:bg-slate-100 px-4 py-3 font-bold text-white dark:text-slate-900 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
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
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin text-slate-500" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
            )}
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

          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            {renderLegalConsent()}
          </p>
        </div>
      </div>

      <LegalModal 
        isOpen={legalType !== null} 
        onClose={() => setLegalType(null)} 
        type={legalType || 'privacy'} 
      />
    </div>
  );
}
