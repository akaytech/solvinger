import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import type { Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, deleteDoc, collection, query, where, onSnapshot, or, arrayUnion, arrayRemove, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import i18n from '../i18n';

export let isRemoteUpdate = false;

import { createWbsSlice, getDescendants, getDefaultNodes } from './slices/createWbsSlice';
import type { WbsSlice, GoalStatus, GoalNodeData, GoalNode } from './slices/createWbsSlice';
export type { GoalStatus, GoalNodeData, GoalNode };
export { getDescendants };

import { createEodSlice } from './slices/createEodSlice';
import type { EodSlice, EodTask } from './slices/createEodSlice';
export type { EodTask };

import { createNotepadSlice } from './slices/createNotepadSlice';
import type { NotepadSlice } from './slices/createNotepadSlice';
import { createFiveWhysSlice } from './slices/createFiveWhysSlice';
import type { FiveWhysSlice, FiveWhysNode, FiveWhysNodeType, FiveWhysNodeData } from './slices/createFiveWhysSlice';
export type { FiveWhysNode, FiveWhysNodeType, FiveWhysNodeData };

import { createSwotSlice } from './slices/createSwotSlice';
import type { SwotSlice, SwotType, SwotItem, SwotAnalysis } from './slices/createSwotSlice';
export type { SwotType, SwotItem, SwotAnalysis };

import { createIshikawaSlice } from './slices/createIshikawaSlice';
import type { IshikawaSlice, IshikawaCategory, IshikawaItem, IshikawaAnalysis } from './slices/createIshikawaSlice';
export type { IshikawaCategory, IshikawaItem, IshikawaAnalysis };

import { createPdcaSlice } from './slices/createPdcaSlice';
import type { PdcaSlice, PdcaPhase, PdcaItem, PdcaCycle } from './slices/createPdcaSlice';
export type { PdcaPhase, PdcaItem, PdcaCycle };

import { createWaterfallSlice } from './slices/createWaterfallSlice';
import type { WaterfallSlice, WaterfallPhase, WaterfallItem, WaterfallProject } from './slices/createWaterfallSlice';
export type { WaterfallPhase, WaterfallItem, WaterfallProject };

import { createFtaSlice } from './slices/createFtaSlice';
import type { FtaSlice, FtaNodeType, FtaNodeData, FtaNode } from './slices/createFtaSlice';
export type { FtaNodeType, FtaNodeData, FtaNode };

import { createFlowchartSlice } from './slices/createFlowchartSlice';
import type { FlowchartSlice, FlowchartNodeType, FlowchartNodeData, FlowchartNode } from './slices/createFlowchartSlice';
export type { FlowchartNodeType, FlowchartNodeData, FlowchartNode };

import { createParetoSlice } from './slices/createParetoSlice';
import type { ParetoSlice, ParetoItem, ParetoProject } from './slices/createParetoSlice';
export type { ParetoItem, ParetoProject };

import { createHistogramSlice } from './slices/createHistogramSlice';
import type { HistogramSlice, HistogramItem, HistogramProject } from './slices/createHistogramSlice';
export type { HistogramItem, HistogramProject };

import { createDecisionSlice } from './slices/createDecisionSlice';
import type { DecisionSlice, DecisionCriteria, DecisionOption, DecisionMatrixProject } from './slices/createDecisionSlice';
export type { DecisionCriteria, DecisionOption, DecisionMatrixProject };

export interface NotepadNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  nodes: GoalNode[];
  edges: Edge[];
  fiveWhysNodes?: FiveWhysNode[];
  fiveWhysEdges?: Edge[];
  swot: SwotAnalysis[];
  ishikawa: IshikawaAnalysis[];
  pdca: PdcaCycle[];
  waterfall: WaterfallProject[];
  pareto?: ParetoProject[];
  histogram?: HistogramProject[];
  notepad?: NotepadNote[];
  decision?: DecisionMatrixProject[];
  flowchartNodes?: FlowchartNode[];
  flowchartEdges?: Edge[];
  ftaNodes?: FtaNode[];
  ftaEdges?: Edge[];
  eod?: EodTask[];
    isPublic?: boolean;
  sharedWith?: string[];
  updatedAt: number;
  userId: string;
}

export interface RoadmapState extends EodSlice, NotepadSlice, FiveWhysSlice, SwotSlice, IshikawaSlice, PdcaSlice, WaterfallSlice, FtaSlice, FlowchartSlice, ParetoSlice, HistogramSlice, DecisionSlice, WbsSlice {
  projectUnsubscribe: (() => void) | null;
  // Auth
  user: { uid: string; email: string; name: string; photoURL?: string } | null;
  login: (uid: string, email: string, name: string, photoURL?: string) => void;
  logout: () => void;

