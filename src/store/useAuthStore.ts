import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  user: { uid: string; email: string; name: string; photoURL?: string } | null;
  isAuthLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  login: (uid: string, email: string, name: string, photoURL?: string) => void;
  logout: () => void;
  setAuthModalOpen: (isOpen: boolean, mode?: 'login' | 'register') => void;
  setAuthLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthLoading: true,
      isAuthModalOpen: false,
      authModalMode: 'login',
      login: (uid, email, name, photoURL) => {
        set({ user: { uid, email, name, photoURL }, isAuthModalOpen: false, isAuthLoading: false });
      },
      logout: () => {
        set({ user: null, isAuthLoading: false });
      },
      setAuthModalOpen: (isOpen, mode) => {
        set({ isAuthModalOpen: isOpen, authModalMode: mode ?? 'login' });
      },
      setAuthLoading: (loading) => {
        set({ isAuthLoading: loading });
      }
    }),
    {
      name: 'solvinger-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthModalOpen: state.isAuthModalOpen, 
        authModalMode: state.authModalMode 
      })
    }
  )
);
