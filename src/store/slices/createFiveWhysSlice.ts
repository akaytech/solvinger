import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { logAppEvent } from '../../firebase';
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
  loadFiveWhysExample: () => void;
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
    logAppEvent('node_created', { tool: '5whys', type });
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
      
      const newNodes = state.fiveWhysNodes.filter(node => !toDelete.includes(node.id));
      const newEdges = state.fiveWhysEdges.filter(edge => !toDelete.includes(edge.source) && !toDelete.includes(edge.target));
      
      const { layoutedNodes, layoutedEdges } = getFiveWhysLayoutedElements(newNodes, newEdges);
      const next = { ...state, fiveWhysNodes: layoutedNodes, fiveWhysEdges: layoutedEdges };
      return { ...next };
    });
  },
  loadFiveWhysExample: () => {
    set((state) => {
      const pId = uuidv4();
      const w1Id = uuidv4();
      const w2Id = uuidv4();
      const w3Id = uuidv4();
      const w4Id = uuidv4();
      const sId = uuidv4();

      const nodes: FiveWhysNode[] = [
        { id: pId, type: 'fiveWhysNode', position: { x: 0, y: 0 }, data: { label: 'Örnek: Müşteri teslimatları sürekli gecikiyor', type: 'problem', depth: 0 } },
        { id: w1Id, type: 'fiveWhysNode', position: { x: 0, y: 0 }, data: { label: 'Neden? Çünkü ürün kargoya geç teslim ediliyor', type: 'why', depth: 1 } },
        { id: w2Id, type: 'fiveWhysNode', position: { x: 0, y: 0 }, data: { label: 'Neden? Çünkü paketleme servisi yavaş çalışıyor', type: 'why', depth: 2 } },
        { id: w3Id, type: 'fiveWhysNode', position: { x: 0, y: 0 }, data: { label: 'Neden? Çünkü paketleme makinesi sık sık bozuluyor', type: 'why', depth: 3 } },
        { id: w4Id, type: 'fiveWhysNode', position: { x: 0, y: 0 }, data: { label: 'Neden? Makinenin periyodik bakımları yapılmamış (Kök Neden)', type: 'why', depth: 4 } },
        { id: sId, type: 'fiveWhysNode', position: { x: 0, y: 0 }, data: { label: 'Çözüm: Bakım periyodunu dijital takvime bağla', type: 'solution', depth: 5 } },
      ];

      const edges: Edge[] = [
        { id: uuidv4(), source: pId, target: w1Id, type: 'smoothstep', animated: true, style: { strokeWidth: 3, stroke: '#94a3b8' } },
        { id: uuidv4(), source: w1Id, target: w2Id, type: 'smoothstep', animated: true, style: { strokeWidth: 3, stroke: '#94a3b8' } },
        { id: uuidv4(), source: w2Id, target: w3Id, type: 'smoothstep', animated: true, style: { strokeWidth: 3, stroke: '#94a3b8' } },
        { id: uuidv4(), source: w3Id, target: w4Id, type: 'smoothstep', animated: true, style: { strokeWidth: 3, stroke: '#94a3b8' } },
        { id: uuidv4(), source: w4Id, target: sId, type: 'smoothstep', animated: true, style: { strokeWidth: 3, stroke: '#94a3b8' } },
      ];

      const { layoutedNodes, layoutedEdges } = getFiveWhysLayoutedElements(nodes, edges);
      return { ...state, fiveWhysNodes: layoutedNodes, fiveWhysEdges: layoutedEdges };
    });
  }
});