  // UI State
  activeTool: 'wbs' | '5whys' | 'swot' | 'ishikawa' | 'pdca' | 'waterfall' | 'fta' | 'decision' | 'flowchart' | 'pareto' | 'histogram' | 'notepad' | 'eod' | null;
  setActiveTool: (tool: 'wbs' | '5whys' | 'swot' | 'ishikawa' | 'pdca' | 'waterfall' | 'fta' | 'decision' | 'flowchart' | 'eod' | null) => void;

  // Projects
  projects: Project[];
  currentProjectId: string | null;
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (name: string, initialTool?: string) => void;
  loadProject: (id: string) => void;
  updateProjectName: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  clearToolData: (projectId: string, toolName: 'wbs' | '5whys' | 'swot' | 'ishikawa' | 'pdca' | 'waterfall' | 'fta' | 'decision' | 'flowchart' | 'pareto' | 'histogram' | 'notepad' | 'eod') => void;
  setProjectPublic: (id: string, isPublic: boolean) => Promise<void>;
  joinSharedProject: (id: string) => Promise<boolean>;
  forceSync: () => void;

}

export const useRoadmapStore = create<RoadmapState>()(
  temporal(
    persist(
      (set, get, api) => ({
        ...createEodSlice(set, get, api),
        ...createNotepadSlice(set, get, api),
        ...createFiveWhysSlice(set, get, api),
        ...createSwotSlice(set, get, api),
        ...createIshikawaSlice(set, get, api),
        ...createPdcaSlice(set, get, api),
        ...createWaterfallSlice(set, get, api),
        ...createFtaSlice(set, get, api),
        ...createFlowchartSlice(set, get, api),
        ...createParetoSlice(set, get, api),
        ...createHistogramSlice(set, get, api),
        ...createDecisionSlice(set, get, api),
        ...createWbsSlice(set, get, api),
        
        forceSync: () => {
          /* deprecated */
        },

        projectUnsubscribe: null,

        user: null,
        login: (uid, email, name, photoURL) => set({ user: { uid, email, name, photoURL } }),
        logout: () => {
          const sub = get().projectUnsubscribe;
          if (sub) sub();
          set({ user: null, projects: [], currentProjectId: null, nodes: [], edges: [], fiveWhysNodes: [], fiveWhysEdges: [], swot: [], ishikawa: [], pdca: [], waterfall: [], pareto: [], histogram: [], eod: [],
            decision: [], flowchartNodes: [], flowchartEdges: [], ftaNodes: [], ftaEdges: [], activeTool: null, projectUnsubscribe: null });
        },

      activeTool: null,
      setActiveTool: (tool) => set({ activeTool: tool }),

      projects: [],
      currentProjectId: null,

      fetchProjects: async (userId) => {
        try {
          const currentSub = get().projectUnsubscribe;
          if (currentSub) currentSub();

          const q = query(collection(db, 'projects'), or(where('userId', '==', userId), where('sharedWith', 'array-contains', userId)));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedProjects = snapshot.docs.map(doc => {
              const data = doc.data() as Project;
              let safeSwot = data.swot || [];
              if (safeSwot.length > 0 && 'type' in safeSwot[0]) {
                safeSwot = [{
                  id: 'migrated-swot',
                  title: i18n.t('default_swot_title'),
                  items: safeSwot as unknown as import('./slices/createSwotSlice').SwotItem[],
                  createdAt: Date.now()
                }];
              }
              let safeWaterfall = data.waterfall || [];
              safeWaterfall = safeWaterfall.map(proj => ({
                ...proj,
                currentPhaseIndex: proj.currentPhaseIndex ?? 0,
                items: proj.items.map(item => ({
                  ...item,
                  phase: (item.phase as string) === 'Design' ? 'High-Level Design' : item.phase
                }))
              }));
              return { ...data, id: doc.id, swot: safeSwot, waterfall: safeWaterfall };
            });
            
            isRemoteUpdate = true;
            const currentState = get();
            const updates: Partial<RoadmapState> & Record<string, any> = { projects: fetchedProjects };

            if (currentState.currentProjectId) {
              const activeProj = fetchedProjects.find(p => p.id === currentState.currentProjectId);
              if (activeProj) {
                updates.nodes = activeProj.nodes || [];
                updates.edges = activeProj.edges || [];
                updates.fiveWhysNodes = activeProj.fiveWhysNodes || [];
                updates.fiveWhysEdges = activeProj.fiveWhysEdges || [];
                updates.swot = activeProj.swot || [];
                updates.ishikawa = activeProj.ishikawa || [];
                updates.pdca = activeProj.pdca || [];
                updates.waterfall = activeProj.waterfall || [];
                updates.pareto = activeProj.pareto || [];
                updates.histogram = activeProj.histogram || [];
                updates.eod = activeProj.eod || [];
                updates.decision = activeProj.decision || [];
                updates.flowchartNodes = activeProj.flowchartNodes || [];
                updates.flowchartEdges = activeProj.flowchartEdges || [];
                updates.ftaNodes = activeProj.ftaNodes || [];
                updates.ftaEdges = activeProj.ftaEdges || [];
              }
            }

            set(updates);

            setTimeout(() => {
              isRemoteUpdate = false;
            }, 0);
            
          }, (error) => {
            console.error("Fetch projects error:", error);
          });
          
          set({ projectUnsubscribe: unsubscribe });
        } catch (error) {
          console.error("Setup listen projects error:", error);
        }
      },

      createProject: (name, initialTool) => {
        const state = get();
        if (!state.user) return;

        const activeToolToUse = initialTool || state.activeTool;

        const id = uuidv4();
        const newProject: Project = {
          id,
          name,
          nodes: activeToolToUse === 'wbs' ? getDefaultNodes() : [],
          edges: [],
          fiveWhysNodes: [],
          fiveWhysEdges: [],
          swot: [],
          ishikawa: [],
          pdca: [],
          waterfall: [],
          pareto: [],
          histogram: [],
          eod: [],
          notepad: [],
          decision: [],
          flowchartNodes: activeToolToUse === 'flowchart' ? [{ id: "root", type: "flowchartNode", position: { x: 0, y: 0 }, data: { label: i18n.t('flowchart_start'), shape: "start" } }] : [],
          flowchartEdges: [],
          ftaNodes: [{ id: "root", type: "ftaNode", position: { x: 0, y: 0 }, data: { label: i18n.t('fta_top_event'), type: "topEvent" } }],
          ftaEdges: [],
          updatedAt: Date.now(),
          userId: state.user.uid,
        };

        // Save immediately
        setDoc(doc(db, 'projects', newProject.id), newProject).catch(console.error);

        set((state) => ({
          projects: [newProject, ...state.projects],
          currentProjectId: newProject.id,
          nodes: newProject.nodes,
          edges: newProject.edges,
          fiveWhysNodes: newProject.fiveWhysNodes || [],
          fiveWhysEdges: newProject.fiveWhysEdges || [],
          swot: newProject.swot,
          ishikawa: newProject.ishikawa,
          pdca: newProject.pdca,
          waterfall: newProject.waterfall,
          pareto: newProject.pareto || [],
          histogram: newProject.histogram || [],
          eod: newProject.eod || [],
          notepad: newProject.notepad || [],
          decision: newProject.decision || [],
          flowchartNodes: newProject.flowchartNodes || [],
          flowchartEdges: newProject.flowchartEdges || [],
          ftaNodes: newProject.ftaNodes || [],
          ftaEdges: newProject.ftaEdges || [],
          activeTool: (initialTool as RoadmapState['activeTool']) || null,
        }));
      },

      loadProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          let safeSwot = project.swot || [];
          if (safeSwot.length > 0 && 'type' in safeSwot[0]) {
            safeSwot = [{
              id: 'migrated-swot',
              title: i18n.t('default_swot_title'),
              items: safeSwot as unknown as import('./slices/createSwotSlice').SwotItem[],
              createdAt: Date.now()
            }];
          }
          set({
            currentProjectId: id,
            nodes: project.nodes,
            edges: project.edges,
            fiveWhysNodes: project.fiveWhysNodes || [],
            fiveWhysEdges: project.fiveWhysEdges || [],
            swot: safeSwot,
            ishikawa: project.ishikawa || [],
            pdca: project.pdca || [],
            waterfall: (project.waterfall || []).map(proj => ({
              ...proj,
              currentPhaseIndex: proj.currentPhaseIndex ?? 0,
              items: proj.items.map(item => ({
                ...item,
                phase: (item.phase as string) === 'Design' ? 'High-Level Design' : item.phase
              }))
            })),
            pareto: project.pareto || [],
            histogram: project.histogram || [],
            eod: project.eod || [],
            decision: project.decision || [],
            flowchartNodes: project.flowchartNodes || [],
            flowchartEdges: project.flowchartEdges || [],
            ftaNodes: project.ftaNodes || [],
            ftaEdges: project.ftaEdges || [],
          });
        }
      },

      updateProjectName: (id, name) => {
        const state = get();
        if (state.user) {
           setDoc(doc(db, 'projects', id), { name, updatedAt: Date.now() }, { merge: true }).catch(console.error);
        }
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: Date.now() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        const state = get();
        if (state.user) {
           const project = state.projects.find(p => p.id === id);
           if (project && project.userId !== state.user.uid) {
             updateDoc(doc(db, 'projects', id), { sharedWith: arrayRemove(state.user.uid) }).catch(e => alert("Silme Hatası (Ortak): " + e.message));
           } else {
             deleteDoc(doc(db, 'projects', id)).catch(e => alert("Silme Hatası (Sahip): " + e.message));
           }
        }
        set((state) => {
          const newProjects = state.projects.filter((p) => p.id !== id);
          const isCurrent = state.currentProjectId === id;
          return {
            projects: newProjects,
            currentProjectId: isCurrent ? null : state.currentProjectId,
            activeTool: newProjects.length === 0 ? null : state.activeTool,
            nodes: isCurrent ? [] : state.nodes,
            edges: isCurrent ? [] : state.edges,
            fiveWhysNodes: isCurrent ? [] : state.fiveWhysNodes,
            fiveWhysEdges: isCurrent ? [] : state.fiveWhysEdges,
            swot: isCurrent ? [] : state.swot,
            ishikawa: isCurrent ? [] : state.ishikawa,
            pdca: isCurrent ? [] : state.pdca,
            waterfall: isCurrent ? [] : state.waterfall,
            pareto: isCurrent ? [] : state.pareto,
            histogram: isCurrent ? [] : state.histogram,
            eod: isCurrent ? [] : state.eod,
            decision: isCurrent ? [] : state.decision,
            flowchartNodes: isCurrent ? [] : state.flowchartNodes,
            flowchartEdges: isCurrent ? [] : state.flowchartEdges,
            ftaNodes: isCurrent ? [] : state.ftaNodes,
            ftaEdges: isCurrent ? [] : state.ftaEdges,
          };
        });
      },

      
      setProjectPublic: async (id, isPublic) => {
        try {
          await setDoc(doc(db, 'projects', id), { isPublic }, { merge: true });
        } catch (error) {
          console.error("setProjectPublic error:", error);
        }
      },

      joinSharedProject: async (id) => {
        const state = get();
        if (!state.user) return false;
        try {
          const docRef = doc(db, 'projects', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Project;
            if (data.isPublic) {
              await updateDoc(docRef, { sharedWith: arrayUnion(state.user.uid) });
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error("joinSharedProject error:", error);
          return false;
        }
      },

      clearToolData: (projectId, toolName) => {
        const state = get();
        const updatedProjects = state.projects.map((p) => {
          if (p.id === projectId) {
            const nextP = { ...p };
            if (toolName === 'wbs') {
              nextP.nodes = [];
              nextP.edges = [];
              nextP.fiveWhysNodes = [{ id: "root", type: "fiveWhysNode", position: { x: 0, y: 0 }, data: { label: i18n.t('whys_problem'), type: "problem", depth: 0 } }];
              nextP.fiveWhysEdges = [];
            } else if (toolName === 'flowchart') {
              nextP.flowchartNodes = [{ id: "root", type: "flowchartNode", position: { x: 0, y: 0 }, data: { label: i18n.t('flowchart_start'), shape: "start" } }];
              nextP.flowchartEdges = [];
            } else if (toolName === 'fta') {
              nextP.ftaNodes = [{ id: "root", type: "ftaNode", position: { x: 0, y: 0 }, data: { label: i18n.t('fta_top_event'), type: "topEvent" } }];
              nextP.ftaEdges = [];
            } else {
              (nextP as Record<string, unknown>)[toolName] = [];
            }
            nextP.updatedAt = Date.now();
            if (state.user) {
              setDoc(doc(db, 'projects', p.id), nextP, { merge: true }).catch(console.error);
            }
            return nextP;
          }
          return p;
        });

        const isCurrent = state.currentProjectId === projectId;
        const updates: any = { projects: updatedProjects };
        if (isCurrent) {
           const activeProject = updatedProjects.find(p => p.id === projectId);
           if (activeProject) {
              if (toolName === 'wbs') {
                updates.nodes = activeProject.nodes;
                updates.edges = activeProject.edges;
              } else if (toolName === '5whys') {
                updates.fiveWhysNodes = activeProject.fiveWhysNodes;
                updates.fiveWhysEdges = activeProject.fiveWhysEdges;
              } else if (toolName === 'pareto') {
                updates.pareto = [];
              } else if (toolName === 'histogram') {
                updates.histogram = [];
              } else if (toolName === 'fta') {
                updates.ftaNodes = activeProject.ftaNodes;
                updates.ftaEdges = activeProject.ftaEdges;
              } else if (toolName === 'flowchart') {
                updates.flowchartNodes = activeProject.flowchartNodes;
                updates.flowchartEdges = activeProject.flowchartEdges;
              } else {
                updates[toolName] = [];
              }
           }
        }
        set(updates);
      },

    }),
    {
      name: 'roadmap-storage',
      partialize: (state) => ({
        user: state.user,
        currentProjectId: state.currentProjectId,
        activeTool: state.activeTool,
      }),
    }
  ),
  {
    partialize: (state) => ({
      nodes: state.nodes,
      edges: state.edges,
      fiveWhysNodes: state.fiveWhysNodes,
      fiveWhysEdges: state.fiveWhysEdges,
      swot: state.swot,
      ishikawa: state.ishikawa,
      pdca: state.pdca,
      waterfall: state.waterfall,
      pareto: state.pareto,
      histogram: state.histogram,
      eod: state.eod,
      decision: state.decision,
      flowchartNodes: state.flowchartNodes,
      flowchartEdges: state.flowchartEdges,
      ftaNodes: state.ftaNodes,
      ftaEdges: state.ftaEdges,
    }),
    equality: (pastState, currentState) => {
      // Shallow compare all keys
      for (const key in pastState) {
        if (pastState[key as keyof typeof pastState] !== currentState[key as keyof typeof currentState]) {
          return false;
        }
      }
      return true;
    },
    limit: 50,
    handleSet: (handleSet) => {
      let timeout: ReturnType<typeof setTimeout>;
      let firstState: any = null;
      return (state) => {
        if (!firstState) {
          firstState = state;
        }
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          handleSet(firstState);
          firstState = null;
        }, 1000);
      };
    },
  }
)
);

