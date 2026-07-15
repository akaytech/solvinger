import { Handle, Position } from '@xyflow/react';
import { CheckCircle2, CircleDashed, PlayCircle, Plus } from 'lucide-react';
import clsx from 'clsx';
import type { GoalNodeData } from '../store/useRoadmapStore';

export default function GoalNode({ data, selected }: { data: GoalNodeData; selected: boolean }) {
  const isDone = data.status === 'Done';
  const isInProgress = data.status === 'In Progress';

  return (
    <div
      className={clsx(
        'group relative flex w-[440px] min-h-[110px] items-center rounded-[2rem] p-5 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl',
        selected ? 'ring-4 ring-white/50 shadow-black/20' : '',
        isDone ? 'bg-blue-500 text-white' : isInProgress ? 'bg-emerald-500 text-white' : 'bg-[#ffff00] text-slate-800'
      )}
    >
      {/* Görüntüde gizli tuttuğumuz ama çizgilerin merkeze gelmesini sağlayan noktalar */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />

      <div className="flex w-full items-center gap-4">
        <div
          className={clsx(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-inner'
          )}
        >
          {isDone ? <CheckCircle2 size={26} /> : isInProgress ? <PlayCircle size={26} /> : <CircleDashed size={26} />}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold leading-snug line-clamp-3">{data.label}</h3>
        </div>
      </div>

      {/* Yaprakların açılıp kapandığını gösteren tatlı animasyonlu buton */}
      <div
        className={clsx(
          'absolute -bottom-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-500 ease-in-out',
          data.isExpanded ? 'rotate-45 text-slate-800' : 'rotate-0 text-slate-400',
          isDone ? 'text-blue-600' : isInProgress ? 'text-emerald-600' : 'text-yellow-600'
        )}
      >
        <Plus size={18} className="stroke-[3]" />
      </div>
    </div>
  );
}
