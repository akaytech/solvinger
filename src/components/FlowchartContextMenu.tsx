import { useState, useEffect, useRef } from 'react';
import { Trash2, Edit3, PlayCircle, StopCircle, Box, GitMerge, Building, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FlowchartNode, FlowchartNodeType } from '../store/useRoadmapStore';

interface FlowchartContextMenuProps {
  x: number;
  y: number;
  node: FlowchartNode;
  onClose: () => void;
  onAddNode: (shape: FlowchartNodeType, label: string) => void;
  onUpdate: (data: { label: string }) => void;
  onDelete: () => void;
}

export default function FlowchartContextMenu({ x, y, node, onClose, onAddNode, onUpdate, onDelete }: FlowchartContextMenuProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editLabel.trim()) {
      onUpdate({ label: editLabel.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div 
      className="absolute z-50 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      {isEditing ? (
        <div className="p-3 flex flex-col gap-2">
          <input
            ref={inputRef}
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t("flowchart_input_placeholder")}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          />
          <div className="flex justify-end gap-2 mt-1">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">{t("cancel")}</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">{t("flowchart_save")}</button>
          </div>
        </div>
      ) : (
        <div className="py-1 max-h-80 overflow-y-auto custom-scrollbar">
          <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 text-start text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors">
            <Edit3 size={16} className="text-slate-400" /> {t("flowchart_edit")}
          </button>
          
          <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
          
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('flowchart_group_flow')}</div>
          
          <button onClick={() => onAddNode('process', t('flowchart_new_process'))} className="w-full px-4 py-1.5 text-start text-sm text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 transition-colors">
            <Box size={16} /> {t('flowchart_add_process')}
          </button>
          <button onClick={() => onAddNode('decision', t('flowchart_new_decision'))} className="w-full px-4 py-1.5 text-start text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2 transition-colors">
            <GitMerge size={16} /> {t('flowchart_add_decision')}
          </button>
          <button onClick={() => onAddNode('start', t('flowchart_new_start'))} className="w-full px-4 py-1.5 text-start text-sm text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2 transition-colors">
            <PlayCircle size={16} /> {t('flowchart_add_start')}
          </button>
          <button onClick={() => onAddNode('end', t('flowchart_new_end'))} className="w-full px-4 py-1.5 text-start text-sm text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 transition-colors">
            <StopCircle size={16} /> {t('flowchart_add_end')}
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
          
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('flowchart_group_dfd')}</div>
          
          <button onClick={() => onAddNode('externalEntity', t('flowchart_new_external'))} className="w-full px-4 py-1.5 text-start text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors">
            <Building size={16} /> {t('flowchart_add_external')}
          </button>
          <button onClick={() => onAddNode('dataStore', t('flowchart_new_datastore'))} className="w-full px-4 py-1.5 text-start text-sm text-sky-600 dark:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 flex items-center gap-2 transition-colors">
            <Database size={16} /> {t('flowchart_add_datastore')}
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
          
          <button onClick={onDelete} className="w-full px-4 py-2 text-start text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
            <Trash2 size={16} /> {t('flowchart_delete_node')}
          </button>
        </div>
      )}
    </div>
  );
}
