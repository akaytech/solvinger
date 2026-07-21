import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useShallow } from 'zustand/react/shallow';
import FlowchartNode from './FlowchartNode';
import FlowchartContextMenu from './FlowchartContextMenu';

const nodeTypes = {
  flowchartNode: FlowchartNode,
};

export default function FlowchartCanvas() {
  const {  flowchartNodes, flowchartEdges, onFlowchartNodesChange, onFlowchartEdgesChange, onFlowchartConnect, addFlowchartNode, updateFlowchartNode, deleteFlowchartNode  } = useRoadmapStore(useShallow((state) => ({
      flowchartNodes: state.flowchartNodes,
      flowchartEdges: state.flowchartEdges,
      onFlowchartNodesChange: state.onFlowchartNodesChange,
      onFlowchartEdgesChange: state.onFlowchartEdgesChange,
      onFlowchartConnect: state.onFlowchartConnect,
      addFlowchartNode: state.addFlowchartNode,
      updateFlowchartNode: state.updateFlowchartNode,
      deleteFlowchartNode: state.deleteFlowchartNode
    })));
  const { setCenter, getZoom } = useReactFlow();
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Auto-initialize if empty
  useEffect(() => {
    if (!flowchartNodes || flowchartNodes.length === 0) {
      // Small timeout to let React Flow initialize
      setTimeout(() => {
        addFlowchartNode(null, 'start', t('flowchart_start'), { x: 0, y: 0 });
      }, 50);
    }
  }, [flowchartNodes, addFlowchartNode, t]);

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
    <div className="flex-1 h-full w-full relative transition-colors bg-slate-50 dark:bg-slate-900" ref={reactFlowWrapper}>
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
        <MiniMap zoomable pannable position="bottom-right"
          className="!w-48 !h-48 !rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-2xl dark:bg-slate-800 bg-white" 
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
