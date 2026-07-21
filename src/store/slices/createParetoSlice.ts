import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { syncProject } from '../useRoadmapStore';
import type { RoadmapState } from '../useRoadmapStore';

export interface ParetoItem {
  id: string;
  category: string;
  frequency: number;
}

export interface ParetoProject {
  id: string;
  title: string;
  items: ParetoItem[];
}

export interface ParetoSlice {
  pareto: ParetoProject[];
  addParetoProject: (projectId: string, paretoId: string, title: string) => void;
  addParetoItem: (projectId: string, paretoId: string, category: string, frequency: number) => void;
  updateParetoItem: (projectId: string, paretoId: string, itemId: string, data: Partial<ParetoItem>) => void;
  deleteParetoItem: (projectId: string, paretoId: string, itemId: string) => void;
  updateParetoTitle: (projectId: string, paretoId: string, title: string) => void;
  deleteParetoProject: (projectId: string, paretoId: string) => void;
}

export const createParetoSlice: StateCreator<
  RoadmapState,
  [],
  [],
  ParetoSlice
> = (set) => ({
  pareto: [],
  addParetoProject: (_projectId, paretoId, title) => {
    set((state) => {
      const newPareto: ParetoProject = { id: paretoId, title, items: [] };
      const next = { ...state, pareto: [...state.pareto, newPareto] };
      return { ...next, ...syncProject(next) };
    });
  },
  addParetoItem: (_projectId, paretoId, category, frequency) => {
    set((state) => {
      const newItem: ParetoItem = { id: uuidv4(), category, frequency };
      const next = {
        ...state,
        pareto: state.pareto.map(p => p.id === paretoId ? { ...p, items: [...p.items, newItem] } : p)
      };
      return { ...next, ...syncProject(next) };
    });
  },
  updateParetoItem: (_projectId, paretoId, itemId, data) => {
    set((state) => {
      const next = {
        ...state,
        pareto: state.pareto.map(p => 
          p.id === paretoId 
            ? { ...p, items: p.items.map(item => item.id === itemId ? { ...item, ...data } : item) } 
            : p
        )
      };
      return { ...next, ...syncProject(next) };
    });
  },
  deleteParetoItem: (_projectId, paretoId, itemId) => {
    set((state) => {
      const next = {
        ...state,
        pareto: state.pareto.map(p => p.id === paretoId ? { ...p, items: p.items.filter(item => item.id !== itemId) } : p)
      };
      return { ...next, ...syncProject(next) };
    });
  },
  updateParetoTitle: (_projectId, paretoId, title) => {
    set((state) => {
      const next = {
        ...state,
        pareto: state.pareto.map(p => p.id === paretoId ? { ...p, title } : p)
      };
      return { ...next, ...syncProject(next) };
    });
  },
  deleteParetoProject: (_projectId, paretoId) => {
    set((state) => {
      const next = { ...state, pareto: state.pareto.filter(p => p.id !== paretoId) };
      return { ...next, ...syncProject(next) };
    });
  },
});
