import type { GoalNodeData, GoalNode } from '../store/useRoadmapStore';
import { Plus, Trash2, CheckCircle, Calendar, Type, FileText, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ContextMenuProps = {
  x: number;
  y: number;
  node: GoalNode;
  onClose: () => void;
  onAddSubGoal: () => void;
  onUpdate: (data: Partial<GoalNodeData>) => void;
  onOpenDescription: () => void;
  onDelete: () => void;
};

export default function ContextMenu({
  x,
  y,
  node,
  onClose,
  onAddSubGoal,
  onUpdate,
  onOpenDescription,
  onDelete,
}: ContextMenuProps) {
  const { t } = useTranslation();
  const hasDescription = !!node.data.description && node.data.description.trim().length > 0;

  return (
    <div
      style={{ top: y, left: x }}
      className="absolute z-50 w-64 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-2xl transition-all"
    >
      {/* İsim ve Tarih Düzenleme Alanları */}
      <div className="mb-2 space-y-2">
         <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-2 border border-slate-100 dark:border-slate-700 transition-colors focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/10">
           <Type size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
           <input 
             type="text" 
             value={node.data.label}
             onChange={(e) => onUpdate({ label: e.target.value })}
             onKeyDown={(e) => { if (e.key === 'Enter') onClose(); }}
             placeholder={t('goal_name')}
             className="w-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none placeholder:font-normal"
           />
         </div>
         
         <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-2 border border-slate-100 dark:border-slate-700 transition-colors focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/10">
           <Calendar size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
           <input 
             type="date" 
             value={node.data.targetDate || ''}
             onChange={(e) => onUpdate({ targetDate: e.target.value })}
             onKeyDown={(e) => { if (e.key === 'Enter') onClose(); }}
             className="w-full bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none"
           />
         </div>
      </div>

      <div className="my-2 h-px w-full bg-slate-100 dark:bg-slate-700" />

      <button
        onClick={() => { onOpenDescription(); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <FileText size={18} className={hasDescription ? "text-indigo-500" : ""} /> 
        {hasDescription ? t('read_edit_desc') : t('add_desc')}
      </button>

      <button
        onClick={() => { onAddSubGoal(); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <Plus size={18} /> {t('add_subgoal')}
      </button>
      
      <div className="my-2 h-px w-full bg-slate-100 dark:bg-slate-700" />
      
      <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('change_status')}</div>
      
      <button
        onClick={() => { onUpdate({ status: 'To Do' }); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <CheckCircle size={18} className="text-slate-400 dark:text-slate-500" /> {t('todo_status')}
      </button>
      <button
        onClick={() => { onUpdate({ status: 'In Progress' }); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
      >
        <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400" /> {t('in_progress_status')}
      </button>
      <button
        onClick={() => { onUpdate({ status: 'Done' }); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <CheckCircle size={18} className="text-indigo-500 dark:text-indigo-400" /> {t('done_status')}
      </button>
      <button
        onClick={() => { onUpdate({ status: 'Failed' }); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
      >
        <XCircle size={18} className="text-red-500 dark:text-red-400" /> {t('failed_status')}
      </button>
      
      <div className="my-2 h-px w-full bg-slate-100 dark:bg-slate-700" />
      
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-colors"
      >
        <Trash2 size={18} /> {t('delete_goal')}
      </button>
    </div>
  );
}
