import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { Edge, NodeChange, EdgeChange, Connection, Node } from '@xyflow/react';
import dagre from 'dagre';
import i18n from '../../i18n';
import { syncProject } from '../useRoadmapStore';
import type { RoadmapState } from '../useRoadmapStore';
import type { FiveWhysAnalysis, SwotAnalysis, IshikawaAnalysis, PdcaCycle, WaterfallProject } from '../useRoadmapStore';

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

export interface WbsSlice {
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

  const rootNodes = visibleNodes.filter(n => !visibleEdges.some(e => e.target === n.id));
  const offsets = new Map<string, { dx: number; dy: number }>();

  rootNodes.forEach(root => {
    const dagreNode = dagreGraph.node(root.id);
    if (!dagreNode) return;
    const dx = root.position.x - (dagreNode.x - 220);
    const dy = root.position.y - (dagreNode.y - 55);

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

export const getDefaultNodes = (): GoalNode[] => [
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

export const createWbsSlice: StateCreator<
  RoadmapState,
  [],
  [],
  WbsSlice
> = (set, get) => ({
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

  loadData: (nodes, edges, fiveWhys = [], swot = [], ishikawa = [], pdca = [], waterfall = []) => 
    set((state) => {
      const next = { ...state, nodes, edges, fiveWhys, swot, ishikawa, pdca, waterfall };
      return { ...next, ...syncProject(next) };
    }),

});
