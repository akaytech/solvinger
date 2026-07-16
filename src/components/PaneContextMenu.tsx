import { PlusCircle } from 'lucide-react';
import { useRoadmapStore } from '../store/useRoadmapStore';

export default function PaneContextMenu({
  x,
  y,
  onClose,
  onAddRootGoal,
}: {
  x: number;
  y: number;
  onClose: () => void;
  onAddRootGoal: () => void;
}) {
  const { nodes, edges, loadData } = useRoadmapStore();


  return (
    <div
      style={{ top: y, left: x }}
      className="absolute z-50 w-56 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl transition-all"
    >
      <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Harita İşlemleri</div>

      <button
        onClick={onAddRootGoal}
        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
      >
        <PlusCircle size={18} className="text-emerald-500" /> Yeni Ana Görev
      </button>

      
      <div className="mt-2 text-center">
        <button onClick={onClose} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Kapat</button>
      </div>
    </div>
  );
}
