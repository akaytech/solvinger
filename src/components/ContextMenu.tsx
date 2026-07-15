import type { GoalNodeData, GoalNode } from '../store/useRoadmapStore';
import { Plus, Trash2, CheckCircle, Calendar, Type, FileText } from 'lucide-react';

type ContextMenuProps = {
  x: number;
  y: number;
  node: GoalNode;
  onClose: () => void;
  onAddSubGoal: () => void;
  onUpdate: (data: Partial<GoalNodeData>) => void;
  onOpenDescription: () => void;
  onDelete: () => void;
};

export default function ContextMenu({
  x,
  y,
  node,
  onClose,
  onAddSubGoal,
  onUpdate,
  onOpenDescription,
  onDelete,
}: ContextMenuProps) {
  const hasDescription = !!node.data.description && node.data.description.trim().length > 0;

  return (
    <div
      style={{ top: y, left: x }}
      className="absolute z-50 w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl transition-all"
    >
      {/* İsim ve Tarih Düzenleme Alanları */}
      <div className="mb-2 space-y-2">
         <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-100 transition-colors focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10">
           <Type size={16} className="text-slate-400 shrink-0" />
           <input 
             type="text" 
             value={node.data.label}
             onChange={(e) => onUpdate({ label: e.target.value })}
             onKeyDown={(e) => { if (e.key === 'Enter') onClose(); }}
             placeholder="Görev İsmi"
             className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:font-normal"
           />
         </div>
         
         <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-100 transition-colors focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10">
           <Calendar size={16} className="text-slate-400 shrink-0" />
           <input 
             type="date" 
             value={node.data.targetDate || ''}
             onChange={(e) => onUpdate({ targetDate: e.target.value })}
             onKeyDown={(e) => { if (e.key === 'Enter') onClose(); }}
             className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
           />
         </div>
      </div>

      <div className="my-2 h-px w-full bg-slate-100" />

      <button
        onClick={() => { onOpenDescription(); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
      >
        <FileText size={18} className={hasDescription ? "text-indigo-500" : ""} /> 
        {hasDescription ? 'Açıklamayı Oku / Düzenle' : 'Açıklama Ekle'}
      </button>

      <button
        onClick={() => { onAddSubGoal(); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
      >
        <Plus size={18} /> Alt Görev Ekle
      </button>
      
      <div className="my-2 h-px w-full bg-slate-100" />
      
      <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Durum Değiştir</div>
      
      <button
        onClick={() => { onUpdate({ status: 'To Do' }); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <CheckCircle size={18} className="text-slate-400" /> Yapılacak
      </button>
      <button
        onClick={() => { onUpdate({ status: 'In Progress' }); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-emerald-50 transition-colors"
      >
        <CheckCircle size={18} className="text-emerald-500" /> Devam Ediyor
      </button>
      <button
        onClick={() => { onUpdate({ status: 'Done' }); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 transition-colors"
      >
        <CheckCircle size={18} className="text-indigo-500" /> Tamamlandı
      </button>
      
      <div className="my-2 h-px w-full bg-slate-100" />
      
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
      >
        <Trash2 size={18} /> Görevi Sil
      </button>
    </div>
  );
}
