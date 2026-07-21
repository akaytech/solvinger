import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { Edge, NodeChange, EdgeChange, Connection, Node } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import dagre from 'dagre';
import i18n from '../i18n';
import { createNotepadSlice } from './slices/createNotepadSlice';
import type { NotepadSlice } from './slices/createNotepadSlice';
import { createFiveWhysSlice } from './slices/createFiveWhysSlice';
import type { FiveWhysSlice, FiveWhysAnalysis } from './slices/createFiveWhysSlice';
export type { FiveWhysAnalysis };

import { createSwotSlice } from './slices/createSwotSlice';
import type { SwotSlice, SwotType, SwotItem, SwotAnalysis } from './slices/createSwotSlice';
export type { SwotType, SwotItem, SwotAnalysis };


type GoalStatus = 'To Do' | 'In Progress' | 'Done' | 'Failed';

export type GoalNodeData = {
  label: string;
  description?: string;
  notes?: string;
  targetDate?: string;
  status: GoalStatus;
  isExpanded: boolean;
  hideCompleted?: boolean;
};

export type GoalNode = Node<GoalNodeData>;





export type IshikawaCategory = 'Manpower' | 'Machine' | 'Material' | 'Method' | 'Measurement' | 'Milieu';

interface IshikawaItem {
  id: string;
  category: IshikawaCategory;
  text: string;
  createdAt: number;
}

interface IshikawaAnalysis {
  id: string;
  problemStatement: string;
  items: IshikawaItem[];
  createdAt: number;
}

export type PdcaPhase = 'Plan' | 'Do' | 'Check' | 'Act';

interface PdcaItem {
  id: string;
  phase: PdcaPhase;
  text: string;
  status: 'pending' | 'completed';
  createdAt: number;
}

interface PdcaCycle {
  id: string;
  goal: string;
  items: PdcaItem[];
  createdAt: number;
}

export type WaterfallPhase = 'Requirements' | 'Design' | 'Implementation' | 'Verification' | 'Maintenance';

interface WaterfallItem {
  id: string;
  phase: WaterfallPhase;
  text: string;
  createdAt: number;
}

interface WaterfallProject {
  id: string;
  name: string;
  items: WaterfallItem[];
  createdAt: number;
}

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

export interface HistogramItem {
  id: string;
  category: string;
  frequency: number;
}

export interface NotepadNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface HistogramProject {
  id: string;
  title: string;
  items: HistogramItem[];
  createdAt: number;
}

export interface DecisionMatrixProject {
  id: string;
  name: string;
  criteria: DecisionCriteria[];
  options: DecisionOption[];
  createdAt: number;
}


export type FlowchartNodeType = 'start' | 'process' | 'decision' | 'end';

export type FlowchartNodeData = {
  label: string;
  shape: FlowchartNodeType;
};

export type FlowchartNode = Node<FlowchartNodeData>;

export type FtaNodeType = 'topEvent' | 'event' | 'andGate' | 'orGate' | 'basicEvent';

export type FtaNodeData = {
  label: string;
  type: FtaNodeType;
  description?: string;
};

export type FtaNode = Node<FtaNodeData>;

export interface Project {
  id: string;
  name: string;
  nodes: GoalNode[];
  edges: Edge[];
  fiveWhys: FiveWhysAnalysis[];
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
  updatedAt: number;
  userId: string;
}

export interface RoadmapState extends NotepadSlice, FiveWhysSlice, SwotSlice {
  // Auth
  user: { uid: string; email: string; name: string; photoURL?: string } | null;
  login: (uid: string, email: string, name: string, photoURL?: string) => void;
  logout: () => void;

  // UI State
  activeTool: 'wbs' | '5whys' | 'swot' | 'ishikawa' | 'pdca' | 'waterfall' | 'fta' | 'decision' | 'flowchart' | 'pareto' | 'histogram' | 'notepad' | null;
  setActiveTool: (tool: 'wbs' | '5whys' | 'swot' | 'ishikawa' | 'pdca' | 'waterfall' | 'fta' | 'decision' | 'flowchart' | null) => void;

  // Projects
  projects: Project[];
  currentProjectId: string | null;
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (name: string, initialTool?: string) => void;
  loadProject: (id: string) => void;
  updateProjectName: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  clearToolData: (projectId: string, toolName: 'wbs' | '5whys' | 'swot' | 'ishikawa' | 'pdca' | 'waterfall' | 'fta' | 'decision' | 'flowchart' | 'pareto' | 'histogram' | 'notepad') => void;

