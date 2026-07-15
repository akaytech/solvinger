import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { useRoadmapStore } from '../store/useRoadmapStore';

export default function DescriptionModal({
  nodeId,
  onClose,
}: {
  nodeId: string;
  onClose: () => void;
}) {
  const { nodes, updateGoal } = useRoadmapStore();
  const node = nodes.find((n) => n.id === nodeId);
  const [text, setText] = useState('');

  useEffect(() => {
    if (node) {
      setText(node.data.description || '');
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    updateGoal(nodeId, { description: text });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Hedef Açıklaması</h2>
              <p className="text-xs font-semibold text-slate-400">{node.data.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Bu hedef veya görev hakkında detaylı açıklamaları, notları buraya yazabilirsin..."
            className="h-64 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            onClick={onClose}
            className="mr-3 rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-600/50"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
