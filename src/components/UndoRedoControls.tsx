import React, { useEffect, useCallback } from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';

const UndoRedoControls: React.FC = () => {
  const { t } = useTranslation();

  const { undo, redo, pastStates, futureStates } = useStore(useRoadmapStore.temporal, (state) => state);
  const forceSync = useRoadmapStore((state) => state.forceSync);

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
      forceSync();
    }
  }, [canUndo, undo, forceSync]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
      forceSync();
    }
  }, [canRedo, redo, forceSync]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="absolute top-4 start-4 z-[100] flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className={`p-1.5 rounded-lg transition-colors ${
          canUndo
            ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
        }`}
        title={t('undo')} aria-label={t('undo')}
      >
        <Undo2 size={18} />
      </button>
      <button
        onClick={handleRedo}
        disabled={!canRedo}
        className={`p-1.5 rounded-lg transition-colors ${
          canRedo
            ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
        }`}
        title={t('redo')} aria-label={t('redo')}
      >
        <Redo2 size={18} />
      </button>
    </div>
  );
};

export default UndoRedoControls;