  // Decision Matrix State
  pareto: ParetoProject[];
  addParetoProject: (projectId: string, paretoId: string, title: string) => void;
  addParetoItem: (projectId: string, paretoId: string, category: string, frequency: number) => void;
  updateParetoItem: (projectId: string, paretoId: string, itemId: string, data: Partial<ParetoItem>) => void;
  deleteParetoItem: (projectId: string, paretoId: string, itemId: string) => void;
  updateParetoTitle: (projectId: string, paretoId: string, title: string) => void;
  deleteParetoProject: (projectId: string, paretoId: string) => void;

  histogram: HistogramProject[];
  addHistogramProject: (projectId: string, histogramId: string, title: string) => void;
  addHistogramItem: (projectId: string, histogramId: string, category: string, frequency: number) => void;
  updateHistogramItem: (projectId: string, histogramId: string, itemId: string, data: Partial<HistogramItem>) => void;
  deleteHistogramItem: (projectId: string, histogramId: string, itemId: string) => void;

  updateHistogramTitle: (projectId: string, histogramId: string, title: string) => void;
  deleteHistogramProject: (projectId: string, histogramId: string) => void;

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


  // Flowchart
  flowchartNodes: FlowchartNode[];
  flowchartEdges: Edge[];
  onFlowchartNodesChange: (changes: NodeChange[]) => void;
  onFlowchartEdgesChange: (changes: EdgeChange[]) => void;
  onFlowchartConnect: (connection: Connection) => void;
  addFlowchartNode: (parentId: string | null, shape: FlowchartNodeType, label: string, position: {x: number, y: number}) => void;
  updateFlowchartNode: (id: string, data: Partial<FlowchartNodeData>) => void;
  deleteFlowchartNode: (id: string) => void;

  // FTA
  ftaNodes: FtaNode[];
  ftaEdges: Edge[];
  onFtaNodesChange: (changes: NodeChange[]) => void;
  onFtaEdgesChange: (changes: EdgeChange[]) => void;
  onFtaConnect: (connection: Connection) => void;
  addFtaNode: (parentId: string, type: FtaNodeType, label: string) => void;
  updateFtaNode: (id: string, data: Partial<FtaNodeData>) => void;
  deleteFtaNode: (id: string) => void;

  // Active Roadmap
  nodes: GoalNode[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addGoal: (parentId: string | null, label: string, position?: { x: number; y: number }) => void;
  updateGoal: (id: string, data: Partial<GoalNodeData>) => void;
  deleteGoal: (id: string) => void;
  toggleExpand: (id: string) => void;
  toggleHideCompleted: (id: string) => void;
  loadData: (nodes: GoalNode[], edges: Edge[], fiveWhys?: FiveWhysAnalysis[], swot?: SwotAnalysis[], ishikawa?: IshikawaAnalysis[], pdca?: PdcaCycle[], waterfall?: WaterfallProject[]) => void;





  // Ishikawa State
  ishikawa: IshikawaAnalysis[];
  addIshikawa: (problemStatement: string) => void;
  updateIshikawaProblem: (id: string, problemStatement: string) => void;
  deleteIshikawa: (id: string) => void;
  addIshikawaItem: (analysisId: string, category: IshikawaCategory, text: string) => void;
  updateIshikawaItem: (analysisId: string, itemId: string, text: string) => void;
  deleteIshikawaItem: (analysisId: string, itemId: string) => void;

  // PDCA State
  pdca: PdcaCycle[];
  addPdcaCycle: (goal: string) => void;
  updatePdcaGoal: (id: string, goal: string) => void;
  deletePdcaCycle: (id: string) => void;
  addPdcaItem: (cycleId: string, phase: PdcaPhase, text: string) => void;
  updatePdcaItem: (cycleId: string, itemId: string, text: string) => void;
  deletePdcaItem: (cycleId: string, itemId: string) => void;
  togglePdcaItemStatus: (cycleId: string, itemId: string) => void;

  // Waterfall State
  waterfall: WaterfallProject[];
  addWaterfallProject: (name: string) => void;
  updateWaterfallProjectName: (id: string, name: string) => void;
  deleteWaterfallProject: (id: string) => void;
  addWaterfallItem: (projectId: string, phase: WaterfallPhase, text: string) => void;
  updateWaterfallItem: (projectId: string, itemId: string, text: string) => void;
  deleteWaterfallItem: (projectId: string, itemId: string) => void;
}

const getFtaDescendants = (id: string, edges: Edge[]): string[] => {
  const children = edges.filter(e => e.source === id).map(e => e.target);
  return children.reduce((acc, child) => [...acc, child, ...getFtaDescendants(child, edges)], [] as string[]);
};

const getFtaLayoutedElements = (nodes: FtaNode[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 60 }); 

