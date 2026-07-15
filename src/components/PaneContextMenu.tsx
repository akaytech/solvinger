import { useRef } from 'react';
import { Download, Upload, PlusCircle } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zihin-haritam.roadmap';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.nodes && parsed.edges) {
          loadData(parsed.nodes, parsed.edges);
        } else {
          alert('Geçersiz dosya formatı.');
        }
      } catch (err) {
        alert('Dosya okunamadı. Lütfen geçerli bir .roadmap veya .json dosyası seçin.');
      }
      onClose();
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      style={{ top: y, left: x }}
      className="absolute z-50 w-56 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl transition-all"
    >
      <input
        type="file"
        accept=".roadmap,.json"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
      />
      
      <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Harita İşlemleri</div>

      <button
        onClick={onAddRootGoal}
        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
      >
        <PlusCircle size={18} className="text-emerald-500" /> Yeni Ana Görev
      </button>

      <div className="my-2 h-px w-full bg-slate-100" />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Upload size={18} className="text-slate-400" /> Dosyadan Aç
      </button>

      <button
        onClick={handleExport}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <Download size={18} className="text-indigo-500" /> Dosyaya Kaydet
      </button>
      
      <div className="mt-2 text-center">
        <button onClick={onClose} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Kapat</button>
      </div>
    </div>
  );
}
