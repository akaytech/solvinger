import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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