  nodes.forEach((node) => {
    const width = 180;
    const height = node.data.type === 'basicEvent' ? 80 : 60; 
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 30,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export const getDescendants = (parentId: string, edges: Edge[]): string[] => {
  const children = edges.filter((e) => e.source === parentId).map((e) => e.target);
  return children.reduce((acc, childId) => {
    return [...acc, childId, ...getDescendants(childId, edges)];
  }, [] as string[]);
};

const getDirectChildren = (parentId: string, edges: Edge[]): string[] => {
  return edges.filter((e) => e.source === parentId).map((e) => e.target);
};

const computeVisibility = (nodes: GoalNode[], edges: Edge[]) => {
  const rootNodes = nodes.filter(n => !edges.some(e => e.target === n.id));
  const visibleNodeIds = new Set<string>();
  rootNodes.forEach(n => visibleNodeIds.add(n.id));

  const queue = [...rootNodes];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.data.isExpanded) {
      const childrenIds = edges.filter(e => e.source === current.id).map(e => e.target);
      const children = childrenIds.map(cid => nodes.find(n => n.id === cid)).filter(Boolean) as GoalNode[];
      
      children.forEach(child => {
        if (current.data.hideCompleted && child.data.status === 'Done') {
           // do not show
        } else {
           visibleNodeIds.add(child.id);
           queue.push(child);
        }
      });
    }
  }

  return {
    nodes: nodes.map(n => ({ ...n, hidden: !visibleNodeIds.has(n.id) })),
    edges: edges.map(e => ({ ...e, hidden: !visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target) }))
  };
};

const getLayoutedElements = (nodes: GoalNode[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 150, ranksep: 200 });

  const visibleNodes = nodes.filter(n => !n.hidden);
  const visibleEdges = edges.filter(e => !e.hidden);

  visibleNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 440, height: 110 });
  });

  visibleEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Find root nodes (nodes with no incoming edges)
  const rootNodes = visibleNodes.filter(n => !visibleEdges.some(e => e.target === n.id));

  // Map to store offsets for each node
  const offsets = new Map<string, { dx: number; dy: number }>();

  rootNodes.forEach(root => {
    const dagreNode = dagreGraph.node(root.id);
    if (!dagreNode) return;
    // Calculate how much we need to shift this entire tree so the root stays at its original position
    const dx = root.position.x - (dagreNode.x - 220);
    const dy = root.position.y - (dagreNode.y - 55);

    // Apply this offset to root and all its descendants
    const descendants = [root.id, ...getDescendants(root.id, visibleEdges)];
    descendants.forEach(id => {
      offsets.set(id, { dx, dy });
    });
  });

  return nodes.map((node) => {
    if (node.hidden) return node;
    const nodeWithPosition = dagreGraph.node(node.id);
    if (!nodeWithPosition) return node;

    const offset = offsets.get(node.id) || { dx: 0, dy: 0 };

    return {
      ...node,
      position: {
        x: (nodeWithPosition.x - 220) + offset.dx,
        y: (nodeWithPosition.y - 55) + offset.dy,
      },
      targetPosition: 'top',
      sourcePosition: 'bottom',
    };
  }) as GoalNode[];
};

const cascadeStatus = (nodes: GoalNode[], edges: Edge[], changedId: string): GoalNode[] => {
  let currentNodes = [...nodes];
  let currentId: string | undefined = changedId;

  while (currentId) {
    const parentId = edges.find((e) => e.target === currentId)?.source;
    if (!parentId) break;

    const parentIndex = currentNodes.findIndex((n) => n.id === parentId);
    if (parentIndex === -1) break;

    const childrenIds = getDirectChildren(parentId, edges);
    const childrenNodes = childrenIds.map(cid => currentNodes.find(n => n.id === cid)).filter(Boolean) as GoalNode[];

    const allDone = childrenNodes.length > 0 && childrenNodes.every(n => n.data.status === 'Done');
    const anyFailed = childrenNodes.some(n => n.data.status === 'Failed');
    const anyInProgressOrDone = childrenNodes.some(n => n.data.status === 'In Progress' || n.data.status === 'Done');

    let newStatus = currentNodes[parentIndex].data.status;
    
    // Status cascade logic: If all done, done. If any in progress or done, in progress. 
    // "Failed" is intentionally excluded so it doesn't infect other nodes.
    if (allDone && !anyFailed) {
      newStatus = 'Done';
    } else if (anyInProgressOrDone && currentNodes[parentIndex].data.status === 'To Do') {
      newStatus = 'In Progress';
    } else if (!anyInProgressOrDone && currentNodes[parentIndex].data.status === 'Done' && !anyFailed) {
      newStatus = 'To Do';
    } else if (anyInProgressOrDone && !allDone && currentNodes[parentIndex].data.status === 'Done' && !anyFailed) {
      newStatus = 'In Progress';
    }

    if (newStatus !== currentNodes[parentIndex].data.status) {
      currentNodes[parentIndex] = {
        ...currentNodes[parentIndex],
        data: { ...currentNodes[parentIndex].data, status: newStatus }
      };
      currentId = parentId;
    } else {
      break;
    }
  }

  return currentNodes;
};

