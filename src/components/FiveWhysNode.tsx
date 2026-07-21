import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { FiveWhysNodeData } from '../store/useRoadmapStore';

export default memo(function FiveWhysNode({ data }: { data: FiveWhysNodeData }) {
  const { t } = useTranslation();
  const isProblem = data.type === 'problem';
  const isSolution = data.type === 'solution';
  
  let bgClass = "bg-amber-50 dark:bg-amber-900/20";
  let borderClass = "border-amber-200 dark:border-amber-700/50";
  let textClass = "text-amber-700 dark:text-amber-300";
  let Icon = HelpCircle;

  if (isProblem) {
    bgClass = "bg-rose-50 dark:bg-rose-900/20";
    borderClass = "border-rose-200 dark:border-rose-700/50";
    textClass = "text-rose-700 dark:text-rose-300";
    Icon = AlertCircle;
  } else if (isSolution) {
    bgClass = "bg-emerald-50 dark:bg-emerald-900/20";
    borderClass = "border-emerald-200 dark:border-emerald-700/50";
    textClass = "text-emerald-700 dark:text-emerald-300";
    Icon = CheckCircle2;
  } else {
    if (data.depth >= 5) {
      bgClass = "bg-purple-50 dark:bg-purple-900/20";
      borderClass = "border-purple-200 dark:border-purple-700/50";
      textClass = "text-purple-700 dark:text-purple-300";
    } else if (data.depth >= 3) {
      bgClass = "bg-yellow-50 dark:bg-yellow-900/20";
      borderClass = "border-yellow-200 dark:border-yellow-700/50";
      textClass = "text-yellow-700 dark:text-yellow-300";
    }
  }

  return (
    <div className={clsx(
      "w-[320px] rounded-2xl border-2 p-4 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl",
      bgClass, borderClass
    )}>
      {!isProblem && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !border-2 !bg-white dark:!bg-slate-800"
          style={{ borderColor: 'currentColor' }}
        />
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
          <Icon className={clsx("w-5 h-5", textClass)} />
          <span className={clsx("text-xs font-bold uppercase tracking-wider", textClass)}>
            {isProblem ? t('whys_problem') : isSolution ? t('whys_root') : `${data.depth}. ${t('whys_why')}`}
          </span>
        </div>
        
        <div className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed line-clamp-3">
          {data.label || '...'}
        </div>
      </div>

      {!isSolution && (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !bg-white dark:!bg-slate-800"
          style={{ borderColor: 'currentColor' }}
        />
      )}
    </div>
  );
});
