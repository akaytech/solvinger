import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { RoadmapState } from '../useRoadmapStore';

export interface DecisionCriteria {
  id: string;
  name: string;
  weight: number;
}

export interface DecisionOption {
  id: string;
  name: string;
  scores: Record<string, number>;
}

export interface DecisionMatrixProject {
  id: string;
  name: string;
  criteria: DecisionCriteria[];
  options: DecisionOption[];
  createdAt: number;
}

export interface DecisionSlice {
  decision: DecisionMatrixProject[];
  addDecisionProject: (name: string) => void;
  updateDecisionProjectName: (id: string, name: string) => void;
  deleteDecisionProject: (id: string) => void;
  addDecisionCriteria: (projectId: string, name: string, weight: number) => void;
  updateDecisionCriteria: (projectId: string, criteriaId: string, name: string, weight: number) => void;
  deleteDecisionCriteria: (projectId: string, criteriaId: string) => void;
  addDecisionOption: (projectId: string, name: string) => void;
  updateDecisionOptionName: (projectId: string, optionId: string, name: string) => void;
  deleteDecisionOption: (projectId: string, optionId: string) => void;
  updateDecisionScore: (projectId: string, optionId: string, criteriaId: string, score: number) => void;
}

export const createDecisionSlice: StateCreator<
  RoadmapState,
  [],
  [],
  DecisionSlice
> = (set, get) => ({
  decision: [],
  addDecisionProject: (name) => {
    const newItem: DecisionMatrixProject = {
      id: uuidv4(),
      name,
      criteria: [],
      options: [],
      createdAt: Date.now(),
    };
    const newDecision = [...(get().decision || []), newItem];
    set({ decision: newDecision });
  },
  updateDecisionProjectName: (id, name) => {
    const newDecision = (get().decision || []).map(d => d.id === id ? { ...d, name } : d);
    set({ decision: newDecision });
  },
  deleteDecisionProject: (id) => {
    const newDecision = (get().decision || []).filter(d => d.id !== id);
    set({ decision: newDecision });
  },
  addDecisionCriteria: (projectId, name, weight) => {
    const newDecision = (get().decision || []).map(d => 
      d.id === projectId 
        ? { ...d, criteria: [...d.criteria, { id: uuidv4(), name, weight }] }
        : d
    );
    set({ decision: newDecision });
  },
  updateDecisionCriteria: (projectId, criteriaId, name, weight) => {
    const newDecision = (get().decision || []).map(d => 
      d.id === projectId 
        ? { ...d, criteria: d.criteria.map(c => c.id === criteriaId ? { ...c, name, weight } : c) }
        : d
    );
    set({ decision: newDecision });
  },
  deleteDecisionCriteria: (projectId, criteriaId) => {
    const newDecision = (get().decision || []).map(d => 
      d.id === projectId 
        ? { 
            ...d, 
            criteria: d.criteria.filter(c => c.id !== criteriaId),
            options: d.options.map(opt => {
              const newScores = { ...opt.scores };
              delete newScores[criteriaId];
              return { ...opt, scores: newScores };
            })
          }
        : d
    );
    set({ decision: newDecision });
  },
  addDecisionOption: (projectId, name) => {
    const newDecision = (get().decision || []).map(d => 
      d.id === projectId 
        ? { ...d, options: [...d.options, { id: uuidv4(), name, scores: {} }] }
        : d
    );
    set({ decision: newDecision });
  },
  updateDecisionOptionName: (projectId, optionId, name) => {
    const newDecision = (get().decision || []).map(d => 
      d.id === projectId 
        ? { ...d, options: d.options.map(o => o.id === optionId ? { ...o, name } : o) }
        : d
    );
    set({ decision: newDecision });
  },
  deleteDecisionOption: (projectId, optionId) => {
    const newDecision = (get().decision || []).map(d => 
      d.id === projectId 
        ? { ...d, options: d.options.filter(o => o.id !== optionId) }
        : d
    );
    set({ decision: newDecision });
  },
  updateDecisionScore: (projectId, optionId, criteriaId, score) => {
    const newDecision = (get().decision || []).map(d => 
      d.id === projectId 
        ? { 
            ...d, 
            options: d.options.map(o => 
              o.id === optionId 
                ? { ...o, scores: { ...o.scores, [criteriaId]: score } } 
                : o
            ) 
          }
        : d
    );
    set({ decision: newDecision });
  },
});
