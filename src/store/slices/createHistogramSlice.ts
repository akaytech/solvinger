import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { RoadmapState } from '../useRoadmapStore';

export interface HistogramItem {
  id: string;
  category: string;
  frequency: number;
}

export interface HistogramProject {
  id: string;
  title: string;
  items: HistogramItem[];
  createdAt: number;
}

export interface HistogramSlice {
  histogram: HistogramProject[];
  addHistogramProject: (projectId: string, histogramId: string, title: string) => void;
  addHistogramItem: (projectId: string, histogramId: string, category: string, frequency: number) => void;
  updateHistogramItem: (projectId: string, histogramId: string, itemId: string, data: Partial<HistogramItem>) => void;
  deleteHistogramItem: (projectId: string, histogramId: string, itemId: string) => void;
  updateHistogramTitle: (projectId: string, histogramId: string, title: string) => void;
  deleteHistogramProject: (projectId: string, histogramId: string) => void;
}

export const createHistogramSlice: StateCreator<
  RoadmapState,
  [],
  [],
  HistogramSlice
> = (set) => ({
  histogram: [],
  addHistogramProject: (_projectId, histogramId, title) => {
    set((state) => {
      const newProj: HistogramProject = { id: histogramId, title, items: [], createdAt: Date.now() };
      const next = { ...state, histogram: [...state.histogram, newProj] };
      return { ...next };
    });
  },
  addHistogramItem: (_projectId, histogramId, category, frequency) => {
    set((state) => {
      const newItem: HistogramItem = { id: uuidv4(), category, frequency };
      const next = {
        ...state,
        histogram: state.histogram.map(h => h.id === histogramId ? { ...h, items: [...h.items, newItem] } : h)
      };
      return { ...next };
    });
  },
  updateHistogramItem: (_projectId, histogramId, itemId, data) => {
    set((state) => {
      const next = {
        ...state,
        histogram: state.histogram.map(h => 
          h.id === histogramId 
            ? { ...h, items: h.items.map(item => item.id === itemId ? { ...item, ...data } : item) } 
            : h
        )
      };
      return { ...next };
    });
  },
  deleteHistogramItem: (_projectId, histogramId, itemId) => {
    set((state) => {
      const next = {
        ...state,
        histogram: state.histogram.map(h => h.id === histogramId ? { ...h, items: h.items.filter(item => item.id !== itemId) } : h)
      };
      return { ...next };
    });
  },
  updateHistogramTitle: (_projectId, histogramId, title) => {
    set((state) => {
      const next = {
        ...state,
        histogram: state.histogram.map(h => h.id === histogramId ? { ...h, title } : h)
      };
      return { ...next };
    });
  },
  deleteHistogramProject: (_projectId, histogramId) => {
    set((state) => {
      const next = { ...state, histogram: state.histogram.filter(h => h.id !== histogramId) };
      return { ...next };
    });
  },
});
