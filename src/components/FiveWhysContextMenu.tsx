import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check, Trash2, Edit3 } from 'lucide-react';
import type { FiveWhysNode } from '../store/useRoadmapStore';

interface ContextMenuProps {
  x: number;
  y: number;
  node: FiveWhysNode;
  onClose: () => void;
  onAddNode: (type: 'why' | 'solution', label: string) => void;
  onUpdate: (data: { label: string }) => void;
  onDelete: () => void;
}

export default function FiveWhysContextMenu({ x, y, node, onClose, onAddNode, onUpdate, onDelete }: ContextMenuProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.data.label);
  
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState<'why' | 'solution'>('why');
  const [newLabel, setNewLabel] = useState('');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.context-menu')) return;
      onClose();
    };
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('mousedown', handleGlobalClick);
    document.addEventListener('keydown', handleGlobalKey);
    document.addEventListener('close-menus', onClose);
    
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
      document.removeEventListener('keydown', handleGlobalKey);
      document.removeEventListener('close-menus', onClose);
    };
  }, [onClose]);

  useEffect(() => {
    if ((isEditing || isAddingNode) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing, isAddingNode]);

  const handleSaveEdit = () => {
    if (editLabel.trim() && editLabel !== node.data.label) {
      onUpdate({ label: editLabel });
    }
    setIsEditing(false);
    onClose();
  };

  const handleSaveAdd = () => {
    if (newLabel.trim()) {
      onAddNode(newNodeType, newLabel);
    }
    setIsAddingNode(false);
  };

  const isSolution = node.data.type === 'solution';

  return (
    <div
      className="context-menu absolute z-50 w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style={{ top: y, left: x }}
    >
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
          {node.data.type === 'problem' ? t('whys_problem') : node.data.type === 'solution' ? t('whys_root') : `${node.data.depth}. ${t('whys_why')}`}
        </div>
        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-3">
          {node.data.label}
        </div>
      </div>

      <div className="p-2 flex flex-col gap-1">
        {isEditing ? (
          <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-2">
             <textarea
               ref={inputRef}
               value={editLabel}
               onChange={(e) => setEditLabel(e.target.value)}
               className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 outline-none focus:border-indigo-500 resize-none custom-scrollbar h-24 text-slate-700 dark:text-slate-300"
               placeholder={t('whys_placeholder')}
             />
             <div className="flex justify-end gap-2">
               <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">{t('cancel') || 'Cancel'}</button>
               <button onClick={handleSaveEdit} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Kaydet</button>
             </div>
          </div>
        ) : isAddingNode ? (
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl space-y-2">
             <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 pl-1">
                {newNodeType === 'solution' ? t('whys_root') : t('whys_why')}
             </div>
             <textarea
               ref={inputRef}
               value={newLabel}
               onChange={(e) => setNewLabel(e.target.value)}
               className="w-full text-sm bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg p-3 outline-none focus:border-indigo-500 resize-none custom-scrollbar h-24 text-slate-700 dark:text-slate-300"
               placeholder={newNodeType === 'solution' ? t('whys_root_placeholder') : t('whys_why_placeholder')}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSaveAdd();
                 }
               }}
             />
             <div className="flex justify-end gap-2">
               <button onClick={() => setIsAddingNode(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">{t('cancel') || 'Cancel'}</button>
               <button onClick={handleSaveAdd} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Ekle</button>
             </div>
          </div>
        ) : (
          <>
            {!isSolution && (
              <>
                <button
                  onClick={() => { setIsAddingNode(true); setNewNodeType('why'); }}
                  className="flex items-center gap-3 w-full p-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors text-start font-medium"
                >
                  <div className="w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                    <Plus size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  {t('whys_why')} Ekle
                </button>
                <button
                  onClick={() => { setIsAddingNode(true); setNewNodeType('solution'); }}
                  className="flex items-center gap-3 w-full p-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors text-start font-medium"
                >
                  <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {t('whys_root')} Ekle
                </button>
              </>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-3 w-full p-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition-colors text-start font-medium mt-1"
            >
              <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Edit3 size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              {t('edit')}
            </button>

            <button
              onClick={onDelete}
              className="flex items-center gap-3 w-full p-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-start font-medium"
            >
              <div className="w-7 h-7 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <Trash2 size={16} />
              </div>
              Sil
            </button>
          </>
        )}
      </div>
    </div>
  );
}
