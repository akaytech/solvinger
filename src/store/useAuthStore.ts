import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  user: { uid: string; email: string; name: string; photoURL?: string } | null;
  isAuthModalOpen: boolean;
  login: (uid: string, email: string, name: string, photoURL?: string) => void;
  logout: () => void;
  setAuthModalOpen: (isOpen: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthModalOpen: false,
      login: (uid, email, name, photoURL) => {
        set({ user: { uid, email, name, photoURL }, isAuthModalOpen: false });
      },
      logout: () => {
        set({ user: null });
      },
      setAuthModalOpen: (isOpen) => {
        set({ isAuthModalOpen: isOpen });
      }
    }),
    {
      name: 'solvinger-auth-storage'
    }
  )
);
