import { useState, useEffect, useRef } from 'react';
import type { GoalNode } from '../store/useRoadmapStore';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

type InlineDescriptionMenuProps = {
  node: GoalNode;
  onClose: () => void;
  onSave: (text: string) => void;
};

export default function InlineDescriptionMenu({
  node,
  onClose,
  onSave,
}: InlineDescriptionMenuProps) {
  const { t } = useTranslation();
  const [text, setText] = useState(node.data.description || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSaveAndClose = () => {
    onSave(text);
    onClose();
  };

  return (
    <div
      className="nodrag nopan nowheel w-72 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-2xl transition-all flex flex-col cursor-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('desc_task')}</span>
        <button 
          onClick={handleSaveAndClose}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors"
        >
          <Check size={14} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onSave(text)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        placeholder={t('desc_placeholder')}
        className="nodrag nopan nowheel w-full min-h-[280px] resize-none rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none transition-colors focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/10 custom-scrollbar"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
      />
    </div>
  );
}
