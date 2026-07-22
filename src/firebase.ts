import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './firebaseCore';

if (typeof window !== 'undefined') {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Lcczl4tAAAAAIFtS_ZJ3s26SPSl6sCvNkRJDuZx'),
    isTokenAutoRefreshEnabled: true
  });
}

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
