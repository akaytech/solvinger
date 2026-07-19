import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  useReactFlow,
  Controls,
  MiniMap
} from '@xyflow/react';
import type { NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRoadmapStore } from '../store/useRoadmapStore';
import FlowchartNode from './FlowchartNode';
import FlowchartContextMenu from './FlowchartContextMenu';

const nodeTypes = {
  flowchartNode: FlowchartNode,
};

export default function FlowchartCanvas() {
  const { flowchartNodes, flowchartEdges, onFlowchartNodesChange, onFlowchartEdgesChange, onFlowchartConnect, addFlowchartNode, updateFlowchartNode, deleteFlowchartNode } = useRoadmapStore();
  const { setCenter, getZoom } = useReactFlow();
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    document.dispatchEvent(new Event('close-menus'));
    setCenter(node.position.x + 90, node.position.y + 40, { zoom: getZoom(), duration: 800 });
  }, [setCenter, getZoom]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      event.stopPropagation();
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (bounds) {
        let left = event.clientX - bounds.left;
        let top = event.clientY - bounds.top;
        
        const menuWidth = 256; 
        const menuHeight = 350;
        
        if (left + menuWidth > bounds.width) left -= menuWidth;
        if (top + menuHeight > bounds.height) top -= menuHeight;
        
        left = Math.max(10, left);
        top = Math.max(10, top);

        setMenu({
          id: node.id,
          top,
          left,
        });
      }
    },
    []
  );

  const onPaneClick = useCallback(() => {
    document.dispatchEvent(new Event('close-menus'));
    setMenu(null);
  }, []);

  return (
    <div className="h-full w-full relative bg-slate-50 dark:bg-slate-900 transition-colors" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={flowchartNodes}
        edges={flowchartEdges}
        onNodesChange={onFlowchartNodesChange}
        onEdgesChange={onFlowchartEdgesChange}
        onConnect={onFlowchartConnect}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        fitView
        deleteKeyCode={['Delete']}
        fitViewOptions={{ duration: 1000 }}
        minZoom={0.1}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 3, stroke: '#94a3b8' },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={24} size={2} />
        <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 fill-slate-700 dark:fill-slate-300 shadow-xl" />
        <MiniMap 
          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mask-image-rounded shadow-xl" 
          nodeColor={(n) => {
            if (n.data?.shape === 'start' || n.data?.shape === 'end') return '#10b981';
            if (n.data?.shape === 'decision') return '#f59e0b';
            return '#3b82f6';
          }}
        />
      </ReactFlow>

      {menu && (
        <FlowchartContextMenu
          x={menu.left}
          y={menu.top}
          node={flowchartNodes.find((n) => n.id === menu.id)!}
          onClose={() => setMenu(null)}
          onAddNode={(shape, label) => {
             // Let's place the new node roughly below the parent node
             const parentNode = flowchartNodes.find(n => n.id === menu.id);
             const pos = parentNode ? { x: parentNode.position.x, y: parentNode.position.y + 150 } : { x: 0, y: 0 };
             addFlowchartNode(menu.id, shape, label, pos);
             setMenu(null);
          }}
          onUpdate={(data) => updateFlowchartNode(menu.id, data)}
          onDelete={() => {
             deleteFlowchartNode(menu.id);
             setMenu(null);
          }}
        />
      )}
    </div>
  );
}
