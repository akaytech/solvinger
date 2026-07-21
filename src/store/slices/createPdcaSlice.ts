import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { syncProject } from '../useRoadmapStore';
import type { RoadmapState } from '../useRoadmapStore';

export type PdcaPhase = 'Plan' | 'Do' | 'Check' | 'Act';

export interface PdcaItem {
  id: string;
  phase: PdcaPhase;
  text: string;
  status: 'pending' | 'completed';
  createdAt: number;
}

export interface PdcaCycle {
  id: string;
  goal: string;
  items: PdcaItem[];
  createdAt: number;
}

export interface PdcaSlice {
  pdca: PdcaCycle[];
  addPdcaCycle: (goal: string) => void;
  updatePdcaGoal: (id: string, goal: string) => void;
  deletePdcaCycle: (id: string) => void;
  addPdcaItem: (cycleId: string, phase: PdcaPhase, text: string) => void;
  updatePdcaItem: (cycleId: string, itemId: string, text: string) => void;
  deletePdcaItem: (cycleId: string, itemId: string) => void;
  togglePdcaItemStatus: (cycleId: string, itemId: string) => void;
}

export const createPdcaSlice: StateCreator<
  RoadmapState,
  [],
  [],
  PdcaSlice
> = (set, get) => ({
  pdca: [],
  addPdcaCycle: (goal) => {
    const newItem: PdcaCycle = {
      id: uuidv4(),
      goal,
      items: [],
      createdAt: Date.now(),
    };
    const newPdca = [newItem, ...get().pdca];
    set({ pdca: newPdca, ...syncProject({ ...get(), pdca: newPdca }) });
  },
  updatePdcaGoal: (id, goal) => {
    const newPdca = get().pdca.map(p => p.id === id ? { ...p, goal } : p);
    set({ pdca: newPdca, ...syncProject({ ...get(), pdca: newPdca }) });
  },
  deletePdcaCycle: (id) => {
    const newPdca = get().pdca.filter(p => p.id !== id);
    set({ pdca: newPdca, ...syncProject({ ...get(), pdca: newPdca }) });
  },
  addPdcaItem: (cycleId, phase, text) => {
    const newItem: PdcaItem = {
      id: uuidv4(),
      phase,
      text,
      status: 'pending',
      createdAt: Date.now(),
    };
    const newPdca = get().pdca.map(cycle => 
      cycle.id === cycleId 
        ? { ...cycle, items: [...cycle.items, newItem] } 
        : cycle
    );
    set({ pdca: newPdca, ...syncProject({ ...get(), pdca: newPdca }) });
  },
  updatePdcaItem: (cycleId, itemId, text) => {
    const newPdca = get().pdca.map(cycle => 
      cycle.id === cycleId 
        ? { ...cycle, items: cycle.items.map(item => item.id === itemId ? { ...item, text } : item) } 
        : cycle
    );
    set({ pdca: newPdca, ...syncProject({ ...get(), pdca: newPdca }) });
  },
  deletePdcaItem: (cycleId, itemId) => {
    const newPdca = get().pdca.map(cycle => 
      cycle.id === cycleId 
        ? { ...cycle, items: cycle.items.filter(item => item.id !== itemId) } 
        : cycle
    );
    set({ pdca: newPdca, ...syncProject({ ...get(), pdca: newPdca }) });
  },
  togglePdcaItemStatus: (cycleId, itemId) => {
    const newPdca = get().pdca.map(cycle => 
      cycle.id === cycleId 
        ? { ...cycle, items: cycle.items.map(item => item.id === itemId ? { ...item, status: (item.status === 'pending' ? 'completed' : 'pending') as 'pending' | 'completed' } : item) } 
        : cycle
    );
    set({ pdca: newPdca, ...syncProject({ ...get(), pdca: newPdca }) });
  },
});
