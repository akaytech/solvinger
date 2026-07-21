import { Handle, Position, useNodeId } from '@xyflow/react';
import { CheckCircle2, CircleDashed, PlayCircle, Plus, Eye, EyeOff, XCircle, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';
import type { GoalNodeData } from '../store/useRoadmapStore';
import { useRoadmapStore, getDescendants } from '../store/useRoadmapStore';
import InlineDescriptionMenu from './InlineDescriptionMenu';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function GoalNode({ data, selected }: { data: GoalNodeData; selected: boolean }) {
  const { t } = useTranslation();
  const isDone = data.status === 'Done';
  const isInProgress = data.status === 'In Progress';
  const isFailed = data.status === 'Failed';

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

  const descendantIds = getDescendants(nodeId, edges);
  const hasManuallyPositionedDescendants = descendantIds.some(cid => nodes.find(n => n.id === cid)?.data.isManuallyPositioned);
  const realignChildren = useRoadmapStore((s) => s.realignChildren);
  const editingDescriptionId = useRoadmapStore((s) => s.editingDescriptionId);
  const setEditingDescriptionId = useRoadmapStore((s) => s.setEditingDescriptionId);
  const isEditingDescription = editingDescriptionId === nodeId;

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
        'group relative flex w-[220px] min-h-[110px] items-center rounded-[2rem] p-5 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl',
        selected ? 'ring-4 ring-white/50 dark:ring-slate-500/50 shadow-black/20 dark:shadow-black/50' : '',
        isFailed ? 'bg-red-500 dark:bg-red-600 text-white' : isDone ? 'bg-blue-500 dark:bg-blue-600 text-white' : isInProgress ? 'bg-emerald-500 dark:bg-emerald-600 text-white' : 'bg-[#ffff00] dark:bg-yellow-500 text-slate-800'
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
              ? "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600" 
              : "bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700"
          )}
          title={data.hideCompleted ? t('show_hidden') : t('hide_completed')}
        >
          {data.hideCompleted ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{completedChildrenCount}</span>
        </button>
      )}
      {hasManuallyPositionedDescendants && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            realignChildren(nodeId);
          }}
          className="absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-md border border-indigo-400 transition-all z-10"
          title="Yeniden Hizala (Re-layout)"
        >
          <LayoutGrid size={14} />
        </button>
      )}

      {isEditingDescription && (
        <InlineDescriptionMenu
          node={nodes.find((n) => n.id === nodeId)!}
          onClose={() => setEditingDescriptionId(null)}
          onSave={(text) => updateGoal(nodeId, { description: text })}
        />
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
          {isFailed ? <XCircle size={26} /> : isDone ? <CheckCircle2 size={26} /> : isInProgress ? <PlayCircle size={26} /> : <CircleDashed size={26} />}
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
              className="w-full bg-white/20 dark:bg-black/20 text-sm font-bold leading-snug outline-none placeholder-white/50 dark:placeholder-black/30 px-2 py-1 rounded text-inherit"
              placeholder={t('double_click_edit')}
            />
          ) : (
            <h3 className="text-sm font-bold leading-snug line-clamp-3 cursor-text select-none" title={t('double_click_edit')}>{data.label}</h3>
          )}
        </div>
      </div>

      {/* Yaprakların açılıp kapandığını gösteren tatlı animasyonlu buton */}
      <div
        className={clsx(
          'absolute -bottom-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-lg transition-transform duration-500 ease-in-out',
          data.isExpanded ? 'rotate-45 text-slate-800 dark:text-slate-100' : 'rotate-0 text-slate-400 dark:text-slate-500',
          isFailed ? 'text-red-600 dark:text-red-400' : isDone ? 'text-blue-600 dark:text-blue-400' : isInProgress ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-500'
        )}
      >
        <Plus size={18} className="stroke-[3]" />
      </div>
    </div>
  );
}