let saveTimeout: ReturnType<typeof setTimeout>;
let isSyncing = false;

useRoadmapStore.subscribe((state, _prevState) => {
  if (isRemoteUpdate) return;
  if (isSyncing) return;
  if (!state.currentProjectId || !state.user) return;
  
  const currentProj = state.projects.find(p => p.id === state.currentProjectId);
  if (!currentProj) return;

  // Sığ (Shallow) karşılaştırma ile tool datalarının değişip değişmediğini anla
  const hasChanges = (
    state.nodes !== currentProj.nodes ||
    state.edges !== currentProj.edges ||
    state.fiveWhysNodes !== currentProj.fiveWhysNodes ||
    state.fiveWhysEdges !== currentProj.fiveWhysEdges ||
    state.swot !== currentProj.swot ||
    state.ishikawa !== currentProj.ishikawa ||
    state.pdca !== currentProj.pdca ||
    state.waterfall !== currentProj.waterfall ||
    state.pareto !== currentProj.pareto ||
    state.histogram !== currentProj.histogram ||
    state.eod !== currentProj.eod ||
    
    state.decision !== currentProj.decision ||
    state.flowchartNodes !== currentProj.flowchartNodes ||
    state.flowchartEdges !== currentProj.flowchartEdges ||
    state.ftaNodes !== currentProj.ftaNodes ||
    state.ftaEdges !== currentProj.ftaEdges
  );

  if (hasChanges) {
    isSyncing = true;
    
    const updatedProject: Project = {
      ...currentProj,
      nodes: state.nodes,
      edges: state.edges,
      fiveWhysNodes: state.fiveWhysNodes || [],
      fiveWhysEdges: state.fiveWhysEdges || [],
      swot: state.swot || [],
      ishikawa: state.ishikawa || [],
      pdca: state.pdca || [],
      waterfall: state.waterfall || [],
      pareto: state.pareto || [],
      histogram: state.histogram || [],
      eod: state.eod || [],
      decision: state.decision || [],
      flowchartNodes: state.flowchartNodes || [],
      flowchartEdges: state.flowchartEdges || [],
      ftaNodes: state.ftaNodes || [],
      ftaEdges: state.ftaEdges || [],
      updatedAt: Date.now(),
    };

    useRoadmapStore.setState({
      projects: state.projects.map(p => p.id === state.currentProjectId ? updatedProject : p)
    });

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      setDoc(doc(db, 'projects', state.currentProjectId!), updatedProject, { merge: true }).catch(err => {
        console.error("Firestore Save Error:", err);
      });
    }, 1000);
    
    isSyncing = false;
  }
});
