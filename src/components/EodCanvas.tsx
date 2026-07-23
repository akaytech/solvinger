import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import { Plus, Trash2, GripVertical, CheckCircle2, Circle, AlertCircle, Edit2, ListTodo } from 'lucide-react';
import clsx from 'clsx';
import type { EodPriority, EodTask } from '../store/slices/createEodSlice';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTaskItem({
  task,
  globalIndex,
  isFocus,
  isEditing,
  editTitle,
  editDesc,
  editPriority,
  setEditTitle,
  setEditDesc,
  setEditPriority,
  saveEdit,
  setEditingTaskId,
  startEditing,
  toggleEodTask,
  deleteEodTask,
  t,
  getPriorityColor,
  getPriorityLabel,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors",
        isFocus ? "bg-white dark:bg-slate-800 lg:p-5" : "bg-transparent hover:bg-white/50 dark:hover:bg-slate-800/50",
        task.isCompleted && "opacity-60 grayscale-[30%]",
        isDragging && "z-50 shadow-lg border-indigo-500 rounded-lg relative"
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className={clsx(
          "mt-1 text-slate-300 dark:text-slate-600 transition-colors shrink-0 outline-none rounded p-0.5",
          !isEditing && "cursor-grab active:cursor-grabbing hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
      >
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
}

function TaskPreview({ task, isFocus, globalIndex, getPriorityColor, getPriorityLabel }: any) {
  return (
    <div className={clsx(
      "flex items-start gap-3 p-4 border border-indigo-500 shadow-xl rounded-lg bg-white dark:bg-slate-800 opacity-90",
      isFocus ? "lg:p-5" : ""
    )}>
      <div className="mt-1 text-slate-500 cursor-grabbing shrink-0">
        <GripVertical size={20} />
      </div>
      
      {isFocus ? (
        <div className="shrink-0 flex flex-col items-center gap-1">
          <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-black bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            {globalIndex + 1}
          </span>
          <Circle size={16} className="text-slate-300 dark:text-slate-600" />
        </div>
      ) : (
        <div className="mt-0.5 shrink-0">
          <Circle size={20} className="text-slate-300 dark:text-slate-600" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={clsx("font-bold truncate text-slate-800 dark:text-slate-100", isFocus ? "text-base" : "text-sm")}>
            {task.title}
          </span>
          <span className={clsx("text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md border", getPriorityColor(task.priority))}>
            {getPriorityLabel(task.priority)}
          </span>
        </div>
        {task.description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
}

function DroppableContainer({ id, children, isFocus }: { id: string; children: React.ReactNode; isFocus: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={clsx(
        "rounded-2xl border transition-colors overflow-hidden",
        isFocus 
          ? "bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700/50" 
          : "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700/30",
        isOver && "border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-900/10"
      )}
    >
      <ul className="flex flex-col min-h-[100px]">
        {children}
      </ul>
    </div>
  );
}

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

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<EodPriority>('medium');
  
  const [activeTask, setActiveTask] = useState<EodTask | null>(null);

  const focusTasks = eod.slice(0, 6);
  const backlogTasks = eod.slice(6);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addEodTask(title.trim(), description.trim(), priority);
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = eod.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;
    
    const oldIndex = eod.findIndex(t => t.id === active.id);
    let newIndex = oldIndex;

    if (over.id === 'focus-container') {
      newIndex = focusTasks.length > 0 ? focusTasks.length - 1 : 0;
    } 
    else if (over.id === 'backlog-container') {
      newIndex = eod.length;
    } 
    else {
      newIndex = eod.findIndex(t => t.id === over.id);
    }

    if (oldIndex !== newIndex && newIndex !== -1 && oldIndex !== -1) {
      reorderEodTasks(oldIndex, newIndex);
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

  const activeGlobalIndex = activeTask ? eod.findIndex(t => t.id === activeTask.id) : -1;
  const isActiveFocus = activeGlobalIndex !== -1 && activeGlobalIndex < 6;

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
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
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-3 rounded-xl">
            <AlertCircle size={16} className="text-orange-500 shrink-0" />
            {t('eod_max_limit')}
          </div>
        </div>

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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 px-1">
              {t('eod_focus') || "Today's Focus"}
              <span className="text-xs font-semibold text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                {focusTasks.length} / 6
              </span>
            </h2>

            <DroppableContainer id="focus-container" isFocus={true}>
              {focusTasks.length === 0 ? (
                <div className="p-10 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center flex-1 justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-3">
                     <ListTodo size={24} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium">{t('eod_empty_focus') || "No focus tasks yet."}</p>
                </div>
              ) : (
                <SortableContext
                  items={focusTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {focusTasks.map((task, idx) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      globalIndex={idx}
                      isFocus={true}
                      isEditing={editingTaskId === task.id}
                      editTitle={editTitle}
                      editDesc={editDesc}
                      editPriority={editPriority}
                      setEditTitle={setEditTitle}
                      setEditDesc={setEditDesc}
                      setEditPriority={setEditPriority}
                      saveEdit={saveEdit}
                      setEditingTaskId={setEditingTaskId}
                      startEditing={startEditing}
                      toggleEodTask={toggleEodTask}
                      deleteEodTask={deleteEodTask}
                      t={t}
                      getPriorityColor={getPriorityColor}
                      getPriorityLabel={getPriorityLabel}
                    />
                  ))}
                </SortableContext>
              )}
            </DroppableContainer>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-3 px-1">
              {t('eod_backlog') || "Backlog"}
              {backlogTasks.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-200 dark:text-slate-400 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {backlogTasks.length}
                </span>
              )}
            </h2>

            <DroppableContainer id="backlog-container" isFocus={false}>
              {backlogTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400/80 dark:text-slate-500/80 flex flex-col items-center flex-1 justify-center pointer-events-none">
                  <p className="text-sm font-medium">{t('eod_empty_backlog') || "Backlog is empty."}</p>
                </div>
              ) : (
                <SortableContext
                  items={backlogTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {backlogTasks.map((task, localIdx) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      globalIndex={6 + localIdx}
                      isFocus={false}
                      isEditing={editingTaskId === task.id}
                      editTitle={editTitle}
                      editDesc={editDesc}
                      editPriority={editPriority}
                      setEditTitle={setEditTitle}
                      setEditDesc={setEditDesc}
                      setEditPriority={setEditPriority}
                      saveEdit={saveEdit}
                      setEditingTaskId={setEditingTaskId}
                      startEditing={startEditing}
                      toggleEodTask={toggleEodTask}
                      deleteEodTask={deleteEodTask}
                      t={t}
                      getPriorityColor={getPriorityColor}
                      getPriorityLabel={getPriorityLabel}
                    />
                  ))}
                </SortableContext>
              )}
            </DroppableContainer>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? (
              <TaskPreview 
                task={activeTask} 
                isFocus={isActiveFocus} 
                globalIndex={activeGlobalIndex} 
                getPriorityColor={getPriorityColor} 
                getPriorityLabel={getPriorityLabel} 
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