let saveTimeout: any;

export const syncProject = (state: RoadmapState): Partial<RoadmapState> => {
  if (!state.currentProjectId || !state.user) return {};

  const currentProjectName = state.projects.find(p => p.id === state.currentProjectId)?.name || 'Proje';
  
  const updatedProject: Project = {
    id: state.currentProjectId,
    name: currentProjectName,
    nodes: state.nodes,
    edges: state.edges,
    fiveWhys: state.fiveWhys || [],
    swot: state.swot || [],
    ishikawa: state.ishikawa || [],
    pdca: state.pdca || [],
    waterfall: state.waterfall || [],
    pareto: state.pareto || [],
    histogram: state.histogram || [],
    
    decision: state.decision || [],
    flowchartNodes: state.flowchartNodes,
    flowchartEdges: state.flowchartEdges,
    ftaNodes: state.ftaNodes,
    ftaEdges: state.ftaEdges,
    updatedAt: Date.now(),
    userId: state.user.uid,
  };

  // Debounce Firestore save to avoid huge costs on drag
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    setDoc(doc(db, 'projects', state.currentProjectId!), updatedProject, { merge: true }).catch(err => {
      console.error("Firestore Save Error:", err);
    });
  }, 1000);

  return {
    projects: state.projects.map((p) =>
      p.id === state.currentProjectId ? updatedProject : p
    ),
  };
};

