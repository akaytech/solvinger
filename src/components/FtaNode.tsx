import { memo, useMemo } from 'react';
import { Handle, Position, type Edge } from '@xyflow/react';
import clsx from 'clsx';
import { AlertOctagon, Box, CircleDot, Component, Diamond, Filter, Hexagon, GitBranch, ListOrdered } from 'lucide-react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import type { FtaNodeData, FtaNode as FtaNodeType } from '../store/useRoadmapStore';

const calculateProbability = (nodeId: string, nodes: FtaNodeType[], edges: Edge[]): number | undefined => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return undefined;

  if (['basicEvent', 'undevelopedEvent', 'conditioningEvent'].includes(node.data.type)) {
    return node.data.probability;
  }

  const childrenEdges = edges.filter(e => e.source === nodeId);
  if (childrenEdges.length === 0) return node.data.probability;

  const childrenProbs = childrenEdges
    .map(e => calculateProbability(e.target, nodes, edges))
    .filter(p => p !== undefined) as number[];

  if (childrenProbs.length === 0) return node.data.probability;

  if (node.data.type === 'andGate' || node.data.type === 'priorityAndGate' || node.data.type === 'inhibitGate') {
    return childrenProbs.reduce((acc, p) => acc * p, 1);
  }

  if (node.data.type === 'exclusiveOrGate') {
    let sum = 0;
    for (let i = 0; i < childrenProbs.length; i++) {
      let prod = childrenProbs[i];
      for (let j = 0; j < childrenProbs.length; j++) {
        if (i !== j) prod *= (1 - childrenProbs[j]);
      }
      sum += prod;
    }
    return sum;
  }

  // Default to OR for topEvent, event, orGate
  return 1 - childrenProbs.reduce((acc, p) => acc * (1 - p), 1);
};

export default memo(function FtaNode({ data, id }: { data: FtaNodeData; id: string }) {
  const isRoot = id === 'root';
  const nodes = useRoadmapStore(s => s.ftaNodes);
  const edges = useRoadmapStore(s => s.ftaEdges);

  const probability = useMemo(() => calculateProbability(id, nodes, edges), [id, nodes, edges]);

  const getNodeStyles = () => {
    switch (data.type) {
      case 'topEvent':
        return {
          wrapper: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/50 shadow-rose-500/10',
          text: 'text-rose-700 dark:text-rose-300 font-bold',
          icon: <AlertOctagon size={16} className="text-rose-500" />,
          shape: 'rounded-xl'
        };
      case 'event':
        return {
          wrapper: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50 shadow-amber-500/10',
          text: 'text-amber-700 dark:text-amber-300 font-semibold',
          icon: <Box size={16} className="text-amber-500" />,
          shape: 'rounded-xl'
        };
      case 'undevelopedEvent':
        return {
          wrapper: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900/50 shadow-orange-500/10',
          text: 'text-orange-700 dark:text-orange-300 font-semibold',
          icon: <Diamond size={16} className="text-orange-500" />,
          shape: 'clip-path-diamond px-6 py-6 aspect-square'
        };
      case 'conditioningEvent':
        return {
          wrapper: 'bg-lime-50 border-lime-200 dark:bg-lime-900/20 dark:border-lime-900/50 shadow-lime-500/10',
          text: 'text-lime-700 dark:text-lime-300 font-semibold',
          icon: <Filter size={16} className="text-lime-500" />,
          shape: 'rounded-[50%] px-6 py-4'
        };
      case 'andGate':
        return {
          wrapper: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-900/50 shadow-indigo-500/10',
          text: 'text-indigo-700 dark:text-indigo-300 font-bold',
          icon: <span className="font-black text-indigo-500 text-lg mr-1">&amp;</span>,
          shape: 'rounded-b-[2rem] rounded-t-sm px-4'
        };
      case 'priorityAndGate':
        return {
          wrapper: 'bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-900/50 shadow-violet-500/10',
          text: 'text-violet-700 dark:text-violet-300 font-bold',
          icon: <ListOrdered size={16} className="text-violet-500 mr-1" />,
          shape: 'rounded-b-[2rem] rounded-t-sm px-4'
        };
      case 'orGate':
        return {
          wrapper: 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-900/50 shadow-teal-500/10',
          text: 'text-teal-700 dark:text-teal-300 font-bold',
          icon: <span className="font-black text-teal-500 text-sm mr-1">≥1</span>,
          shape: 'rounded-t-xl rounded-b-[2.5rem] px-4'
        };
      case 'exclusiveOrGate':
        return {
          wrapper: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-900/50 shadow-cyan-500/10',
          text: 'text-cyan-700 dark:text-cyan-300 font-bold',
          icon: <GitBranch size={16} className="text-cyan-500 mr-1" />,
          shape: 'rounded-t-xl rounded-b-[2.5rem] px-4 border-b-[6px]'
        };
      case 'inhibitGate':
        return {
          wrapper: 'bg-fuchsia-50 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:border-fuchsia-900/50 shadow-fuchsia-500/10',
          text: 'text-fuchsia-700 dark:text-fuchsia-300 font-bold',
          icon: <Hexagon size={16} className="text-fuchsia-500" />,
          shape: 'clip-path-hexagon px-6 py-6'
        };
      case 'basicEvent':
        return {
          wrapper: 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-600 shadow-slate-500/10',
          text: 'text-slate-700 dark:text-slate-300 font-medium',
          icon: <CircleDot size={16} className="text-slate-500 mb-1" />,
          shape: 'rounded-full aspect-square flex flex-col justify-center px-4 py-4'
        };
      default:
        return {
          wrapper: 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700',
          text: 'text-slate-700 dark:text-slate-300',
          icon: <Component size={16} />,
          shape: 'rounded-xl'
        };
    }
  };

  const styles = getNodeStyles();
  const isCentered = ['basicEvent', 'undevelopedEvent', 'conditioningEvent', 'inhibitGate'].includes(data.type);

  return (
    <div 
      className={clsx(
        "relative min-w-[120px] max-w-[200px] border-2 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]",
        styles.wrapper,
        styles.shape,
        isCentered ? 'flex flex-col items-center justify-center text-center' : 'p-3'
      )}
      style={
        data.type === 'undevelopedEvent' ? { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } :
        data.type === 'inhibitGate' ? { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' } :
        {}
      }
    >
      {!isRoot && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-3 h-3 bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" 
        />
      )}

      <div className={clsx("flex items-center gap-1", isCentered && 'flex-col justify-center w-full')}>
        <div className="shrink-0 flex items-center justify-center">
          {styles.icon}
        </div>
        <div className={clsx("text-xs break-words flex-1 leading-snug", styles.text, isCentered && 'text-center')}>
          {data.label}
        </div>
      </div>

      {data.description && (
        <div className={clsx("mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 leading-tight", isCentered && 'text-center')}>
          {data.description}
        </div>
      )}

      {probability !== undefined && (
        <div className={clsx("mt-2 px-1.5 py-0.5 rounded text-[10px] font-bold inline-block border", 
          probability > 0.5 ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800" :
          probability > 0.2 ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800" :
          "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800"
        )}>
          P: {(probability * 100).toFixed(1)}%
        </div>
      )}

      {data.type !== 'basicEvent' && data.type !== 'undevelopedEvent' && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3 bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" 
        />
      )}
    </div>
  );
});
