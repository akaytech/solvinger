import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { useAuthStore } from './store/useAuthStore';
import { toast } from 'sonner';
import i18n from './i18n';
const firebaseConfig = {
  apiKey: "AIzaSyCIUiD3Pk3x6LE0YkPWg8caib_8XVakT90",
  authDomain: "probsolve-1f6eb.firebaseapp.com",
  projectId: "probsolve-1f6eb",
  storageBucket: "probsolve-1f6eb.firebasestorage.app",
  messagingSenderId: "949061584581",
  appId: "1:949061584581:web:52f9b84cb4bdf97e4612ac",
  measurementId: "G-YQLWFE5KLQ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Firebase Auth'u tek gerçek kaynak (source of truth) yapar.
// localStorage'daki 'user' yalnızca ilk paint için optimistik önbellektir;
// otorite her zaman Firebase oturumudur. Token yenileme veya sunucu tarafı
// oturum iptali otomatik olarak store'a yansır.
let authListenerStarted = false;
export const initAuthListener = () => {
  if (authListenerStarted) return;
  authListenerStarted = true;

  getRedirectResult(auth).catch((err) => {
    console.error('Redirect sign-in error:', err);
    toast.error(i18n.t('auth_error_generic', { defaultValue: 'An error occurred during authentication' }), { id: 'redirect-auth-error' });
  });

  onAuthStateChanged(auth, (firebaseUser) => {
    const { login, logout, user: cachedUser } = useAuthStore.getState();
    if (firebaseUser) {
      login(
        firebaseUser.uid,
        firebaseUser.email || '',
        firebaseUser.displayName || cachedUser?.name || '',
        firebaseUser.photoURL || undefined
      );
    } else {
      logout();
    }
  });
};