const getDefaultNodes = (): GoalNode[] => [
  {
    id: 'root',
    type: 'goalNode',
    position: { x: 0, y: 0 },
    data: {
      label: i18n.t('new_project'),
      status: 'To Do',
      isExpanded: true,
    },
  },
];

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get, api) => ({
      ...createNotepadSlice(set, get, api),
      ...createFiveWhysSlice(set, get, api),
      ...createSwotSlice(set, get, api),
      user: null,
      login: (uid, email, name, photoURL) => set({ user: { uid, email, name, photoURL } }),
      logout: () => set({ user: null, projects: [], currentProjectId: null, nodes: [], edges: [], fiveWhys: [], swot: [], ishikawa: [], pdca: [], waterfall: [], pareto: [], histogram: [],
          decision: [], flowchartNodes: [], flowchartEdges: [], ftaNodes: [], ftaEdges: [], activeTool: null }),

      activeTool: null,
      setActiveTool: (tool) => set({ activeTool: tool }),

      projects: [],
      currentProjectId: null,

      fetchProjects: async (userId) => {
        try {
          const q = query(collection(db, 'projects'), where('userId', '==', userId));
          const snapshot = await getDocs(q);
          const fetchedProjects = snapshot.docs.map(doc => {
            const data = doc.data() as Project;
            let safeSwot = data.swot || [];
            if (safeSwot.length > 0 && 'type' in safeSwot[0]) {
              safeSwot = [{
                id: 'migrated-swot',
                title: i18n.t('default_swot_title'),
                items: safeSwot as any,
                createdAt: Date.now()
              }];
            }
            return { ...data, swot: safeSwot };
          });
          
          set({ projects: fetchedProjects });
        } catch (error) {
          console.error("Fetch projects error:", error);
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
          fiveWhys: [],
          swot: [],
          ishikawa: [],
          pdca: [],
          waterfall: [],
          pareto: [],
          histogram: [],
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
          fiveWhys: newProject.fiveWhys,
          swot: newProject.swot,
          ishikawa: newProject.ishikawa,
          pdca: newProject.pdca,
          waterfall: newProject.waterfall,
          pareto: newProject.pareto || [],
          histogram: newProject.histogram || [],
          notepad: newProject.notepad || [],
          decision: newProject.decision || [],
          flowchartNodes: newProject.flowchartNodes || [],
          flowchartEdges: newProject.flowchartEdges || [],
          ftaNodes: newProject.ftaNodes || [],
          ftaEdges: newProject.ftaEdges || [],
          activeTool: (initialTool as any) || null,
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
              items: safeSwot as any,
              createdAt: Date.now()
            }];
          }
          set({
            currentProjectId: id,
            nodes: project.nodes,
            edges: project.edges,
            fiveWhys: project.fiveWhys || [],
            swot: safeSwot,
            ishikawa: project.ishikawa || [],
            pdca: project.pdca || [],
            waterfall: project.waterfall || [],
            pareto: project.pareto || [],
            histogram: project.histogram || [],
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
           deleteDoc(doc(db, 'projects', id)).catch(console.error);
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
            fiveWhys: isCurrent ? [] : state.fiveWhys,
            swot: isCurrent ? [] : state.swot,
            ishikawa: isCurrent ? [] : state.ishikawa,
            pdca: isCurrent ? [] : state.pdca,
            waterfall: isCurrent ? [] : state.waterfall,
            pareto: isCurrent ? [] : state.pareto,
            histogram: isCurrent ? [] : state.histogram,
            decision: isCurrent ? [] : state.decision,
            flowchartNodes: isCurrent ? [] : state.flowchartNodes,
            flowchartEdges: isCurrent ? [] : state.flowchartEdges,
            ftaNodes: isCurrent ? [] : state.ftaNodes,
            ftaEdges: isCurrent ? [] : state.ftaEdges,
          };
        });
      },

      clearToolData: (projectId, toolName) => {
        const state = get();
        const updatedProjects = state.projects.map((p) => {
          if (p.id === projectId) {
            const nextP = { ...p };
            if (toolName === 'wbs') {
              nextP.nodes = [];
              nextP.edges = [];
            } else if (toolName === '5whys') {
              nextP.fiveWhys = [];
            } else if (toolName === 'flowchart') {
              nextP.flowchartNodes = [{ id: "root", type: "flowchartNode", position: { x: 0, y: 0 }, data: { label: i18n.t('flowchart_start'), shape: "start" } }];
              nextP.flowchartEdges = [];
            } else if (toolName === 'fta') {
              nextP.ftaNodes = [{ id: "root", type: "ftaNode", position: { x: 0, y: 0 }, data: { label: i18n.t('fta_top_event'), type: "topEvent" } }];
              nextP.ftaEdges = [];
            } else {
              nextP[toolName] = [];
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
                updates.fiveWhys = [];
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

      // FTA Actions

      flowchartNodes: [],
      flowchartEdges: [],

      onFlowchartNodesChange: (changes: NodeChange[]) => {
        set((state) => {
          const next = { ...state, flowchartNodes: applyNodeChanges(changes, state.flowchartNodes) as FlowchartNode[] };
          return { ...next, ...syncProject(next) };
        });
      },

      onFlowchartEdgesChange: (changes: EdgeChange[]) => {
        set((state) => {
          const next = { ...state, flowchartEdges: applyEdgeChanges(changes, state.flowchartEdges) as Edge[] };
          return { ...next, ...syncProject(next) };
        });
      },

      onFlowchartConnect: (connection: Connection) => {
        set((state) => {
          const edge = { ...connection, id: uuidv4() };
          const next = { ...state, flowchartEdges: addEdge(edge, state.flowchartEdges as any) as Edge[] };
          return { ...next, ...syncProject(next) };
        });
      },

      addFlowchartNode: (parentId, shape, label, position) => {
        set((state) => {
          const newNode: FlowchartNode = {
            id: uuidv4(),
            type: 'flowchartNode',
            position,
            data: { label, shape },
          };
          const newNodes = [...state.flowchartNodes, newNode];
          const newEdges = parentId ? [...state.flowchartEdges, { id: uuidv4(), source: parentId, target: newNode.id }] : state.flowchartEdges;
          const next = { ...state, flowchartNodes: newNodes, flowchartEdges: newEdges };
          return { ...next, ...syncProject(next) };
        });
      },

      updateFlowchartNode: (id, data) => {
        set((state) => {
          const next = {
            ...state,
            flowchartNodes: state.flowchartNodes.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, ...data } } : n
            ),
          };
          return { ...next, ...syncProject(next) };
        });
      },

      deleteFlowchartNode: (id) => {
        set((state) => {
          const newNodes = state.flowchartNodes.filter(n => n.id !== id);
          const newEdges = state.flowchartEdges.filter(e => e.source !== id && e.target !== id);
          const next = { ...state, flowchartNodes: newNodes, flowchartEdges: newEdges };
          return { ...next, ...syncProject(next) };
        });
      },

      ftaNodes: [],
      ftaEdges: [],
      onFtaNodesChange: (changes) => {
        set({ ftaNodes: applyNodeChanges(changes, get().ftaNodes) as FtaNode[] });
        const state = get();
        if (state.currentProjectId && state.user) {
          setDoc(doc(db, 'projects', state.currentProjectId), { ftaNodes: state.ftaNodes, updatedAt: Date.now() }, { merge: true }).catch(console.error);
        }
      },
      onFtaEdgesChange: (changes) => {
        set({ ftaEdges: applyEdgeChanges(changes, get().ftaEdges) as Edge[] });
        const state = get();
        if (state.currentProjectId && state.user) {
          setDoc(doc(db, 'projects', state.currentProjectId), { ftaEdges: state.ftaEdges, updatedAt: Date.now() }, { merge: true }).catch(console.error);
        }
      },
      onFtaConnect: (connection) => {
        const newEdges = addEdge(connection, get().ftaEdges);
        set({ ftaEdges: newEdges });
        const state = get();
        if (state.currentProjectId && state.user) {
          setDoc(doc(db, 'projects', state.currentProjectId), { ftaEdges: newEdges, updatedAt: Date.now() }, { merge: true }).catch(console.error);
        }
      },
      addFtaNode: (parentId, type, label) => {
        const state = get();
        const newNodeId = uuidv4();
        const newNode: FtaNode = {
          id: newNodeId,
          type: 'ftaNode',
          position: { x: 0, y: 0 }, // layout algorithm will handle this
          data: { label, type }
        };
        const newEdge: Edge = {
          id: uuidv4(),
          source: parentId,
          target: newNodeId,
          type: 'smoothstep'
        };
        const newNodes = [...state.ftaNodes, newNode];
        const newEdges = [...state.ftaEdges, newEdge];
        
        const { nodes: layoutedNodes, edges: layoutedEdges } = getFtaLayoutedElements(newNodes, newEdges);
        set({ ftaNodes: layoutedNodes, ftaEdges: layoutedEdges });
        
        if (state.currentProjectId && state.user) {
           setDoc(doc(db, 'projects', state.currentProjectId), { ftaNodes: layoutedNodes, ftaEdges: layoutedEdges, updatedAt: Date.now() }, { merge: true }).catch(console.error);
        }
      },
      updateFtaNode: (id, data) => {
        const state = get();
        const newNodes = state.ftaNodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n);
        set({ ftaNodes: newNodes });
        if (state.currentProjectId && state.user) {
           setDoc(doc(db, 'projects', state.currentProjectId), { ftaNodes: newNodes, updatedAt: Date.now() }, { merge: true }).catch(console.error);
        }
      },
      deleteFtaNode: (id) => {
        const state = get();
        if (id === 'root') return;
        const descendants = getFtaDescendants(id, state.ftaEdges);
        const toDelete = new Set([id, ...descendants]);
        const newNodes = state.ftaNodes.filter(n => !toDelete.has(n.id));
        const newEdges = state.ftaEdges.filter(e => !toDelete.has(e.source) && !toDelete.has(e.target));
        const { nodes: layoutedNodes, edges: layoutedEdges } = getFtaLayoutedElements(newNodes, newEdges);
        set({ ftaNodes: layoutedNodes, ftaEdges: layoutedEdges });
        if (state.currentProjectId && state.user) {
           setDoc(doc(db, 'projects', state.currentProjectId), { ftaNodes: layoutedNodes, ftaEdges: layoutedEdges, updatedAt: Date.now() }, { merge: true }).catch(console.error);
        }
      },

      nodes: getDefaultNodes(),
      edges: [],

      onNodesChange: (changes: NodeChange[]) => {
        set((state) => {
          const next = { ...state, nodes: applyNodeChanges(changes, state.nodes) as GoalNode[] };
          return { ...next, ...syncProject(next) };
        });
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        set((state) => {
          const next = { ...state, edges: applyEdgeChanges(changes, state.edges) };
          return { ...next, ...syncProject(next) };
        });
      },

      onConnect: (connection: Connection) => {
        set((state) => {
          const next = { ...state, edges: addEdge(connection, state.edges) };
          return { ...next, ...syncProject(next) };
        });
      },

      addGoal: (parentId, label, position) => {
        const id = uuidv4();
        let newPos = position || { x: 0, y: 0 };
        const state = get();
        const parentNode = state.nodes.find((n) => n.id === parentId);

        if (parentId && parentNode && !position) {
          const childrenIds = getDirectChildren(parentId, state.edges);
          const radius = 300;
          const angleStep = (2 * Math.PI) / Math.max(childrenIds.length + 1, 6);
          const angle = childrenIds.length * angleStep;
          newPos = {
            x: parentNode.position.x + radius * Math.cos(angle),
            y: parentNode.position.y + radius * Math.sin(angle),
          };
        }

        const newNode: GoalNode = {
          id,
          type: 'goalNode',
          position: newPos,
          hidden: parentId && parentNode ? !parentNode.data.isExpanded : false,
          data: { label, status: 'To Do', isExpanded: false },
        };

        const newEdges = parentId
          ? [
              ...state.edges,
              {
                id: `e-${parentId}-${id}`,
                source: parentId,
                target: id,
                hidden: parentNode ? !parentNode.data.isExpanded : false,
              },
            ]
          : state.edges;

        set((s) => {
          let nextNodes = [...s.nodes, newNode];
          const { nodes: updatedNodes, edges: updatedEdges } = computeVisibility(nextNodes, newEdges);
          nextNodes = getLayoutedElements(updatedNodes, updatedEdges);
          const next = { ...s, nodes: nextNodes, edges: updatedEdges };
          return { ...next, ...syncProject(next) };
        });

        if (parentId && parentNode && !parentNode.data.isExpanded) {
          get().toggleExpand(parentId);
        }
      },

      updateGoal: (id, data) => {
        set((state) => {
          let nextNodes = state.nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
          );
          
          if (data.status) {
            nextNodes = cascadeStatus(nextNodes, state.edges, id);
          }
          
          const { nodes: updatedNodes, edges: updatedEdges } = computeVisibility(nextNodes, state.edges);
          const finalNodes = getLayoutedElements(updatedNodes, updatedEdges);
          
          const next = { ...state, nodes: finalNodes, edges: updatedEdges };
          return { ...next, ...syncProject(next) };
        });
      },

      deleteGoal: (id) => {
        set((state) => {
          const descendants = getDescendants(id, state.edges);
          const toDelete = [id, ...descendants];
          const nextNodes = state.nodes.filter((node) => !toDelete.includes(node.id));
          const nextEdges = state.edges.filter(
            (edge) => !toDelete.includes(edge.source) && !toDelete.includes(edge.target)
          );
          const { nodes: updatedNodes, edges: updatedEdges } = computeVisibility(nextNodes, nextEdges);
          const finalNodes = getLayoutedElements(updatedNodes, updatedEdges);
          const next = { ...state, nodes: finalNodes, edges: updatedEdges };
          return { ...next, ...syncProject(next) };
        });
      },

      toggleExpand: (id) => {
        set((state) => {
          const parentNode = state.nodes.find((n) => n.id === id);
          if (!parentNode) return state;

          const newExpandedState = !parentNode.data.isExpanded;
          const nextNodes = state.nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, isExpanded: newExpandedState } } : node
          );
          
          const { nodes: updatedNodes, edges: updatedEdges } = computeVisibility(nextNodes, state.edges);
          const finalNodes = getLayoutedElements(updatedNodes, updatedEdges);
          const next = { ...state, nodes: finalNodes, edges: updatedEdges };
          return { ...next, ...syncProject(next) };
        });
      },

      toggleHideCompleted: (id) => {
        set((state) => {
          const parentNode = state.nodes.find((n) => n.id === id);
          if (!parentNode) return state;

          const newHideState = !parentNode.data.hideCompleted;
          const nextNodes = state.nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, hideCompleted: newHideState } } : node
          );
          
          const { nodes: updatedNodes, edges: updatedEdges } = computeVisibility(nextNodes, state.edges);
          const finalNodes = getLayoutedElements(updatedNodes, updatedEdges);
          const next = { ...state, nodes: finalNodes, edges: updatedEdges };
          return { ...next, ...syncProject(next) };
        });
      },

      loadData: (nodes, edges, fiveWhys = [], swot = [], ishikawa = [], pdca = [], waterfall = []) => set({ nodes, edges, fiveWhys, swot, ishikawa, pdca, waterfall, ...syncProject({ ...get(), nodes, edges, fiveWhys, swot, ishikawa, pdca, waterfall }) }),





      // Ishikawa Actions
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

      // PDCA Actions
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

      // Pareto Actions
      pareto: [],
      histogram: [],
          notepad: [],
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

      addHistogramProject: (_projectId, histogramId, title) => {
        set((state) => {
          const newProj: HistogramProject = { id: histogramId, title, items: [], createdAt: Date.now() };
          const next = { ...state, histogram: [...state.histogram, newProj] };
          return { ...next, ...syncProject(next) };
        });
      },
      addHistogramItem: (_projectId, histogramId, category, frequency) => {
        set((state) => {
          const newItem: HistogramItem = { id: uuidv4(), category, frequency };
          const next = {
            ...state,
            histogram: state.histogram.map(h => h.id === histogramId ? { ...h, items: [...h.items, newItem] } : h)
          };
          return { ...next, ...syncProject(next) };
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
          return { ...next, ...syncProject(next) };
        });
      },
      deleteHistogramItem: (_projectId, histogramId, itemId) => {
        set((state) => {
          const next = {
            ...state,
            histogram: state.histogram.map(h => h.id === histogramId ? { ...h, items: h.items.filter(item => item.id !== itemId) } : h)
          };
          return { ...next, ...syncProject(next) };
        });
      },
      updateHistogramTitle: (_projectId, histogramId, title) => {
        set((state) => {
          const next = {
            ...state,
            histogram: state.histogram.map(h => h.id === histogramId ? { ...h, title } : h)
          };
          return { ...next, ...syncProject(next) };
        });
      },
      deleteHistogramProject: (_projectId, histogramId) => {
        set((state) => {
          const next = { ...state, histogram: state.histogram.filter(h => h.id !== histogramId) };
          return { ...next, ...syncProject(next) };
        });
      },

      // Decision Matrix Actions
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
        set({ decision: newDecision, ...syncProject({ ...get(), decision: newDecision }) });
      },
      updateDecisionProjectName: (id, name) => {
        const newDecision = (get().decision || []).map(d => d.id === id ? { ...d, name } : d);
        set({ decision: newDecision, ...syncProject({ ...get(), decision: newDecision }) });
      },
      deleteDecisionProject: (id) => {
        const newDecision = (get().decision || []).filter(d => d.id !== id);
        set({ decision: newDecision, ...syncProject({ ...get(), decision: newDecision }) });
      },
      addDecisionCriteria: (projectId, name, weight) => {
        const newDecision = (get().decision || []).map(d => 
          d.id === projectId 
            ? { ...d, criteria: [...d.criteria, { id: uuidv4(), name, weight }] }
            : d
        );
        set({ decision: newDecision, ...syncProject({ ...get(), decision: newDecision }) });
      },
      updateDecisionCriteria: (projectId, criteriaId, name, weight) => {
        const newDecision = (get().decision || []).map(d => 
          d.id === projectId 
            ? { ...d, criteria: d.criteria.map(c => c.id === criteriaId ? { ...c, name, weight } : c) }
            : d
        );
        set({ decision: newDecision, ...syncProject({ ...get(), decision: newDecision }) });
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
        set({ decision: newDecision, ...syncProject({ ...get(), decision: newDecision }) });
      },
      addDecisionOption: (projectId, name) => {
        const newDecision = (get().decision || []).map(d => 
          d.id === projectId 
            ? { ...d, options: [...d.options, { id: uuidv4(), name, scores: {} }] }
            : d
        );
        set({ decision: newDecision, ...syncProject({ ...get(), decision: newDecision }) });
      },
      updateDecisionOptionName: (projectId, optionId, name) => {
        const newDecision = (get().decision || []).map(d => 
          d.id === projectId 
            ? { ...d, options: d.options.map(o => o.id === optionId ? { ...o, name } : o) }
            : d
        );
        set({ decision: newDecision, ...syncProject({ ...get(), decision: newDecision }) });
      },
      deleteDecisionOption: (projectId, optionId) => {
        const newDecision = (get().decision || []).map(d => 
          d.id === projectId 
            ? { ...d, options: d.options.filter(o => o.id !== optionId) }
            : d
        );
        set({ decision: newDecision, ...syncProject({ ...get(), decision: newDecision }) });
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
        set({ decision: newDecision, ...syncProject({ ...get(), decision: newDecision }) });
      },

      // Waterfall Actions
      waterfall: [],
      addWaterfallProject: (name) => {
        const newItem: WaterfallProject = {
          id: uuidv4(),
          name,
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
      }
    }),
    {
      name: 'roadmap-storage',
    }
  )
);
