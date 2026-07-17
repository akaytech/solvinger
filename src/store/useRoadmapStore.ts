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

interface FiveWhysAnalysis {
  id: string;
  problemStatement: string;
  whys: string[];
  rootCause: string;
  createdAt: number;
}

export type SwotType = 'S' | 'W' | 'O' | 'T';

interface SwotItem {
  id: string;
  type: SwotType;
  text: string;
  createdAt: number;
}

interface SwotAnalysis {
  id: string;
  title: string;
  items: SwotItem[];
  createdAt: number;
}

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
  updatedAt: number;
  userId: string;
}

interface RoadmapState {
  // Auth
  user: { uid: string; email: string; name: string; photoURL?: string } | null;
  login: (uid: string, email: string, name: string, photoURL?: string) => void;
  logout: () => void;

  // UI State
  activeTool: 'wbs' | '5whys' | 'swot' | 'ishikawa' | 'pdca' | 'waterfall' | null;
  setActiveTool: (tool: 'wbs' | '5whys' | 'swot' | 'ishikawa' | 'pdca' | 'waterfall' | null) => void;

  // Projects
  projects: Project[];
  currentProjectId: string | null;
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (name: string) => void;
  loadProject: (id: string) => void;
  updateProjectName: (id: string, name: string) => void;
  deleteProject: (id: string) => void;

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

  // 5 Whys State
  fiveWhys: FiveWhysAnalysis[];
  addFiveWhys: (problemStatement: string) => void;
  updateFiveWhys: (id: string, data: Partial<FiveWhysAnalysis>) => void;
  deleteFiveWhys: (id: string) => void;

  // SWOT State
  swot: SwotAnalysis[];
  addSwot: (title: string) => void;
  updateSwotTitle: (id: string, title: string) => void;
  deleteSwot: (id: string) => void;
  addSwotItem: (analysisId: string, type: SwotType, text: string) => void;
  updateSwotItem: (analysisId: string, itemId: string, text: string) => void;
  deleteSwotItem: (analysisId: string, itemId: string) => void;

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

const syncProject = (state: RoadmapState): Partial<RoadmapState> => {
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

const defaultNodes: GoalNode[] = [
  {
    id: 'root',
    type: 'goalNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Yeni Proje',
      status: 'To Do',
      isExpanded: true,
    },
  },
];

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (uid, email, name, photoURL) => set({ user: { uid, email, name, photoURL } }),
      logout: () => set({ user: null, projects: [], currentProjectId: null, nodes: [], edges: [], fiveWhys: [], swot: [], ishikawa: [], pdca: [], waterfall: [], activeTool: null }),

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
                title: 'Varsayılan SWOT Analizi',
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

      createProject: (name) => {
        const state = get();
        if (!state.user) return;

        const id = uuidv4();
        const newProject: Project = {
          id,
          name,
          nodes: defaultNodes,
          edges: [],
          fiveWhys: [],
          swot: [],
          ishikawa: [],
          pdca: [],
          waterfall: [],
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
        }));
      },

      loadProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          let safeSwot = project.swot || [];
          if (safeSwot.length > 0 && 'type' in safeSwot[0]) {
            safeSwot = [{
              id: 'migrated-swot',
              title: 'Varsayılan SWOT Analizi',
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
          };
        });
      },

      nodes: defaultNodes,
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

      // 5 Whys Actions
      fiveWhys: [],
      addFiveWhys: (problemStatement) => {
        const newItem: FiveWhysAnalysis = {
          id: uuidv4(),
          problemStatement,
          whys: ['', '', '', '', ''],
          rootCause: '',
          createdAt: Date.now(),
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
      },

      // SWOT Actions
      swot: [],
      addSwot: (title) => {
        const newItem: SwotAnalysis = {
          id: uuidv4(),
          title,
          items: [],
          createdAt: Date.now(),
        };
        const newSwot = [newItem, ...get().swot];
        set({ swot: newSwot, ...syncProject({ ...get(), swot: newSwot }) });
      },
      updateSwotTitle: (id, title) => {
        const newSwot = get().swot.map(s => s.id === id ? { ...s, title } : s);
        set({ swot: newSwot, ...syncProject({ ...get(), swot: newSwot }) });
      },
      deleteSwot: (id) => {
        const newSwot = get().swot.filter(s => s.id !== id);
        set({ swot: newSwot, ...syncProject({ ...get(), swot: newSwot }) });
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
        set({ swot: newSwot, ...syncProject({ ...get(), swot: newSwot }) });
      },
      updateSwotItem: (analysisId, itemId, text) => {
        const newSwot = get().swot.map(analysis => 
          analysis.id === analysisId 
            ? { ...analysis, items: analysis.items.map(i => i.id === itemId ? { ...i, text } : i) } 
            : analysis
        );
        set({ swot: newSwot, ...syncProject({ ...get(), swot: newSwot }) });
      },
      deleteSwotItem: (analysisId, itemId) => {
        const newSwot = get().swot.map(analysis => 
          analysis.id === analysisId 
            ? { ...analysis, items: analysis.items.filter(i => i.id !== itemId) } 
            : analysis
        );
        set({ swot: newSwot, ...syncProject({ ...get(), swot: newSwot }) });
      },

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
