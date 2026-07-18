import { useState, useEffect, useRef } from 'react';
import { Trash2, Box, CircleDot, Edit3 } from 'lucide-react';
import type { FtaNode, FtaNodeType } from '../store/useRoadmapStore';

interface FtaContextMenuProps {
  x: number;
  y: number;
  node: FtaNode;
  onClose: () => void;
  onAddNode: (type: FtaNodeType, label: string) => void;
  onUpdate: (data: { label?: string; description?: string }) => void;
  onDelete: () => void;
}

export default function FtaContextMenu({ x, y, node, onClose, onAddNode, onUpdate, onDelete }: FtaContextMenuProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.data.label);
  const [editDesc, setEditDesc] = useState(node.data.description || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editLabel.trim()) {
      onUpdate({ label: editLabel.trim(), description: editDesc.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div 
      className="absolute z-50 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      {isEditing ? (
        <div className="p-3">
          <input
            ref={inputRef}
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            placeholder="Başlık..."
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 resize-none custom-scrollbar"
            placeholder="Açıklama (İsteğe bağlı)..."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">İptal</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Kaydet</button>
          </div>
        </div>
      ) : (
        <div className="py-1">
          <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors">
            <Edit3 size={16} className="text-slate-400" /> Düzenle
          </button>
          
          <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
          
          <button onClick={() => onAddNode('event', 'Yeni Ara Olay')} className="w-full px-4 py-2 text-left text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2 transition-colors">
            <Box size={16} /> Olay Ekle
          </button>
          <button onClick={() => onAddNode('andGate', 'VE Kapısı')} className="w-full px-4 py-2 text-left text-sm text-indigo-600 dark:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 transition-colors">
            <span className="font-black text-lg w-4 text-center">&</span> VE Kapısı (AND)
          </button>
          <button onClick={() => onAddNode('orGate', 'VEYA Kapısı')} className="w-full px-4 py-2 text-left text-sm text-teal-600 dark:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 flex items-center gap-2 transition-colors">
            <span className="font-black text-sm w-4 text-center">≥1</span> VEYA Kapısı (OR)
          </button>
          <button onClick={() => onAddNode('basicEvent', 'Temel Neden')} className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors">
            <CircleDot size={16} /> Temel Neden Ekle
          </button>
          
          {node.id !== 'root' && (
            <>
              <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
              <button onClick={onDelete} className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                <Trash2 size={16} /> Düğümü Sil
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
