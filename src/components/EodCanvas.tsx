import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import { Plus, Trash2, GripVertical, CheckCircle2, Circle, AlertCircle, Edit2, ListTodo } from 'lucide-react';
import clsx from 'clsx';
import type { EodPriority } from '../store/slices/createEodSlice';

export default function EodCanvas() {
  const { t } = useTranslation();
  const { eod, addEodTask, toggleEodTask, deleteEodTask, reorderEodTasks, updateEodTask } = useRoadmapStore(useShallow((state) => ({
    eod: state.eod || [],
    addEodTask: state.addEodTask,
    toggleEodTask: state.toggleEodTask,
    deleteEodTask: state.deleteEodTask,
    reorderEodTasks: state.reorderEodTasks,
    updateEodTask: state.updateEodTask,
  })));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<EodPriority>('medium');

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<EodPriority>('medium');

  const focusTasks = eod.slice(0, 6);
  const backlogTasks = eod.slice(6);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addEodTask(title.trim(), description.trim(), priority);
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('opacity-50');
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderEodTasks(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    if (e.target instanceof HTMLElement) {
      const items = containerRef.current?.querySelectorAll('li');
      items?.forEach(item => item.classList.remove('opacity-50', 'border-indigo-500'));
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    setDraggedIndex(null);
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('opacity-50');
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>) => {
    if (e.currentTarget instanceof HTMLElement && draggedIndex !== null) {
      e.currentTarget.classList.add('border-indigo-500');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('border-indigo-500');
    }
  };

  const startEditing = (task: any) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      updateEodTask(id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority
      });
    }
    setEditingTaskId(null);
  };

  const getPriorityColor = (p: EodPriority) => {
    switch (p) {
      case 'high': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'low': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
    }
  };

  const getPriorityLabel = (p: EodPriority) => {
    switch (p) {
      case 'high': return t('eod_high');
      case 'medium': return t('eod_medium');
      case 'low': return t('eod_low');
    }
  };

  const renderTask = (task: any, globalIndex: number, isFocus: boolean) => {
    const isEditing = editingTaskId === task.id;

    return (
      <li
        key={task.id}
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, globalIndex)}
        onDragOver={(e) => handleDragOver(e)}
        onDrop={(e) => handleDrop(e, globalIndex)}
        onDragEnd={handleDragEnd}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={clsx(
          "group flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-all",
          isFocus ? "bg-white dark:bg-slate-800 lg:p-5" : "bg-transparent hover:bg-white/50 dark:hover:bg-slate-800/50",
          task.isCompleted && "opacity-60 grayscale-[30%]"
        )}
      >
        <div className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors shrink-0">
          <GripVertical size={20} />
        </div>
        
        {isFocus ? (
          <div className="shrink-0 flex flex-col items-center gap-1">
            <span className={clsx(
              "flex items-center justify-center w-6 h-6 rounded-full text-xs font-black",
              task.isCompleted 
                ? "bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500" 
                : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
            )}>
              {globalIndex + 1}
            </span>
            <button onClick={() => toggleEodTask(task.id)} className="focus:outline-none">
              {task.isCompleted ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-slate-300 dark:text-slate-600 hover:text-orange-500 transition-colors" />}
            </button>
          </div>
        ) : (
          <button onClick={() => toggleEodTask(task.id)} className="mt-0.5 shrink-0 transition-colors focus:outline-none">
            {task.isCompleted ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} className="text-slate-300 dark:text-slate-600 hover:text-orange-500 transition-colors" />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveEdit(task.id);
                  if (e.key === 'Escape') setEditingTaskId(null);
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <input
                type="text"
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveEdit(task.id);
                  if (e.key === 'Escape') setEditingTaskId(null);
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <select
                  value={editPriority}
                  onChange={e => setEditPriority(e.target.value as EodPriority)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="high">{t('eod_high')}</option>
                  <option value="medium">{t('eod_medium')}</option>
                  <option value="low">{t('eod_low')}</option>
                </select>
                <button onClick={() => saveEdit(task.id)} className="text-sm bg-orange-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-orange-700 transition-colors">
                  {t('flowchart_save') || 'Save'}
                </button>
                <button onClick={() => setEditingTaskId(null)} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors font-medium">
                  {t('cancel') || 'Cancel'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className={clsx(
                  "font-bold truncate transition-all",
                  isFocus ? "text-base" : "text-sm",
                  task.isCompleted ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-800 dark:text-slate-100"
                )}>
                  {task.title}
                </span>
                <span className={clsx(
                  "text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md border",
                  getPriorityColor(task.priority),
                  task.isCompleted && "opacity-50"
                )}>
                  {getPriorityLabel(task.priority)}
                </span>
              </div>
              {task.description && (
                <p className={clsx(
                  "text-xs sm:text-sm",
                  task.isCompleted ? "text-slate-400 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"
                )}>
                  {task.description}
                </p>
              )}
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              onClick={() => startEditing(task)}
              className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:text-orange-400 dark:hover:bg-orange-900/30 rounded-lg transition-all focus:outline-none focus:opacity-100"
              title={t('flowchart_edit') || 'Edit'}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => deleteEodTask(task.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 rounded-lg transition-all focus:outline-none focus:opacity-100"
              title={t('delete') || 'Delete'}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 overflow-y-auto custom-scrollbar p-6 lg:p-10" ref={containerRef}>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            {t('tool_eod')}
            <span className="text-sm font-semibold px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
              Ivy Lee Method
            </span>
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            {t('eod_desc')}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-3 rounded-xl">
            <AlertCircle size={16} className="text-orange-500 shrink-0" />
            {t('eod_max_limit')}
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAdd} className="mb-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <div className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                placeholder={t('eod_placeholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder={t('eod_desc_placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EodPriority)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              >
                <option value="high">{t('eod_high')}</option>
                <option value="medium">{t('eod_medium')}</option>
                <option value="low">{t('eod_low')}</option>
              </select>

              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl px-6 py-2 font-semibold transition-all shadow-sm shrink-0"
              >
                <Plus size={18} />
                {t('eod_add_task')}
              </button>
            </div>
          </div>
        </form>

        {/* Focus Tasks (Top 6) */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 px-1">
            {t('eod_focus') || "Today's Focus"}
            <span className="text-xs font-semibold text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
              {focusTasks.length} / 6
            </span>
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden min-h-[100px]">
            {focusTasks.length === 0 ? (
              <div className="p-10 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-3">
                   <ListTodo size={24} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-medium">{t('eod_empty_focus') || "No focus tasks yet."}</p>
              </div>
            ) : (
              <ul className="flex flex-col">
                {focusTasks.map((task, idx) => renderTask(task, idx, true))}
              </ul>
            )}
          </div>
        </div>

        {/* Backlog Tasks (7+) */}
        <div>
          <h2 className="text-lg font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-3 px-1">
            {t('eod_backlog') || "Backlog"}
            {backlogTasks.length > 0 && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-200 dark:text-slate-400 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {backlogTasks.length}
              </span>
            )}
          </h2>

          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/30 bg-slate-100/50 dark:bg-slate-900/30 overflow-hidden min-h-[80px]">
             {backlogTasks.length === 0 ? (
              <div className="p-6 text-center text-slate-400/80 dark:text-slate-500/80 flex flex-col items-center">
                <p className="text-sm font-medium">{t('eod_empty_backlog') || "Backlog is empty."}</p>
              </div>
            ) : (
              <ul className="flex flex-col">
                {backlogTasks.map((task, localIdx) => renderTask(task, 6 + localIdx, false))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
