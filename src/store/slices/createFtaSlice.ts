import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { NodeChange, EdgeChange, Connection, Edge, Node } from '@xyflow/react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import dagre from 'dagre';
import type { RoadmapState } from '../useRoadmapStore';

export type FtaNodeType = 'topEvent' | 'event' | 'andGate' | 'orGate' | 'basicEvent';

export type FtaNodeData = {
  label: string;
  type: FtaNodeType;
  description?: string;
};

export type FtaNode = Node<FtaNodeData>;

export interface FtaSlice {
  ftaNodes: FtaNode[];
  ftaEdges: Edge[];
  onFtaNodesChange: (changes: NodeChange[]) => void;
  onFtaEdgesChange: (changes: EdgeChange[]) => void;
  onFtaConnect: (connection: Connection) => void;
  addFtaNode: (parentId: string, type: FtaNodeType, label: string) => void;
  updateFtaNode: (id: string, data: Partial<FtaNodeData>) => void;
  deleteFtaNode: (id: string) => void;
}

export const getFtaDescendants = (id: string, edges: Edge[]): string[] => {
  const children = edges.filter(e => e.source === id).map(e => e.target);
  return children.reduce((acc, child) => [...acc, child, ...getFtaDescendants(child, edges)], [] as string[]);
};

export const getFtaLayoutedElements = (nodes: FtaNode[], edges: Edge[]) => {
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

export const createFtaSlice: StateCreator<
  RoadmapState,
  [],
  [],
  FtaSlice
> = (set, get) => ({
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
      position: { x: 0, y: 0 },
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
});
