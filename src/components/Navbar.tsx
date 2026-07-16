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
      setCenter(rootNode.position.x + 220, rootNode.position.y + 55, { zoom: Math.max(getZoom(), 0.8), duration: 800 });
    }
  };

  return (
    <div
      className={clsx(
        "relative flex h-full flex-col bg-white transition-all duration-300 z-50",
        isExpanded ? "w-64 border-r border-slate-200" : "w-0 border-0"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className={clsx(
          "absolute top-8 flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-slate-200 shadow-md hover:bg-slate-50 z-10 text-slate-500 transition-all hover:scale-110 active:scale-95",
          isExpanded ? "-right-5" : "left-4"
        )}
      >
        {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>

      <div className={clsx("flex h-full flex-col w-64 overflow-hidden transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 pointer-events-none")}>
      {/* Logo Area */}
      <div className="flex p-4 items-center justify-center">
        <button
          onClick={focusRoot}
          title="Ana Göreve Git"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100 transition-transform hover:scale-105 active:scale-95 overflow-hidden p-1"
        >
          <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Solvinger Logo" className="h-full w-full object-contain rounded-xl" />
        </button>
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
    </div>
  );
}
