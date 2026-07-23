import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, FileText } from 'lucide-react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import clsx from 'clsx';

const NotepadCanvas: React.FC = () => {
  const { t } = useTranslation();
  const {  currentProjectId, projects, addNotepadNote, updateNotepadNote, deleteNotepadNote  } = useRoadmapStore(useShallow((state) => ({
      currentProjectId: state.currentProjectId,
      projects: state.projects,
      addNotepadNote: state.addNotepadNote,
      updateNotepadNote: state.updateNotepadNote,
      deleteNotepadNote: state.deleteNotepadNote
    })));
  
  const project = projects.find(p => p.id === currentProjectId);
  const notes = project?.notepad || [];
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
  
  // Local state for smooth typing without cursor jumps
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  useEffect(() => {
    if (selectedNote) {
      setLocalTitle(selectedNote.title);
      setLocalContent(selectedNote.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId, selectedNote?.id]); // Only run when changing selected note, NOT on every render


  const handleAddNote = () => {
    const newId = addNotepadNote(t('notepad_untitled_note'), '');
    setSelectedNoteId(newId);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotepadNote(id);
    if (selectedNoteId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalTitle(val);
    if (selectedNoteId) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        updateNotepadNote(selectedNoteId, val, localContent);
      }, 500);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalContent(val);
    if (selectedNoteId) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        updateNotepadNote(selectedNoteId, localTitle, val);
      }, 500);
    }
  };

  const handleBlur = () => {
    if (selectedNoteId && selectedNote) {
      if (localTitle !== selectedNote.title || localContent !== selectedNote.content) {
        updateNotepadNote(selectedNoteId, localTitle, localContent);
      }
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-800 dark:text-slate-200 pt-16 md:pt-20">
      
      {/* Sidebar */}
      <div className="w-72 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-r border-slate-200 dark:border-slate-700/50 flex flex-col transition-all duration-300 shadow-sm z-10">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-white/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            {t('notepad_title')}
          </h2>
          <button
            onClick={handleAddNote}
            className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors group"
            title={t('notepad_add_note')}
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              className={clsx(
                "group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border",
                selectedNoteId === note.id 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm" 
                  : "bg-white dark:bg-slate-800/80 border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={clsx(
                  "font-semibold text-sm truncate pr-6",
                  selectedNoteId === note.id ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"
                )}>
                  {note.title || t('notepad_untitled_note')}
                </h3>
                <button
                  onClick={(e) => handleDelete(e, note.id)}
                  className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title={t('notepad_delete_note')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {note.content || '...'}
              </p>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                {new Date(note.updatedAt).toLocaleDateString()} {new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="text-center p-6 text-sm text-slate-500 dark:text-slate-400">
              {t('notepad_no_notes')}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 relative">
        {selectedNoteId && selectedNote ? (
          <div className="flex-1 flex flex-col p-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <input
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={handleBlur}
              placeholder={t('notepad_type_title')}
              className="text-4xl font-bold bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 mb-6 w-full focus:ring-0"
            />
            <textarea
              value={localContent}
              onChange={handleContentChange}
              onBlur={handleBlur}
              placeholder={t('notepad_type_content')}
              className="flex-1 resize-none bg-transparent border-none outline-none text-lg text-slate-600 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600 w-full focus:ring-0 custom-scrollbar leading-relaxed"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center animate-in fade-in duration-700">
            <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-lg font-medium">{t('notepad_no_notes')}</p>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default NotepadCanvas;
