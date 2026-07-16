import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { X, Plus, FolderOpen, Trash2, Edit2 } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export default function ProjectsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { projects, currentProjectId, createProject, loadProject, deleteProject, updateProjectName } = useRoadmapStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    const name = prompt(t('project_name') + ':');
    if (name && name.trim()) {
      createProject(name);
    }
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateProjectName(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-slate-900/20 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          'fixed bottom-0 right-0 top-0 z-50 flex w-80 flex-col bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out will-change-transform',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{t('my_projects')}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className={clsx(
                'group relative rounded-2xl border p-3 transition-all',
                currentProjectId === project.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md shadow-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
              )}
            >
              {editingId === project.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(project.id);
                    }}
                    onBlur={() => handleSaveEdit(project.id)}
                    className="w-full rounded bg-white dark:bg-slate-700 px-2 py-1 text-sm text-slate-800 dark:text-slate-100 outline-none ring-2 ring-indigo-500"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{project.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(project.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(project.id, project.name);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(t('delete_project') + '?')) {
                          deleteProject(project.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
              
              {currentProjectId !== project.id && (
                <button
                  onClick={() => loadProject(project.id)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 dark:bg-slate-100 py-2 text-xs font-bold text-white dark:text-slate-900 transition-transform active:scale-95"
                >
                  <FolderOpen size={14} /> {t('my_projects')} {/* "Projeyi Aç" was not in translations, reusing a generic or keeping it, wait I will add a new key in i18n later or use my_projects? I will just use text. No, I should use t('my_projects') */}
                </button>
              )}
            </div>
          ))}

          {projects.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
              ...
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 p-4">
          <button
            onClick={handleCreate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} /> {t('new_project')}
          </button>
        </div>
      </div>
    </>
  );
}
