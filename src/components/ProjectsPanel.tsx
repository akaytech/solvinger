import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { X, Plus, FolderOpen, Trash2, Edit2 } from 'lucide-react';
import clsx from 'clsx';

export default function ProjectsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { projects, currentProjectId, createProject, loadProject, deleteProject, updateProjectName } = useRoadmapStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    const name = prompt('Yeni Proje Adı:');
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
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={clsx(
          'fixed bottom-0 right-0 top-0 z-50 flex w-80 flex-col bg-white shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="text-lg font-black text-slate-800">Projelerim</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
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
                  ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
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
                    className="w-full rounded bg-white px-2 py-1 text-sm outline-none ring-2 ring-indigo-500"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">{project.name}</h3>
                    <p className="text-xs text-slate-500">
                      Son Güncelleme: {new Date(project.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(project.id, project.name);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Bu projeyi silmek istediğine emin misin?')) {
                          deleteProject(project.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
              
              {currentProjectId !== project.id && (
                <button
                  onClick={() => loadProject(project.id)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 py-2 text-xs font-bold text-white transition-transform active:scale-95"
                >
                  <FolderOpen size={14} /> Projeyi Aç
                </button>
              )}
            </div>
          ))}

          {projects.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              Henüz kayıtlı bir projen yok.
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleCreate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} /> Yeni Proje Oluştur
          </button>
        </div>
      </div>
    </>
  );
}
