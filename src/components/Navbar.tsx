import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { ChevronRight, ChevronLeft, Folder, LogOut, User } from 'lucide-react';
import clsx from 'clsx';
import packageJson from '../../package.json';

export default function Navbar({ onOpenProjects }: { onOpenProjects: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setCenter, getZoom } = useReactFlow();
  const { nodes, user, logout } = useRoadmapStore();

  const focusRoot = () => {
    // Find a root node (prefer 'root' or first node)
    const rootNode = nodes.find((n) => n.id === 'root') || nodes[0];
    if (rootNode) {
      setCenter(rootNode.position.x, rootNode.position.y, { zoom: Math.max(getZoom(), 0.8), duration: 800 });
    }
  };

  return (
    <div
      className={clsx(
        "relative flex h-full flex-col bg-white border-r border-slate-200 transition-all duration-300 z-50",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 z-10 text-slate-500"
      >
        {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Logo Area */}
      <div className={clsx("flex p-4 items-center", isExpanded ? "justify-start gap-3" : "justify-center")}>
        <button
          onClick={focusRoot}
          title="Ana Göreve Git"
          className="flex h-12 w-auto px-3 shrink-0 items-center justify-center rounded-xl bg-[#ff6666] shadow-lg shadow-[#ff6666]/30 transition-transform hover:scale-105 active:scale-95"
        >
          <span className="text-sm font-black tracking-widest text-white">
            {isExpanded ? "SOLVINGER" : "S"}
          </span>
        </button>
        
        {isExpanded && (
          <span className="overflow-hidden whitespace-nowrap text-xl font-black text-slate-800 transition-all">
            Solvinger
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col py-4 px-3 gap-2">
        <button
          onClick={onOpenProjects}
          title="Geçmiş Projelerim"
          className={clsx(
            "flex items-center gap-3 rounded-xl p-3 text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600",
            !isExpanded && "justify-center"
          )}
        >
          <Folder size={20} className="shrink-0" />
          {isExpanded && <span className="font-bold whitespace-nowrap overflow-hidden">Projelerim</span>}
        </button>
      </div>

      {/* User Profile Area */}
      {user && (
        <div className="border-t border-slate-100 p-3">
          <div className={clsx(
            "flex items-center gap-3 rounded-xl bg-slate-50 p-2 border border-slate-100",
            !isExpanded && "justify-center"
          )}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <User size={18} />
            </div>
            
            {isExpanded && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-slate-800">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            )}
            
            {isExpanded && (
              <button
                onClick={logout}
                title="Çıkış Yap"
                className="p-2 text-slate-400 hover:text-red-600 transition-colors shrink-0"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
          {!isExpanded && (
            <button
              onClick={logout}
              title="Çıkış Yap"
              className="mt-2 flex w-full justify-center p-2 text-slate-400 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      )}

      {/* Version Info */}
      <div className="py-3 text-center opacity-50">
        <span className={clsx("text-[10px] font-bold text-slate-400", !isExpanded && "text-[8px]")}>
          v{packageJson.version}
        </span>
      </div>
    </div>
  );
}
