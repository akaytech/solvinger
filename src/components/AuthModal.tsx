import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function AuthModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  
  const { login, fetchProjects, createProject, loadProject } = useRoadmapStore();

  const handleSuccess = async (user: any) => {
    login(user.uid, user.email || '', user.displayName || 'Kullanıcı');
    await fetchProjects(user.uid);
    
    // Auto-create or load after fetching projects
    const currentProjects = useRoadmapStore.getState().projects;
    if (currentProjects.length === 0) {
      createProject('İlk Projem');
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
      setError(err.message || 'Bir hata oluştu.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await handleSuccess(cred.user);
    } catch (err: any) {
      setError(err.message || 'Google ile giriş başarısız oldu.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-auto px-6 items-center justify-center rounded-2xl bg-[#ff6666] shadow-lg shadow-[#ff6666]/30 inline-flex">
            <span className="text-xl font-black tracking-widest text-white">SOLVINGER</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">Solvinger'a Hoş Geldin</h2>
          <p className="mt-2 text-sm text-slate-500">Projelerini buluta kaydetmek için giriş yap.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">E-mail Adresi</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@sirket.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Şifre</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          
          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-slate-800 px-4 py-3 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-xs font-semibold uppercase text-slate-400">veya</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
          Google ile Devam Et
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isLoginMode ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
          <button 
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="font-bold text-indigo-600 hover:underline"
          >
            {isLoginMode ? 'Hemen Kayıt Ol' : 'Giriş Yap'}
          </button>
        </p>
      </div>
    </div>
  );
}
