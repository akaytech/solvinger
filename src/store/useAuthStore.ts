import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  user: { uid: string; email: string; name: string; photoURL?: string } | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  login: (uid: string, email: string, name: string, photoURL?: string) => void;
  logout: () => void;
  setAuthModalOpen: (isOpen: boolean, mode?: 'login' | 'register') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthModalOpen: false,
      authModalMode: 'login',
      login: (uid, email, name, photoURL) => {
        set({ user: { uid, email, name, photoURL }, isAuthModalOpen: false });
      },
      logout: () => {
        set({ user: null });
      },
      setAuthModalOpen: (isOpen, mode) => {
        set({ isAuthModalOpen: isOpen, authModalMode: mode ?? 'login' });
      }
    }),
    {
      name: 'solvinger-auth-storage'
    }
  )
);
