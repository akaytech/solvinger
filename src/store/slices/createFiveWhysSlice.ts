import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Edge,
  Node,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from '@xyflow/react';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import dagre from 'dagre';
import type { RoadmapState } from '../useRoadmapStore';

export type FiveWhysNodeType = 'problem' | 'why' | 'solution';

export interface FiveWhysNodeData extends Record<string, unknown> {
  label: string;
  type: FiveWhysNodeType;
  depth: number;
}

export type FiveWhysNode = Node<FiveWhysNodeData>;

export interface FiveWhysSlice {
  fiveWhysNodes: FiveWhysNode[];
  fiveWhysEdges: Edge[];
  onFiveWhysNodesChange: OnNodesChange<FiveWhysNode>;
  onFiveWhysEdgesChange: OnEdgesChange;
  onFiveWhysConnect: OnConnect;
  addFiveWhysNode: (parentId: string | null, type: FiveWhysNodeType, label: string, position?: { x: number; y: number }) => void;
  updateFiveWhysNode: (id: string, data: Partial<FiveWhysNodeData>) => void;
  deleteFiveWhysNode: (id: string) => void;
}

const getFiveWhysDescendants = (id: string, edges: Edge[]): string[] => {
  const children = edges.filter(e => e.source === id).map(e => e.target);
  return children.reduce((acc, child) => [...acc, child, ...getFiveWhysDescendants(child, edges)], [] as string[]);
};

const getFiveWhysLayoutedElements = (nodes: FiveWhysNode[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 80 }); 

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 320, height: 140 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 320 / 2,
        y: nodeWithPosition.y - 140 / 2,
      },
    };
  });

  return { layoutedNodes, layoutedEdges: edges };
};

export const createFiveWhysSlice: StateCreator<
  RoadmapState,
  [],
  [],
  FiveWhysSlice
> = (set) => ({
  fiveWhysNodes: [],
  fiveWhysEdges: [],
  onFiveWhysNodesChange: (changes) => {
    set((state) => {
      const nextNodes = applyNodeChanges(changes, state.fiveWhysNodes) as FiveWhysNode[];
      const next = { ...state, fiveWhysNodes: nextNodes };
      return { ...next };
    });
  },
  onFiveWhysEdgesChange: (changes) => {
    set((state) => {
      const nextEdges = applyEdgeChanges(changes, state.fiveWhysEdges);
      const next = { ...state, fiveWhysEdges: nextEdges };
      return { ...next };
    });
  },
  onFiveWhysConnect: (connection: Connection) => {
    set((state) => {
      const nextEdges = addEdge({ ...connection, type: 'smoothstep', animated: true, style: { strokeWidth: 3, stroke: '#94a3b8' } }, state.fiveWhysEdges);
      const { layoutedNodes, layoutedEdges } = getFiveWhysLayoutedElements(state.fiveWhysNodes, nextEdges);
      const next = { ...state, fiveWhysNodes: layoutedNodes, fiveWhysEdges: layoutedEdges };
      return { ...next };
    });
  },
  addFiveWhysNode: (parentId, type, label, position) => {
    set((state) => {
      const parentNode = parentId ? state.fiveWhysNodes.find(n => n.id === parentId) : null;
      const depth = parentNode ? (parentNode.data.depth + 1) : 0;
      
      const newNode: FiveWhysNode = {
        id: uuidv4(),
        type: 'fiveWhysNode',
        position: position || { x: 0, y: 0 },
        data: { label, type, depth }
      };

      const newNodes = [...state.fiveWhysNodes, newNode];
      let newEdges = [...state.fiveWhysEdges];

      if (parentId) {
        newEdges.push({
          id: uuidv4(),
          source: parentId,
          target: newNode.id,
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 3, stroke: '#94a3b8' }
        });
      }

      const { layoutedNodes, layoutedEdges } = getFiveWhysLayoutedElements(newNodes, newEdges);
      const next = { ...state, fiveWhysNodes: layoutedNodes, fiveWhysEdges: layoutedEdges };
      return { ...next };
    });
  },
  updateFiveWhysNode: (id, data) => {
    set((state) => {
      const newNodes = state.fiveWhysNodes.map(node => 
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      );
      const next = { ...state, fiveWhysNodes: newNodes };
      return { ...next };
    });
  },
  deleteFiveWhysNode: (id) => {
    set((state) => {
      const descendants = getFiveWhysDescendants(id, state.fiveWhysEdges);
      const toDelete = [id, ...descendants];
      
      const newNodes = state.fiveWhysNodes.filter(n => !toDelete.includes(n.id));
      const newEdges = state.fiveWhysEdges.filter(e => !toDelete.includes(e.source) && !toDelete.includes(e.target));
      
      const { layoutedNodes, layoutedEdges } = getFiveWhysLayoutedElements(newNodes, newEdges);
      const next = { ...state, fiveWhysNodes: layoutedNodes, fiveWhysEdges: layoutedEdges };
      return { ...next };
    });
  }
});
