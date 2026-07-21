import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { syncProject } from '../useRoadmapStore';
import type { RoadmapState } from '../useRoadmapStore';

export type EodPriority = 'high' | 'medium' | 'low';

export interface EodTask {
  id: string;
  title: string;
  description: string;
  priority: EodPriority;
  isCompleted: boolean;
  createdAt: number;
}

export interface EodSlice {
  eod: EodTask[];
  addEodTask: (title: string, description: string, priority: EodPriority) => void;
  updateEodTask: (id: string, data: Partial<EodTask>) => void;
  deleteEodTask: (id: string) => void;
  toggleEodTask: (id: string) => void;
  reorderEodTasks: (startIndex: number, endIndex: number) => void;
}

export const createEodSlice: StateCreator<
  RoadmapState,
  [],
  [],
  EodSlice
> = (set, get) => ({
  eod: [],
  addEodTask: (title, description, priority) => {
    const newTask: EodTask = {
      id: uuidv4(),
      title,
      description,
      priority,
      isCompleted: false,
      createdAt: Date.now(),
    };
    const newEod = [...get().eod, newTask];
    set({ eod: newEod, ...syncProject({ ...get(), eod: newEod }) });
  },
  updateEodTask: (id, data) => {
    const newEod = get().eod.map((t) => (t.id === id ? { ...t, ...data } : t));
    set({ eod: newEod, ...syncProject({ ...get(), eod: newEod }) });
  },
  deleteEodTask: (id) => {
    const newEod = get().eod.filter((t) => t.id !== id);
    set({ eod: newEod, ...syncProject({ ...get(), eod: newEod }) });
  },
  toggleEodTask: (id) => {
    const newEod = get().eod.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    set({ eod: newEod, ...syncProject({ ...get(), eod: newEod }) });
  },
  reorderEodTasks: (startIndex, endIndex) => {
    const newEod = Array.from(get().eod);
    const [removed] = newEod.splice(startIndex, 1);
    newEod.splice(endIndex, 0, removed);
    set({ eod: newEod, ...syncProject({ ...get(), eod: newEod }) });
  }
});
