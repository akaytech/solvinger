import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FlowchartNodeData } from '../store/useRoadmapStore';

export default memo(function FlowchartNode({ data, selected }: { data: FlowchartNodeData; selected?: boolean }) {
  const { label, shape } = data;

  let shapeClasses = "";
  let innerClasses = "flex items-center justify-center text-center font-bold text-sm outline-none break-words w-full h-full p-2";

  if (shape === 'start' || shape === 'end') {
    shapeClasses = "rounded-full bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-400 dark:text-emerald-300 min-w-[100px] px-4";
  } else if (shape === 'decision') {
    shapeClasses = "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-500/10 dark:border-amber-400 dark:text-amber-300 rotate-45 transform w-28 h-28 mx-auto";
    innerClasses += " -rotate-45 transform";
  } else {
    // process
    shapeClasses = "rounded-xl bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-500/10 dark:border-blue-400 dark:text-blue-300 min-w-[120px] px-2";
  }

  return (
    <div className={`relative flex items-center justify-center min-h-[50px] shadow-sm border-2 transition-all ${shapeClasses} ${selected ? 'ring-4 ring-indigo-500/30 border-indigo-500' : ''}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-300 dark:bg-slate-600 border-none" />
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-slate-300 dark:bg-slate-600 border-none" />
      
      <div className={innerClasses}>
        {label}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-slate-800" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-slate-800" />
    </div>
  );
});
