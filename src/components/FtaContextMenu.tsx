import { useState, useEffect, useRef } from 'react';
import { Trash2, Box, CircleDot, Edit3, Diamond, Filter, Hexagon, GitBranch, ListOrdered } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FtaNode, FtaNodeType } from '../store/useRoadmapStore';

interface FtaContextMenuProps {
  x: number;
  y: number;
  node: FtaNode;
  onClose: () => void;
  onAddNode: (type: FtaNodeType, label: string) => void;
  onUpdate: (data: { label?: string; description?: string; probability?: number }) => void;
  onDelete: () => void;
}

export default function FtaContextMenu({ x, y, node, onClose, onAddNode, onUpdate, onDelete }: FtaContextMenuProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.data.label);
  const [editDesc, setEditDesc] = useState(node.data.description || '');
  const [editProb, setEditProb] = useState<string>(node.data.probability !== undefined ? String(node.data.probability * 100) : '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editLabel.trim()) {
      let probability: number | undefined = undefined;
      if (editProb.trim() !== '') {
        const val = parseFloat(editProb);
        if (!isNaN(val) && val >= 0 && val <= 100) {
          probability = val / 100;
        }
      }
      onUpdate({ label: editLabel.trim(), description: editDesc.trim(), probability });
    }
    setIsEditing(false);
  };

  const isBaseEvent = ['basicEvent', 'undevelopedEvent', 'conditioningEvent'].includes(node.data.type);

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
            placeholder={t("fta_title_input")}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 resize-none custom-scrollbar"
            placeholder={t("fta_desc_input")}
            rows={3}
          />
          {isBaseEvent && (
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">{t('fta_prob_input')}</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={editProb}
                onChange={(e) => setEditProb(e.target.value)}
                className="w-full px-2 py-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t('fta_prob_placeholder')}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">{t("cancel")}</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">{t("fta_save")}</button>
          </div>
        </div>
      ) : (
        <div className="py-1 max-h-80 overflow-y-auto custom-scrollbar">
          <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 text-start text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors">
            <Edit3 size={16} className="text-slate-400" /> {t("fta_edit")}
          </button>
          
          <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
          
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('fta_events')}</div>
          
          <button onClick={() => onAddNode('event', t('fta_new_event'))} className="w-full px-4 py-1.5 text-start text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2 transition-colors">
            <Box size={16} /> {t('fta_add_event')}
          </button>
          <button onClick={() => onAddNode('basicEvent', t('fta_new_basic'))} className="w-full px-4 py-1.5 text-start text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors">
            <CircleDot size={16} /> {t('fta_add_basic')}
          </button>
          <button onClick={() => onAddNode('undevelopedEvent', t('fta_new_undeveloped'))} className="w-full px-4 py-1.5 text-start text-sm text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2 transition-colors">
            <Diamond size={16} /> {t('fta_add_undeveloped')}
          </button>
          <button onClick={() => onAddNode('conditioningEvent', t('fta_new_conditioning'))} className="w-full px-4 py-1.5 text-start text-sm text-lime-600 dark:text-lime-500 hover:bg-lime-50 dark:hover:bg-lime-900/20 flex items-center gap-2 transition-colors">
            <Filter size={16} /> {t('fta_add_conditioning')}
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('fta_gates')}</div>

          <button onClick={() => onAddNode('andGate', t('fta_add_and'))} className="w-full px-4 py-1.5 text-start text-sm text-indigo-600 dark:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 transition-colors">
            <span className="font-black text-lg w-4 text-center">&amp;</span> {t('fta_add_and')}
          </button>
          <button onClick={() => onAddNode('priorityAndGate', t('fta_add_priority_and'))} className="w-full px-4 py-1.5 text-start text-sm text-violet-600 dark:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 flex items-center gap-2 transition-colors">
            <ListOrdered size={16} /> {t('fta_add_priority_and')}
          </button>
          <button onClick={() => onAddNode('orGate', t('fta_add_or'))} className="w-full px-4 py-1.5 text-start text-sm text-teal-600 dark:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 flex items-center gap-2 transition-colors">
            <span className="font-black text-sm w-4 text-center">≥1</span> {t('fta_add_or')}
          </button>
          <button onClick={() => onAddNode('exclusiveOrGate', t('fta_add_xor'))} className="w-full px-4 py-1.5 text-start text-sm text-cyan-600 dark:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 flex items-center gap-2 transition-colors">
            <GitBranch size={16} /> {t('fta_add_xor')}
          </button>
          <button onClick={() => onAddNode('inhibitGate', t('fta_add_inhibit'))} className="w-full px-4 py-1.5 text-start text-sm text-fuchsia-600 dark:text-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 flex items-center gap-2 transition-colors">
            <Hexagon size={16} /> {t('fta_add_inhibit')}
          </button>
          
          {node.id !== 'root' && (
            <>
              <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
              <button onClick={onDelete} className="w-full px-4 py-2 text-start text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                <Trash2 size={16} /> {t('fta_delete_node')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
