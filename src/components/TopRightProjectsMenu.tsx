import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { Folder, Plus, Trash2 } from 'lucide-react';

export default function TopRightProjectsMenu() {
  const { t } = useTranslation();
  const { projects, currentProjectId, loadProject, createProject, deleteProject, user } = useRoadmapStore();
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
    document.addEventListener("mousedown", handleClickOutside, { capture: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, { capture: true });
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
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:scale-105 transition-transform text-slate-500 dark:text-slate-400"
      >
        <Folder size={24} />
      </button>

      <div 
        className={`absolute top-14 right-0 w-72 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xl transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
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
          <div className="mb-2 flex gap-2 px-2">
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
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-sm outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200"
              placeholder={t('project_name')}
            />
          </div>
        )}

        <div className="max-h-64 overflow-y-auto space-y-1 px-1">
          {projects.map((p) => (
             <div 
               key={p.id}
               className={`group flex items-center justify-between rounded-xl px-3 py-2 transition-colors ${currentProjectId === p.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
             >
                <button 
                  className="flex-1 text-left text-sm font-semibold truncate"
                  onClick={() => loadProject(p.id)}
                >
                  {p.name}
                </button>
                <button 
                  onClick={(e) => {
                     e.stopPropagation();
                     deleteProject(p.id);
                  }}
                  className="hidden group-hover:block p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
             </div>
          ))}
          {projects.length === 0 && !isCreating && (
            <div className="py-4 text-center text-sm text-slate-500">
               Projeniz bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
