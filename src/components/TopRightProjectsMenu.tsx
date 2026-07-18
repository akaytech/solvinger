import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import ConfirmModal from './ConfirmModal';
import { Folder, Plus, Trash2, ChevronDown, ChevronRight, GitCommit, Target, HelpCircle, Fish, RefreshCcw, Layers, Pencil, AlertOctagon } from 'lucide-react';
import type { Project } from '../store/useRoadmapStore';

function ProjectTreeItem({ project, isCurrent, onClose, requestDelete }: { project: Project; isCurrent: boolean; onClose: () => void; requestDelete: (t: string, m: string, cb: () => void) => void }) {
  const { loadProject, setActiveTool, deleteProject, updateProjectName, clearToolData } = useRoadmapStore();
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
              className="flex-1 truncate text-left text-sm font-bold cursor-pointer"
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
          <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-2">
            <button 
              onClick={(e) => {
                 e.stopPropagation();
                 setIsEditing(true);
              }}
              className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
              title="Yeniden Adlandır"
            >
              <Pencil size={14} />
            </button>
            <button 
              onClick={(e) => {
                 e.stopPropagation();
                 requestDelete('Çalışmayı Sil', 'Bu çalışmayı (projeyi) ve içindeki tüm verileri tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', () => deleteProject(project.id));
              }}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              title="Çalışmayı Sil"
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
              <button onClick={() => handleToolClick('wbs')} className="flex w-full items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
                <GitCommit size={14} className="text-indigo-500" />
                İş Kırılım Yapısı
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); requestDelete('Aracı Temizle', 'Bu araca ait tüm verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', () => clearToolData(project.id, 'wbs')); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors" title="Sil"
              ><Trash2 size={12} /></button>
            </div>
          )}
          
          {(project.swot?.length > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('swot')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 p-1.5 rounded-lg transition-colors pr-6">
                 <div className="flex items-center gap-2">
                   <Target size={14} className="text-amber-500" />
                   SWOT
                 </div>
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 rounded-full group-hover/tool:opacity-0">{project.swot.length}</span>
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete('Aracı Temizle', 'Bu araca ait tüm verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', () => clearToolData(project.id, 'swot')); }}
                 className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors" title="Sil"
               ><Trash2 size={12} /></button>
             </div>
          )}

          {(project.fiveWhys?.length > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('5whys')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 p-1.5 rounded-lg transition-colors pr-6">
                 <div className="flex items-center gap-2">
                   <HelpCircle size={14} className="text-rose-500" />
                   5 Neden
                 </div>
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 rounded-full group-hover/tool:opacity-0">{project.fiveWhys.length}</span>
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete('Aracı Temizle', 'Bu araca ait tüm verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', () => clearToolData(project.id, '5whys')); }}
                 className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors" title="Sil"
               ><Trash2 size={12} /></button>
             </div>
          )}

          {(project.ishikawa?.length > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('ishikawa')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 p-1.5 rounded-lg transition-colors pr-6">
                 <div className="flex items-center gap-2">
                   <Fish size={14} className="text-cyan-500" />
                   Ishikawa
                 </div>
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 rounded-full group-hover/tool:opacity-0">{project.ishikawa.length}</span>
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete('Aracı Temizle', 'Bu araca ait tüm verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', () => clearToolData(project.id, 'ishikawa')); }}
                 className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors" title="Sil"
               ><Trash2 size={12} /></button>
             </div>
          )}

          {(project.pdca?.length > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('pdca')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 p-1.5 rounded-lg transition-colors pr-6">
                 <div className="flex items-center gap-2">
                   <RefreshCcw size={14} className="text-emerald-500" />
                   PUKÖ
                 </div>
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 rounded-full group-hover/tool:opacity-0">{project.pdca.length}</span>
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete('Aracı Temizle', 'Bu araca ait tüm verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', () => clearToolData(project.id, 'pdca')); }}
                 className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors" title="Sil"
               ><Trash2 size={12} /></button>
             </div>
          )}

          
          {((project.ftaNodes?.length ?? 0) > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('fta')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 p-1.5 rounded-lg transition-colors pr-6">
                 <div className="flex items-center gap-2">
                   <AlertOctagon size={14} className="text-rose-500" />
                   {t('fta_title')}
                 </div>
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete('Aracı Temizle', 'Bu araca ait tüm verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', () => clearToolData(project.id, 'fta')); }}
                 className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors" title="Sil"
               ><Trash2 size={12} /></button>
             </div>
          )}
  
          {(project.waterfall?.length > 0) && (
             <div className="group/tool relative">
               <button onClick={() => handleToolClick('waterfall')} className="flex w-full items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 p-1.5 rounded-lg transition-colors pr-6">
                 <div className="flex items-center gap-2">
                   <Layers size={14} className="text-blue-500" />
                   Waterfall
                 </div>
                 <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 rounded-full group-hover/tool:opacity-0">{project.waterfall.length}</span>
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); requestDelete('Aracı Temizle', 'Bu araca ait tüm verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', () => clearToolData(project.id, 'waterfall')); }}
                 className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tool:block p-1 text-slate-400 hover:text-red-500 transition-colors" title="Sil"
               ><Trash2 size={12} /></button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TopRightProjectsMenu() {
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const requestDelete = (title: string, message: string, onConfirm: () => void) => { setConfirmState({ isOpen: true, title, message, onConfirm }); };
  const { t } = useTranslation();
  const { projects, currentProjectId, createProject, user } = useRoadmapStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (!user) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute top-4 right-20 z-50 flex flex-col items-end"
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
          <div className="mb-3 flex gap-2 px-2">
            <input
              type="text"
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newProjectName.trim()) {
                  createProject(newProjectName.trim());
                  setNewProjectName('');
                  setIsCreating(false);
                } else if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewProjectName('');
                }
              }}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200"
              placeholder={t('project_name')}
            />
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
               Dosya bulunmuyor.
            </div>
          )}
        </div>
      </div>
      <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={confirmState.onConfirm} onClose={() => setConfirmState(p => ({...p, isOpen: false}))} />
    </div>
  );
}
