import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import type { NodeMouseHandler, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRoadmapStore, getDescendants } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import GoalNode from './GoalNode';
import ContextMenu from './ContextMenu';
import PaneContextMenu from './PaneContextMenu';
import InlineDescriptionMenu from './InlineDescriptionMenu';
import { useTranslation } from 'react-i18next';

const nodeTypes = {
  goalNode: GoalNode,
};

const getDepth = (id: string, edges: Edge[]): number => {
  let depth = 0;
  let curr = id;
  while (curr) {
    const parentEdge = edges.find(e => e.target === curr);
    if (!parentEdge) break;
    curr = parentEdge.source;
    depth++;
  }
  return depth;
};

export default function RoadmapCanvas({ onNodeSelect }: { onNodeSelect: (id: string | null) => void }) {
  const { t } = useTranslation();
  const {  nodes, edges, onNodesChange, onEdgesChange, onConnect, toggleExpand, addGoal, updateGoal, deleteGoal  } = useRoadmapStore(useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      toggleExpand: state.toggleExpand,
      addGoal: state.addGoal,
      updateGoal: state.updateGoal,
      deleteGoal: state.deleteGoal
    })));
  const { setCenter, getZoom, screenToFlowPosition } = useReactFlow();
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [paneMenu, setPaneMenu] = useState<{ top: number; left: number; clientX: number; clientY: number } | null>(null);
  const [inlineDescription, setInlineDescription] = useState<{ id: string; top: number; left: number } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    document.dispatchEvent(new Event('close-menus'));
    if (event.ctrlKey || event.metaKey) {
       const depth = getDepth(node.id, edges);
       const label = depth === 0 ? t('new_task') : t('new_subtask');
       addGoal(node.id, label);
       return;
    }
    
    onNodeSelect(node.id);
    toggleExpand(node.id);
    
    // Smooth pan to clicked node like a daisy focusing
    setCenter(node.position.x + 220, node.position.y + 55, { zoom: getZoom(), duration: 800 });
  }, [addGoal, onNodeSelect, toggleExpand, setCenter, getZoom, t, edges]);

  const onNodeDragStart = useCallback((_event: any, node: any) => {
    if (isShiftPressed) {
      const descendants = getDescendants(node.id, edges);
      const changes: any[] = descendants.map(id => ({ id, type: 'select', selected: true }));
      // Also select the node itself just in case
      changes.push({ id: node.id, type: 'select', selected: true });
      onNodesChange(changes);
    }
  }, [edges, isShiftPressed, onNodesChange]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      event.stopPropagation();
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (bounds) {
        let left = event.clientX - bounds.left;
        let top = event.clientY - bounds.top;
        
        const menuWidth = 256; // 64 * 4px
        const menuHeight = 480;
        
        if (left + menuWidth > bounds.width) left -= menuWidth;
        if (top + menuHeight > bounds.height) top -= menuHeight;
        
        left = Math.max(10, left);
        top = Math.max(10, top);

        setMenu({
          id: node.id,
          top,
          left,
        });
        setPaneMenu(null);
        setInlineDescription(null);
      }
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (bounds) {
        let left = event.clientX - bounds.left;
        let top = event.clientY - bounds.top;
        
        const menuWidth = 224; // 56 * 4px
        const menuHeight = 150;
        
        if (left + menuWidth > bounds.width) left -= menuWidth;
        if (top + menuHeight > bounds.height) top -= menuHeight;
        
        left = Math.max(10, left);
        top = Math.max(10, top);

        setPaneMenu({
          top,
          left,
          clientX: event.clientX,
          clientY: event.clientY,
        });
        setMenu(null);
      }
    },
    []
  );

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    document.dispatchEvent(new Event('close-menus'));
    if (event.ctrlKey || event.metaKey) {
       const pos = screenToFlowPosition({
         x: event.clientX,
         y: event.clientY,
       });
       addGoal(null, t('new_project_node'), pos);
    }
    setMenu(null);
    setPaneMenu(null);
    setInlineDescription(null);
    onNodeSelect(null);
  }, [onNodeSelect, screenToFlowPosition, addGoal, t]);

  return (
    <div className="h-full w-full relative bg-slate-50 dark:bg-slate-900 transition-colors" ref={reactFlowWrapper} onContextMenu={onPaneContextMenu as any}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onNodeDragStart={onNodeDragStart}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        fitView
        deleteKeyCode={['Delete']}
        fitViewOptions={{ duration: 1000 }}
        minZoom={0.1}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 4, stroke: '#94a3b8' },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap position="bottom-right" className="!w-48 !h-48 !rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-2xl dark:bg-slate-800 bg-white" maskColor="var(--minimap-mask, rgba(200, 200, 225, 0.2))" nodeColor="var(--minimap-node, #a5b4fc)" zoomable pannable />
        <Background color="#cbd5e1" gap={24} size={2} />
      </ReactFlow>

      {menu && (
        <ContextMenu
          x={menu.left}
          y={menu.top}
          node={nodes.find((n) => n.id === menu.id)!}
          onClose={() => setMenu(null)}
          onAddSubGoal={() => {
            const depth = getDepth(menu.id, edges);
            const label = depth === 0 ? t('new_task') : t('new_subtask');
            addGoal(menu.id, label);
          }}
          onUpdate={(data) => updateGoal(menu.id, data)}
          onOpenDescription={() => {
            setInlineDescription({ id: menu.id, top: menu.top, left: menu.left });
            setMenu(null);
          }}
          onDelete={() => deleteGoal(menu.id)}
        />
      )}

      {paneMenu && (
        <PaneContextMenu
          x={paneMenu.left}
          y={paneMenu.top}
          onClose={() => setPaneMenu(null)}
          onAddRootGoal={() => {
            const pos = screenToFlowPosition({
              x: paneMenu.clientX,
              y: paneMenu.clientY,
            });
            addGoal(null, t('new_project_node'), pos);
            setPaneMenu(null);
          }}
        />
      )}

      {inlineDescription && (
        <InlineDescriptionMenu
          x={inlineDescription.left}
          y={inlineDescription.top}
          node={nodes.find((n) => n.id === inlineDescription.id)!}
          onClose={() => setInlineDescription(null)}
          onSave={(text) => updateGoal(inlineDescription.id, { description: text })}
        />
      )}
    </div>
  );
}
