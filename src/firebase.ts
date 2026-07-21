import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyCIUiD3Pk3x6LE0YkPWg8caib_8XVakT90",
  authDomain: "probsolve-1f6eb.firebaseapp.com",
  projectId: "probsolve-1f6eb",
  storageBucket: "probsolve-1f6eb.firebasestorage.app",
  messagingSenderId: "949061584581",
  appId: "1:949061584581:web:52f9b84cb4bdf97e4612ac",
  measurementId: "G-YQLWFE5KLQ"
};

const app = initializeApp(firebaseConfig);

if (typeof window !== 'undefined') {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Lcczl4tAAAAAIFtS_ZJ3s26SPSl6sCvNkRJDuZx'),
    isTokenAutoRefreshEnabled: true
  });
}
export const auth = getAuth(app);
export const db = getFirestore(app);

export let analytics: Analytics | null = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(console.error);

export const logAppEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (e) {
      console.warn("Analytics blocked or failed");
    }
  }
};
