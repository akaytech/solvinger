import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';
import ToolHeader from './ToolHeader';

import FiveWhysNode from './FiveWhysNode';
import FiveWhysContextMenu from './FiveWhysContextMenu';

const nodeTypes = {
  fiveWhysNode: FiveWhysNode,
};

function FiveWhysCanvasInner() {
  const { t } = useTranslation();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);

  const {
    fiveWhysNodes,
    fiveWhysEdges,
    onFiveWhysNodesChange,
    onFiveWhysEdgesChange,
    onFiveWhysConnect,
    addFiveWhysNode,
    updateFiveWhysNode,
    deleteFiveWhysNode
  } = useRoadmapStore(useShallow((state) => ({
    fiveWhysNodes: state.fiveWhysNodes || [],
    fiveWhysEdges: state.fiveWhysEdges || [],
    onFiveWhysNodesChange: state.onFiveWhysNodesChange,
    onFiveWhysEdgesChange: state.onFiveWhysEdgesChange,
    onFiveWhysConnect: state.onFiveWhysConnect,
    addFiveWhysNode: state.addFiveWhysNode,
    updateFiveWhysNode: state.updateFiveWhysNode,
    deleteFiveWhysNode: state.deleteFiveWhysNode
  })));

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (pane) {
        setMenu({
          id: node.id,
          top: event.clientY - pane.top,
          left: event.clientX - pane.left,
        });
      }
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      <ToolHeader title={t('tool_5whys')} subtitle={t('whys_subtitle')} icon={<Activity />} iconColor="text-indigo-500" />
      
      <div className="flex-1 w-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={fiveWhysNodes}
          edges={fiveWhysEdges}
          onNodesChange={onFiveWhysNodesChange}
          onEdgesChange={onFiveWhysEdgesChange}
          onConnect={onFiveWhysConnect}
          nodeTypes={nodeTypes}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { strokeWidth: 3, stroke: '#94a3b8' },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap position="bottom-right" className="!w-48 !h-48 !rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-2xl dark:bg-slate-800 bg-white" maskColor="var(--minimap-mask, rgba(200, 200, 225, 0.2))" nodeColor="var(--minimap-node, #a5b4fc)" zoomable pannable />
          <Background color="#cbd5e1" gap={24} size={2} />
          
          {fiveWhysNodes.length === 0 && (
             <Panel position="top-center" className="mt-20">
               <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-2xl text-center max-w-md">
                 <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <Activity size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                   {t('whys_empty')}
                 </h3>
                 <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                   Kanvasa ilk "Ana Sorun" düğümünü ekleyerek analize başlayın.
                 </p>
                 <button
                   onClick={() => addFiveWhysNode(null, 'problem', t('whys_placeholder'))}
                   className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                 >
                   Ana Sorun Ekle
                 </button>
               </div>
             </Panel>
          )}
        </ReactFlow>

        {menu && (
          <FiveWhysContextMenu
            x={menu.left}
            y={menu.top}
            node={fiveWhysNodes.find((n) => n.id === menu.id)!}
            onClose={() => setMenu(null)}
            onAddNode={(type, label) => {
              addFiveWhysNode(menu.id, type, label);
              setMenu(null);
            }}
            onUpdate={(data) => updateFiveWhysNode(menu.id, data)}
            onDelete={() => {
              deleteFiveWhysNode(menu.id);
              setMenu(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function FiveWhysCanvas() {
  return (
    <ReactFlowProvider>
      <FiveWhysCanvasInner />
    </ReactFlowProvider>
  );
}
