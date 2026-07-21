import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { syncProject } from '../useRoadmapStore';
import type { RoadmapState } from '../useRoadmapStore';

export interface FiveWhysAnalysis {
  id: string;
  problemStatement: string;
  whys: string[];
  rootCause: string;
  createdAt: number;
}

export interface FiveWhysSlice {
  fiveWhys: FiveWhysAnalysis[];
  addFiveWhys: (problemStatement: string) => void;
  updateFiveWhys: (id: string, data: Partial<FiveWhysAnalysis>) => void;
  deleteFiveWhys: (id: string) => void;
}

export const createFiveWhysSlice: StateCreator<
  RoadmapState,
  [],
  [],
  FiveWhysSlice
> = (set, get) => ({
  fiveWhys: [],
  addFiveWhys: (problemStatement) => {
    const newItem: FiveWhysAnalysis = {
      id: uuidv4(),
      problemStatement,
      whys: ['', '', '', '', ''],
      rootCause: '',
      createdAt: Date.now()
    };
    const newFiveWhys = [newItem, ...get().fiveWhys];
    set({ fiveWhys: newFiveWhys, ...syncProject({ ...get(), fiveWhys: newFiveWhys }) });
  },
  updateFiveWhys: (id, data) => {
    const newFiveWhys = get().fiveWhys.map(fw => fw.id === id ? { ...fw, ...data } : fw);
    set({ fiveWhys: newFiveWhys, ...syncProject({ ...get(), fiveWhys: newFiveWhys }) });
  },
  deleteFiveWhys: (id) => {
    const newFiveWhys = get().fiveWhys.filter(fw => fw.id !== id);
    set({ fiveWhys: newFiveWhys, ...syncProject({ ...get(), fiveWhys: newFiveWhys }) });
  }
});
