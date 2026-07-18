import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import clsx from 'clsx';
import { AlertOctagon, Box, CircleDot, Component } from 'lucide-react';
import type { FtaNodeData } from '../store/useRoadmapStore';

export default memo(function FtaNode({ data, id }: { data: FtaNodeData; id: string }) {
  const isRoot = id === 'root';

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
      case 'andGate':
        return {
          wrapper: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-900/50 shadow-indigo-500/10',
          text: 'text-indigo-700 dark:text-indigo-300 font-bold',
          icon: <span className="font-black text-indigo-500 text-lg mr-1">&</span>,
          shape: 'rounded-b-[2rem] rounded-t-sm px-4' // D shape simulation
        };
      case 'orGate':
        return {
          wrapper: 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-900/50 shadow-teal-500/10',
          text: 'text-teal-700 dark:text-teal-300 font-bold',
          icon: <span className="font-black text-teal-500 text-sm mr-1">≥1</span>,
          shape: 'rounded-t-xl rounded-b-[2.5rem] px-4' // Shield shape simulation
        };
      case 'basicEvent':
        return {
          wrapper: 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-600 shadow-slate-500/10',
          text: 'text-slate-700 dark:text-slate-300 font-medium',
          icon: <CircleDot size={16} className="text-slate-500 mb-1" />,
          shape: 'rounded-full aspect-square flex flex-col justify-center'
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

  return (
    <div 
      className={clsx(
        "relative min-w-[120px] max-w-[180px] border-2 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]",
        styles.wrapper,
        styles.shape,
        data.type === 'basicEvent' ? 'p-3 text-center items-center flex' : 'p-3'
      )}
    >
      {!isRoot && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-3 h-3 bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" 
        />
      )}

      <div className={clsx("flex items-center gap-1", data.type === 'basicEvent' && 'flex-col justify-center w-full')}>
        <div className="shrink-0 flex items-center justify-center">
          {styles.icon}
        </div>
        <div className={clsx("text-xs break-words flex-1 leading-snug", styles.text, data.type === 'basicEvent' && 'text-center')}>
          {data.label}
        </div>
      </div>

      {data.description && (
        <div className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
          {data.description}
        </div>
      )}

      {data.type !== 'basicEvent' && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3 bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" 
        />
      )}
    </div>
  );
});
