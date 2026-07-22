import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import { Plus, Trash2, GripVertical, CheckCircle2, Circle, AlertCircle, ListTodo } from 'lucide-react';
import clsx from 'clsx';
import type { EodPriority } from '../store/slices/createEodSlice';

export default function EodCanvas() {
  const { t } = useTranslation();
  const { eod, addEodTask, toggleEodTask, deleteEodTask, reorderEodTasks } = useRoadmapStore(useShallow((state) => ({
    eod: state.eod || [],
    addEodTask: state.addEodTask,
    toggleEodTask: state.toggleEodTask,
    deleteEodTask: state.deleteEodTask,
    reorderEodTasks: state.reorderEodTasks,
  })));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<EodPriority>('medium');

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const isLimitReached = eod.length >= 6;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && !isLimitReached) {
      addEodTask(title.trim(), description.trim(), priority);
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to be generated before we hide the original
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
      const items = listRef.current?.querySelectorAll('li');
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

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 overflow-y-auto custom-scrollbar p-6 lg:p-10">
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
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 p-3 rounded-xl">
            <AlertCircle size={16} className="text-indigo-500 shrink-0" />
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
                disabled={isLimitReached}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50 font-medium"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder={t('eod_desc_placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLimitReached}
                className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EodPriority)}
                disabled={isLimitReached}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all disabled:opacity-50"
              >
                <option value="high">{t('eod_high')}</option>
                <option value="medium">{t('eod_medium')}</option>
                <option value="low">{t('eod_low')}</option>
              </select>

              <button
                type="submit"
                disabled={!title.trim() || isLimitReached}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl px-6 py-2 font-semibold transition-all shadow-sm shrink-0"
              >
                <Plus size={18} />
                {t('eod_add_task')}
              </button>
            </div>
          </div>
          
          {isLimitReached && (
            <div className="mt-4 text-sm text-rose-500 font-medium text-center">
              {t('eod_max_reached')}
            </div>
          )}
        </form>

        {/* Tasks List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {t('eod_subtitle')}
            </h2>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">
              {eod.length} / 6
            </div>
          </div>

          {eod.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                 <ListTodo size={32} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p>{t('eod_empty')}</p>
            </div>
          ) : (
            <ul ref={listRef} className="flex flex-col">
              {eod.map((task, index) => (
                <li
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  className={clsx(
                    "group flex items-start gap-4 p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-all bg-white dark:bg-slate-800",
                    "hover:bg-slate-50 dark:hover:bg-slate-700/30",
                    task.isCompleted && "bg-slate-50/50 dark:bg-slate-800/80"
                  )}
                >
                  <div className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors">
                    <GripVertical size={20} />
                  </div>
                  
                  <button 
                    onClick={() => toggleEodTask(task.id)}
                    className="mt-0.5 shrink-0 transition-colors focus:outline-none"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    ) : (
                      <Circle size={24} className="text-slate-300 dark:text-slate-600 hover:text-orange-500 transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={clsx(
                        "font-bold text-base truncate transition-all",
                        task.isCompleted ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-800 dark:text-slate-100"
                      )}>
                        {task.title}
                      </span>
                      <span className={clsx(
                        "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border",
                        getPriorityColor(task.priority),
                        task.isCompleted && "opacity-50"
                      )}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    {task.description && (
                      <p className={clsx(
                        "text-sm",
                        task.isCompleted ? "text-slate-400 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"
                      )}>
                        {task.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteEodTask(task.id)}
                    className="mt-1 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:text-slate-600 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                    title={t('delete')}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
