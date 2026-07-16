import { Handle, Position, useNodeId } from '@xyflow/react';
import { CheckCircle2, CircleDashed, PlayCircle, Plus, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import type { GoalNodeData } from '../store/useRoadmapStore';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useState, useRef, useEffect } from 'react';

export default function GoalNode({ data, selected }: { data: GoalNodeData; selected: boolean }) {
  const isDone = data.status === 'Done';
  const isInProgress = data.status === 'In Progress';

  const nodeId = useNodeId()!;
  const edges = useRoadmapStore((s) => s.edges);
  const nodes = useRoadmapStore((s) => s.nodes);
  const toggleHideCompleted = useRoadmapStore((s) => s.toggleHideCompleted);
  const updateGoal = useRoadmapStore((s) => s.updateGoal);
  
  const childrenIds = edges.filter((e) => e.source === nodeId).map((e) => e.target);
  const completedChildrenCount = childrenIds.filter((cid) => {
     const child = nodes.find((n) => n.id === cid);
     return child?.data.status === 'Done';
  }).length;
  const hasCompletedChildren = completedChildrenCount > 0;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      setEditValue(data.label);
    }
  }, [isEditing, data.label]);

  const handleSave = () => {
    if (editValue.trim()) {
      updateGoal(nodeId, { label: editValue.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div
      className={clsx(
        'group relative flex w-[440px] min-h-[110px] items-center rounded-[2rem] p-5 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl',
        selected ? 'ring-4 ring-white/50 shadow-black/20' : '',
        isDone ? 'bg-blue-500 text-white' : isInProgress ? 'bg-emerald-500 text-white' : 'bg-[#ffff00] text-slate-800'
      )}
    >
      {hasCompletedChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleHideCompleted(nodeId);
          }}
          className={clsx(
            "absolute -top-3 right-4 flex h-7 items-center justify-center gap-1 rounded-full px-3 shadow-md border transition-all text-xs font-bold z-10",
            data.hideCompleted 
              ? "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200" 
              : "bg-white border-blue-100 text-blue-500 hover:bg-blue-50"
          )}
          title={data.hideCompleted ? "Gizlenenleri Göster" : "Tamamlananları Gizle"}
        >
          {data.hideCompleted ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{completedChildrenCount}</span>
        </button>
      )}
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
        <div className="flex-1" onDoubleClick={() => setIsEditing(true)}>
          {isEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-full bg-white/20 text-sm font-bold leading-snug outline-none placeholder-white/50 px-2 py-1 rounded text-inherit"
              placeholder="Görev Adı"
            />
          ) : (
            <h3 className="text-sm font-bold leading-snug line-clamp-3 cursor-text select-none" title="Düzenlemek için çift tıkla">{data.label}</h3>
          )}
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
