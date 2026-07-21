import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { NodeChange, EdgeChange, Connection, Edge, Node } from '@xyflow/react';
import { syncProject } from '../useRoadmapStore';
import type { RoadmapState } from '../useRoadmapStore';

export type FlowchartNodeType = 'start' | 'process' | 'decision' | 'end';

export type FlowchartNodeData = {
  label: string;
  shape: FlowchartNodeType;
};

export type FlowchartNode = Node<FlowchartNodeData>;

export interface FlowchartSlice {
  flowchartNodes: FlowchartNode[];
  flowchartEdges: Edge[];
  onFlowchartNodesChange: (changes: NodeChange[]) => void;
  onFlowchartEdgesChange: (changes: EdgeChange[]) => void;
  onFlowchartConnect: (connection: Connection) => void;
  addFlowchartNode: (parentId: string | null, shape: FlowchartNodeType, label: string, position: {x: number, y: number}) => void;
  updateFlowchartNode: (id: string, data: Partial<FlowchartNodeData>) => void;
  deleteFlowchartNode: (id: string) => void;
}

export const createFlowchartSlice: StateCreator<
  RoadmapState,
  [],
  [],
  FlowchartSlice
> = (set) => ({
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
});
