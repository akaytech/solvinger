import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import type { NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRoadmapStore } from '../store/useRoadmapStore';
import FtaNode from './FtaNode';
import FtaContextMenu from './FtaContextMenu';

const nodeTypes = {
  ftaNode: FtaNode,
};

export default function FtaCanvas() {
  const { ftaNodes, ftaEdges, onFtaNodesChange, onFtaEdgesChange, onFtaConnect, addFtaNode, updateFtaNode, deleteFtaNode } = useRoadmapStore();
  const { setCenter, getZoom } = useReactFlow();
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    document.dispatchEvent(new Event('close-menus'));
    // Smooth pan to clicked node
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
        nodes={ftaNodes}
        edges={ftaEdges}
        onNodesChange={onFtaNodesChange}
        onEdgesChange={onFtaEdgesChange}
        onConnect={onFtaConnect}
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
        <MiniMap position="bottom-right" className="dark:bg-slate-800 bg-white" maskColor="var(--minimap-mask, rgba(200, 200, 225, 0.2))" nodeColor="var(--minimap-node, #a5b4fc)" zoomable pannable />
        <Background color="#cbd5e1" gap={24} size={2} />
      </ReactFlow>

      {menu && (
        <FtaContextMenu
          x={menu.left}
          y={menu.top}
          node={ftaNodes.find((n) => n.id === menu.id)!}
          onClose={() => setMenu(null)}
          onAddNode={(type, label) => {
             addFtaNode(menu.id, type, label);
             setMenu(null);
          }}
          onUpdate={(data) => updateFtaNode(menu.id, data)}
          onDelete={() => {
             deleteFtaNode(menu.id);
             setMenu(null);
          }}
        />
      )}
    </div>
  );
}
