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

export type GoalStatus = 'To Do' | 'In Progress' | 'Done' | 'Failed';

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

export interface Project {
  id: string;
  name: string;
  nodes: GoalNode[];
  edges: Edge[];
  updatedAt: number;
  userId: string;
}

interface RoadmapState {
  // Auth
  user: { uid: string; email: string; name: string } | null;
  login: (uid: string, email: string, name: string) => void;
  logout: () => void;

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
  loadData: (nodes: GoalNode[], edges: Edge[]) => void;
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
    
    // If any child failed, we could technically mark parent as failed or in progress. Let's keep it simple: 
    // Status cascade logic: If all done, done. If any in progress or done, in progress. 
    // If any failed, maybe keep it in progress unless user manually sets to failed. 
    // User requested manually setting it. So I won't auto-cascade 'Failed' unless desired.
    if (anyFailed && newStatus !== 'Failed') {
       newStatus = 'Failed';
    } else if (allDone && !anyFailed) {
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
      label: 'Ana Görev',
      status: 'In Progress',
      isExpanded: true,
    },
  },
];

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (uid, email, name) => set({ user: { uid, email, name } }),
      logout: () => set({ user: null, projects: [], currentProjectId: null, nodes: [], edges: [] }),

      projects: [],
      currentProjectId: null,

      fetchProjects: async (userId) => {
        try {
          const q = query(collection(db, 'projects'), where('userId', '==', userId));
          const snapshot = await getDocs(q);
          const fetchedProjects = snapshot.docs.map(doc => doc.data() as Project);
          
          set({ projects: fetchedProjects });
        } catch (error) {
          console.error("Fetch projects error:", error);
        }
      },

      createProject: (name) => {
        const state = get();
        if (!state.user) return;

        const newProject: Project = {
          id: uuidv4(),
          name,
          nodes: defaultNodes,
          edges: [],
          updatedAt: Date.now(),
          userId: state.user.uid,
        };

        // Save immediately
        setDoc(doc(db, 'projects', newProject.id), newProject).catch(console.error);

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: newProject.id,
          nodes: newProject.nodes,
          edges: newProject.edges,
        }));
      },

      loadProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          set({
            currentProjectId: id,
            nodes: project.nodes,
            edges: project.edges,
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
            nodes: isCurrent ? [] : state.nodes,
            edges: isCurrent ? [] : state.edges,
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
          const next = { ...s, nodes: [...s.nodes, newNode], edges: newEdges };
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
          
          const next = { ...state, nodes: updatedNodes, edges: updatedEdges };
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
          const next = { ...state, nodes: nextNodes, edges: nextEdges };
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

          const next = { ...state, nodes: updatedNodes, edges: updatedEdges };
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

          const next = { ...state, nodes: updatedNodes, edges: updatedEdges };
          return { ...next, ...syncProject(next) };
        });
      },

      loadData: (nodes, edges) => {
        set((state) => {
          const next = { ...state, nodes, edges };
          return { ...next, ...syncProject(next) };
        });
      },
    }),
    {
      name: 'roadmap-storage',
    }
  )
);
