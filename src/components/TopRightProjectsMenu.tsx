import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import ConfirmModal from './ConfirmModal';
import { Folder, Plus, Trash2, ChevronDown, ChevronRight, GitCommit, Target, HelpCircle, Fish, RefreshCcw, Layers, Pencil, AlertOctagon, Scale, GitMerge, BarChart2, BarChart, FileText, ListTodo, Activity, Network, Check } from 'lucide-react';
import type { Project } from '../store/useRoadmapStore';
import { toolTheme } from '../config/toolTheme';

const TOOL_OPTIONS = [
  { id: 'wbs', icon: Network, label: 'tool_wbs', color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  { id: 'swot', icon: Target, label: 'tool_swot', color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/40' },
  { id: '5whys', icon: Activity, label: 'tool_5whys', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  { id: 'ishikawa', icon: Fish, label: 'tool_ishikawa', color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/40' },
  { id: 'pdca', icon: RefreshCcw, label: 'tool_pdca', color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/40' },
  { id: 'waterfall', icon: Layers, label: 'tool_waterfall', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  { id: 'fta', icon: AlertOctagon, label: 'fta_title', color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/40' },
  { id: 'decision', icon: Scale, label: 'decision_title', color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/40' },
  { id: 'flowchart', icon: GitMerge, label: 'tool_flowchart', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40' },
  { id: 'pareto', icon: BarChart2, label: 'tool_pareto', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  { id: 'histogram', icon: BarChart, label: 'tool_histogram', color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  { id: 'notepad', icon: FileText, label: 'notepad_title', color: 'text-fuchsia-500', bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40' },
  { id: 'eod', icon: ListTodo, label: 'tool_eod', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/40' }
];

function ProjectTreeItem({ project, isCurrent, onClose, requestDelete }: { project: Project; isCurrent: boolean; onClose: () => void; requestDelete: (t: string, m: string, cb: () => void) => void }) {
  const {  loadProject, setActiveTool, deleteProject, updateProjectName, clearToolData  } = useRoadmapStore(useShallow((state) => ({
      loadProject: state.loadProject,
      setActiveTool: state.setActiveTool,
      deleteProject: state.deleteProject,
      updateProjectName: state.updateProjectName,
      clearToolData: state.clearToolData
    })));
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(isCurrent);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleRename = () => {
    if (editName.trim() && editName.trim() !== project.name) {
      updateProjectName(project.id, editName.trim());
    } else {
      setEditName(project.name);
    }
    setIsEditing(false);
  };

  const handleToolClick = (tool: any) => {
    if (!isCurrent) {
      loadProject(project.id);
    }
    setActiveTool(tool);
    onClose();
  };

  return (
    <div className="flex flex-col border-b border-slate-100 dark:border-slate-700/50 last:border-0 pb-1 mb-1">
      <div className={`group flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors ${isCurrent ? 'bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'}`}>
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <button onClick={() => setIsExpanded(!isExpanded)} className="shrink-0 p-0.5">
            {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
          </button>
          
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setEditName(project.name);
                  setIsEditing(false);
                }
              }}
              className="flex-1 min-w-0 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-500 rounded px-1.5 py-0.5 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
            />
          ) : (
            <span 
              className="flex-1 truncate text-start text-sm font-bold cursor-pointer"
              onDoubleClick={() => setIsEditing(true)}
              onClick={() => {
                if (!isCurrent) loadProject(project.id);
              }}
            >
              {project.name}
            </span>
          )}
        </div>
        
        {!isEditing && (
          <div className="flex items-center gap-1 shrink-0 ml-2 opacity-40 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                 e.stopPropagation();
                 setIsEditing(true);
              }}
              className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
              title={t('rename_title')} aria-label={t('rename_title')}
            >
              <Pencil size={14} />
            </button>
            <button 
              onClick={(e) => {
                 e.stopPropagation();
                 requestDelete(t('delete_project_title'), t('delete_project_msg'), () => deleteProject(project.id));
              }}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              title={t('delete_project_btn')} aria-label={t('delete_project_btn')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="flex flex-col pl-6 pr-2 space-y-0.5 mt-1">
          {(project.nodes?.length > 0) && (
            <div className="group/tool relative">
              <button onClick={() => handleToolClick('wbs')} className="flex w-full items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors pr-8">
                <GitCommit size={14} className="text-indigo-500" />
                {t('tool_wbs')}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'wbs')); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors pr-8" title={t('delete_title')} aria-label={t('delete_title')}
              ><Trash2 size={12} /></button>
            </div>
          )}
          
          {(project.swot?.length > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('swot')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 p-1.5 rounded-lg transition-colors pr-[52px]">
                 <div className="flex items-center gap-2">
                   <Target size={14} className="text-amber-500" />
                   {t('tool_swot')}
                 </div>
                 
               </button>
               
               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-500">{project.swot.length}</span>
                 <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'swot')); }}
                 className="p-1 text-slate-400 hover:text-red-500 transition-opacity opacity-40 group-hover/tool:opacity-100" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
               </div>

             </div>
          )}

          {((project.fiveWhysNodes?.length ?? 0) > 1) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('5whys')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 p-1.5 rounded-lg transition-colors pr-6">
                 <div className="flex items-center gap-2">
                   <HelpCircle size={14} className="text-rose-500" />
                   {t('tool_5whys')}
                 </div>
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, '5whys')); }}
                 className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors pr-8" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
             </div>
          )}

          {(project.ishikawa?.length > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('ishikawa')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 p-1.5 rounded-lg transition-colors pr-[52px]">
                 <div className="flex items-center gap-2">
                   <Fish size={14} className="text-cyan-500" />
                   {t('tool_ishikawa')}
                 </div>
                 
               </button>
               
               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-500">{project.ishikawa.length}</span>
                 <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'ishikawa')); }}
                 className="p-1 text-slate-400 hover:text-red-500 transition-opacity opacity-40 group-hover/tool:opacity-100" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
               </div>

             </div>
          )}

          {(project.pdca?.length > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('pdca')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 p-1.5 rounded-lg transition-colors pr-[52px]">
                 <div className="flex items-center gap-2">
                   <RefreshCcw size={14} className="text-emerald-500" />
                   {t('pdca_title')}
                 </div>
                 
               </button>
               
               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-500">{project.pdca.length}</span>
                 <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'pdca')); }}
                 className="p-1 text-slate-400 hover:text-red-500 transition-opacity opacity-40 group-hover/tool:opacity-100" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
               </div>

             </div>
          )}

          
          {(project.ftaNodes?.length ?? 0) > 1 && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('fta')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 p-1.5 rounded-lg transition-colors pr-6">
                 <div className="flex items-center gap-2">
                   <AlertOctagon size={14} className="text-rose-500" />
                   {t('fta_title')}
                 </div>
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'fta')); }}
                 className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors pr-8" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
             </div>
          )}
  
          {(project.waterfall?.length > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('waterfall')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 p-1.5 rounded-lg transition-colors pr-[52px]">
                 <div className="flex items-center gap-2">
                   <Layers size={14} className="text-blue-500" />
                   {t('tool_waterfall')}
                 </div>
                 
               </button>
               
               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-500">{project.waterfall.length}</span>
                 <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'waterfall')); }}
                 className="p-1 text-slate-400 hover:text-red-500 transition-opacity opacity-40 group-hover/tool:opacity-100" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
               </div>

             </div>
          )}

          {((project.decision?.length ?? 0) > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('decision')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 p-1.5 rounded-lg transition-colors pr-[52px]">
                 <div className="flex items-center gap-2">
                   <Scale size={14} className="text-violet-500" />
                   {t('decision_title')}
                 </div>
                 
               </button>
               
               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-500">{project.decision?.length ?? 0}</span>
                 <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'decision')); }}
                 className="p-1 text-slate-400 hover:text-red-500 transition-opacity opacity-40 group-hover/tool:opacity-100" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
               </div>

             </div>
          )}

           {((project.flowchartNodes?.length ?? 0) > 1) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('flowchart')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 p-1.5 rounded-lg transition-colors pr-6">
                 <div className="flex items-center gap-2">
                   <GitMerge size={14} className="text-amber-500" />
                   {t('tool_flowchart')}
                 </div>
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'flowchart')); }}
                 className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors pr-8" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
             </div>
          )}

          {((project.pareto?.length ?? 0) > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('pareto')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 p-1.5 rounded-lg transition-colors pr-[52px]">
                 <div className="flex items-center gap-2">
                   <BarChart2 size={14} className="text-blue-500" />
                   {t('tool_pareto')}
                 </div>
                 
               </button>
               
               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-500">{project.pareto?.length ?? 0}</span>
                 <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'pareto')); }}
                 className="p-1 text-slate-400 hover:text-red-500 transition-opacity opacity-40 group-hover/tool:opacity-100" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
               </div>

             </div>
          )}

           {((project.histogram?.length ?? 0) > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('histogram')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 p-1.5 rounded-lg transition-colors pr-[52px]">
                 <div className="flex items-center gap-2">
                   <BarChart size={14} className="text-indigo-500" />
                   {t('tool_histogram')}
                 </div>
                 
               </button>
               
               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-500">{project.histogram?.length ?? 0}</span>
                 <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'histogram')); }}
                 className="p-1 text-slate-400 hover:text-red-500 transition-opacity opacity-40 group-hover/tool:opacity-100" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
               </div>

             </div>
          )}

          {((project.notepad?.length ?? 0) > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('notepad')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-900/20 p-1.5 rounded-lg transition-colors pr-[52px]">
                 <div className="flex items-center gap-2">
                   <FileText size={14} className="text-fuchsia-500" />
                   {t('notepad_title')}
                 </div>
                 
               </button>
               
               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-500">{project.notepad?.length ?? 0}</span>
                 <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'notepad')); }}
                 className="p-1 text-slate-400 hover:text-red-500 transition-opacity opacity-40 group-hover/tool:opacity-100" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
               </div>

             </div>
          )}

          {((project.eod?.length ?? 0) > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('eod')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 p-1.5 rounded-lg transition-colors pr-[52px]">
                 <div className="flex items-center gap-2">
                   <ListTodo size={14} className="text-orange-500" />
                   {t('tool_eod')}
                 </div>
                 
               </button>
               
               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-500">{project.eod?.length ?? 0}</span>
                 <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete(t('clear_tool_title'), t('clear_tool_msg'), () => clearToolData(project.id, 'eod')); }}
                 className="p-1 text-slate-400 hover:text-red-500 transition-opacity opacity-40 group-hover/tool:opacity-100" title={t('delete_title')} aria-label={t('delete_title')}
               ><Trash2 size={12} /></button>
               </div>

             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TopRightProjectsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const requestDelete = (title: string, message: string, onConfirm: () => void) => { setConfirmState({ isOpen: true, title, message, onConfirm }); };
  const {  projects, currentProjectId, createProject, setActiveTool  } = useRoadmapStore(useShallow((state) => ({
      projects: state.projects,
      currentProjectId: state.currentProjectId,
      createProject: state.createProject,
      setActiveTool: state.setActiveTool
    })));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    const forceClose = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside, { capture: true });
    document.addEventListener("close-menus", forceClose);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, { capture: true });
      document.removeEventListener("close-menus", forceClose);
    };
  }, []);


  return (
    <div 
      ref={menuRef}
      className="absolute top-4 end-20 sm:end-24 z-50 flex flex-col items-end"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:scale-105 transition-transform text-indigo-500 dark:text-indigo-400 overflow-hidden"
      >
        <Folder size={20} className={isOpen ? 'fill-indigo-500' : ''} />
      </button>

      <div 
        className={`absolute top-14 right-0 w-80 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xl transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-2">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('my_projects')}</span>
          <button 
            onClick={() => setIsCreating(true)}
            className="rounded bg-indigo-50 dark:bg-indigo-900/50 p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
          >
             <Plus size={16} />
          </button>
        </div>

        {isCreating && (
          <div className="mb-3 px-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newProjectName.trim()) {
                    if (selectedTool) {
                      createProject(newProjectName.trim(), selectedTool);
                    } else {
                      createProject(newProjectName.trim(), ''); // Empty string forces initialTool to fallback or skip
                      setActiveTool(null); // Force welcome screen
                    }
                    setNewProjectName('');
                    setSelectedTool(null);
                    setIsCreating(false);
                  } else if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewProjectName('');
                    setSelectedTool(null);
                  }
                }}
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200"
                placeholder={t('project_name')}
              />
            </div>
            
            <div className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('method')}</div>
            <div className="grid grid-cols-4 gap-2 pb-2">
              {TOOL_OPTIONS.map((tool) => {
                const isSelected = selectedTool === tool.id;
                const Icon = tool.icon;
                
                // Parse tailwind color classes to handle dynamic construction safely if needed,
                // but since we provide full classes in the object, we just use them.
                const theme = toolTheme[tool.id] || toolTheme.wbs;
                const borderColor = isSelected ? theme.border : 'border-slate-200 dark:border-slate-700';
                const bgColor = isSelected ? theme.bgSelected : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50';

                return (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    title={t(tool.label)}
                    className={`relative flex h-10 flex-col items-center justify-center rounded-xl border ${borderColor} ${bgColor} transition-all hover:scale-105 active:scale-95`}
                  >
                    <Icon size={16} className={isSelected ? tool.color : 'text-slate-400 dark:text-slate-500'} />
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto px-1 custom-scrollbar">
          {projects.map((p) => (
            <ProjectTreeItem 
              key={p.id} 
              project={p} 
              isCurrent={p.id === currentProjectId} 
              onClose={() => setIsOpen(false)}
              requestDelete={requestDelete}
            />
          ))}
          {projects.length === 0 && !isCreating && (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-sm">
               <Folder size={32} className="mb-2 opacity-50" />
               {t('no_projects_found')}
            </div>
          )}
        </div>
      </div>
      <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={confirmState.onConfirm} onClose={() => setConfirmState(p => ({...p, isOpen: false}))} />
    </div>
  );
}
