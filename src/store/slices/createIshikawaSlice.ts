import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { syncProject } from '../useRoadmapStore';
import type { RoadmapState } from '../useRoadmapStore';

export type IshikawaCategory = 'Manpower' | 'Machine' | 'Material' | 'Method' | 'Measurement' | 'Milieu';

export interface IshikawaItem {
  id: string;
  category: IshikawaCategory;
  text: string;
  createdAt: number;
}

export interface IshikawaAnalysis {
  id: string;
  problemStatement: string;
  items: IshikawaItem[];
  createdAt: number;
}

export interface IshikawaSlice {
  ishikawa: IshikawaAnalysis[];
  addIshikawa: (problemStatement: string) => void;
  updateIshikawaProblem: (id: string, problemStatement: string) => void;
  deleteIshikawa: (id: string) => void;
  addIshikawaItem: (analysisId: string, category: IshikawaCategory, text: string) => void;
  updateIshikawaItem: (analysisId: string, itemId: string, text: string) => void;
  deleteIshikawaItem: (analysisId: string, itemId: string) => void;
}

export const createIshikawaSlice: StateCreator<
  RoadmapState,
  [],
  [],
  IshikawaSlice
> = (set, get) => ({
  ishikawa: [],
  addIshikawa: (problemStatement) => {
    const newItem: IshikawaAnalysis = {
      id: uuidv4(),
      problemStatement,
      items: [],
      createdAt: Date.now(),
    };
    const newIshikawa = [newItem, ...get().ishikawa];
    set({ ishikawa: newIshikawa, ...syncProject({ ...get(), ishikawa: newIshikawa }) });
  },
  updateIshikawaProblem: (id, problemStatement) => {
    const newIshikawa = get().ishikawa.map(i => i.id === id ? { ...i, problemStatement } : i);
    set({ ishikawa: newIshikawa, ...syncProject({ ...get(), ishikawa: newIshikawa }) });
  },
  deleteIshikawa: (id) => {
    const newIshikawa = get().ishikawa.filter(i => i.id !== id);
    set({ ishikawa: newIshikawa, ...syncProject({ ...get(), ishikawa: newIshikawa }) });
  },
  addIshikawaItem: (analysisId, category, text) => {
    const newItem: IshikawaItem = {
      id: uuidv4(),
      category,
      text,
      createdAt: Date.now(),
    };
    const newIshikawa = get().ishikawa.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, items: [...analysis.items, newItem] } 
        : analysis
    );
    set({ ishikawa: newIshikawa, ...syncProject({ ...get(), ishikawa: newIshikawa }) });
  },
  updateIshikawaItem: (analysisId, itemId, text) => {
    const newIshikawa = get().ishikawa.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, items: analysis.items.map(item => item.id === itemId ? { ...item, text } : item) } 
        : analysis
    );
    set({ ishikawa: newIshikawa, ...syncProject({ ...get(), ishikawa: newIshikawa }) });
  },
  deleteIshikawaItem: (analysisId, itemId) => {
    const newIshikawa = get().ishikawa.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, items: analysis.items.filter(item => item.id !== itemId) } 
        : analysis
    );
    set({ ishikawa: newIshikawa, ...syncProject({ ...get(), ishikawa: newIshikawa }) });
  },
});
