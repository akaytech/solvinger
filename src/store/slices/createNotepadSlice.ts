import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { syncProject } from '../useRoadmapStore';
import type { RoadmapState } from '../useRoadmapStore';

export interface NotepadSlice {
  addNotepadNote: (title: string, content: string) => string;
  updateNotepadNote: (noteId: string, title: string, content: string) => void;
  deleteNotepadNote: (noteId: string) => void;
}

export const createNotepadSlice: StateCreator<
  RoadmapState,
  [],
  [],
  NotepadSlice
> = (set, get) => ({
  addNotepadNote: (title, content) => {
    const state = get();
    if (!state.currentProjectId) return '';
    const noteId = uuidv4();
    const newNote = {
      id: noteId,
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updatedProjects = state.projects.map((p) => {
      if (p.id === state.currentProjectId) {
        return {
          ...p,
          notepad: [...(p.notepad || []), newNote]
        };
      }
      return p;
    });
    set({ projects: updatedProjects });
    syncProject(get());
    return noteId;
  },

  updateNotepadNote: (noteId, title, content) => {
    const state = get();
    if (!state.currentProjectId) return;
    const updatedProjects = state.projects.map((p) => {
      if (p.id === state.currentProjectId) {
        return {
          ...p,
          notepad: (p.notepad || []).map(n => n.id === noteId ? { ...n, title, content, updatedAt: Date.now() } : n)
        };
      }
      return p;
    });
    set({ projects: updatedProjects });
    syncProject(get());
  },

  deleteNotepadNote: (noteId) => {
    const state = get();
    if (!state.currentProjectId) return;
    const updatedProjects = state.projects.map((p) => {
      if (p.id === state.currentProjectId) {
        return {
          ...p,
          notepad: (p.notepad || []).filter(n => n.id !== noteId)
        };
      }
      return p;
    });
    set({ projects: updatedProjects });
    syncProject(get());
  },
});
