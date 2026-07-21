import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { syncProject } from '../useRoadmapStore';
import type { RoadmapState } from '../useRoadmapStore';

export type WaterfallPhase = 'Requirements' | 'High-Level Design' | 'Low-Level Design' | 'Implementation' | 'Verification' | 'Maintenance';

export interface WaterfallItem {
  id: string;
  phase: WaterfallPhase;
  text: string;
  createdAt: number;
}

export interface WaterfallProject {
  id: string;
  name: string;
  currentPhaseIndex: number;
  items: WaterfallItem[];
  createdAt: number;
}

export interface WaterfallSlice {
  waterfall: WaterfallProject[];
  addWaterfallProject: (name: string) => void;
  updateWaterfallProjectName: (id: string, name: string) => void;
  deleteWaterfallProject: (id: string) => void;
  addWaterfallItem: (projectId: string, phase: WaterfallPhase, text: string) => void;
  updateWaterfallItem: (projectId: string, itemId: string, text: string) => void;
  deleteWaterfallItem: (projectId: string, itemId: string) => void;
  advanceWaterfallPhase: (projectId: string) => void;
}

export const createWaterfallSlice: StateCreator<
  RoadmapState,
  [],
  [],
  WaterfallSlice
> = (set, get) => ({
  waterfall: [],
  addWaterfallProject: (name) => {
    const newItem: WaterfallProject = {
      id: uuidv4(),
      name,
      currentPhaseIndex: 0,
      items: [],
      createdAt: Date.now(),
    };
    const newWaterfall = [newItem, ...get().waterfall];
    set({ waterfall: newWaterfall, ...syncProject({ ...get(), waterfall: newWaterfall }) });
  },
  updateWaterfallProjectName: (id, name) => {
    const newWaterfall = get().waterfall.map(p => p.id === id ? { ...p, name } : p);
    set({ waterfall: newWaterfall, ...syncProject({ ...get(), waterfall: newWaterfall }) });
  },
  deleteWaterfallProject: (id) => {
    const newWaterfall = get().waterfall.filter(p => p.id !== id);
    set({ waterfall: newWaterfall, ...syncProject({ ...get(), waterfall: newWaterfall }) });
  },
  addWaterfallItem: (projectId, phase, text) => {
    const newItem: WaterfallItem = {
      id: uuidv4(),
      phase,
      text,
      createdAt: Date.now(),
    };
    const newWaterfall = get().waterfall.map(project => 
      project.id === projectId 
        ? { ...project, items: [...project.items, newItem] } 
        : project
    );
    set({ waterfall: newWaterfall, ...syncProject({ ...get(), waterfall: newWaterfall }) });
  },
  updateWaterfallItem: (projectId, itemId, text) => {
    const newWaterfall = get().waterfall.map(project => 
      project.id === projectId 
        ? { ...project, items: project.items.map(item => item.id === itemId ? { ...item, text } : item) } 
        : project
    );
    set({ waterfall: newWaterfall, ...syncProject({ ...get(), waterfall: newWaterfall }) });
  },
  deleteWaterfallItem: (projectId, itemId) => {
    const newWaterfall = get().waterfall.map(project => 
      project.id === projectId 
        ? { ...project, items: project.items.filter(item => item.id !== itemId) } 
        : project
    );
    set({ waterfall: newWaterfall, ...syncProject({ ...get(), waterfall: newWaterfall }) });
  },
  advanceWaterfallPhase: (projectId) => {
    const newWaterfall = get().waterfall.map(project => 
      project.id === projectId 
        ? { ...project, currentPhaseIndex: Math.min(5, project.currentPhaseIndex + 1) } 
        : project
    );
    set({ waterfall: newWaterfall, ...syncProject({ ...get(), waterfall: newWaterfall }) });
  },
});
