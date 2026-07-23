import { create } from 'zustand';

interface UIState {
  activeTopMenu: 'user' | 'projects' | 'more' | null;
  setActiveTopMenu: (menu: 'user' | 'projects' | 'more' | null) => void;
  triggerShare: () => void;
  setTriggerShare: (fn: () => void) => void;
  triggerExport: () => void;
  setTriggerExport: (fn: () => void) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTopMenu: null,
  setActiveTopMenu: (menu) => set({ activeTopMenu: menu }),
  triggerShare: () => {},
  setTriggerShare: (fn) => set({ triggerShare: fn }),
  triggerExport: () => {},
  setTriggerExport: (fn) => set({ triggerExport: fn }),
}));
