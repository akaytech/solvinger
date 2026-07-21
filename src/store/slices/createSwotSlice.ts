import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { RoadmapState } from '../useRoadmapStore';

export type SwotType = 'S' | 'W' | 'O' | 'T';

export interface SwotItem {
  id: string;
  type: SwotType;
  text: string;
  createdAt: number;
}

export interface SwotAnalysis {
  id: string;
  title: string;
  items: SwotItem[];
  createdAt: number;
}

export interface SwotSlice {
  swot: SwotAnalysis[];
  addSwot: (title: string) => void;
  updateSwotTitle: (id: string, title: string) => void;
  deleteSwot: (id: string) => void;
  addSwotItem: (analysisId: string, type: SwotType, text: string) => void;
  updateSwotItem: (analysisId: string, itemId: string, text: string) => void;
  deleteSwotItem: (analysisId: string, itemId: string) => void;
}

export const createSwotSlice: StateCreator<
  RoadmapState,
  [],
  [],
  SwotSlice
> = (set, get) => ({
  swot: [],
  addSwot: (title) => {
    const newItem: SwotAnalysis = {
      id: uuidv4(),
      title,
      items: [],
      createdAt: Date.now(),
    };
    const newSwot = [newItem, ...get().swot];
    set({ swot: newSwot });
  },
  updateSwotTitle: (id, title) => {
    const newSwot = get().swot.map(s => s.id === id ? { ...s, title } : s);
    set({ swot: newSwot });
  },
  deleteSwot: (id) => {
    const newSwot = get().swot.filter(s => s.id !== id);
    set({ swot: newSwot });
  },
  addSwotItem: (analysisId, type, text) => {
    const newItem: SwotItem = {
      id: uuidv4(),
      type,
      text,
      createdAt: Date.now(),
    };
    const newSwot = get().swot.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, items: [...analysis.items, newItem] } 
        : analysis
    );
    set({ swot: newSwot });
  },
  updateSwotItem: (analysisId, itemId, text) => {
    const newSwot = get().swot.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, items: analysis.items.map(i => i.id === itemId ? { ...i, text } : i) } 
        : analysis
    );
    set({ swot: newSwot });
  },
  deleteSwotItem: (analysisId, itemId) => {
    const newSwot = get().swot.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, items: analysis.items.filter(i => i.id !== itemId) } 
        : analysis
    );
    set({ swot: newSwot });
  },
});
