import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import type { WaterfallPhase } from '../store/useRoadmapStore';
import { Plus, Trash2, ArrowDownRight, Layers, BookOpen, PenTool, Code, CheckSquare, Shield, Lock, CheckCircle2, Server } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import ToolHeader from './ToolHeader';

export default function WaterfallCanvas() {
  const { t } = useTranslation();

  const PHASES: { id: WaterfallPhase; title: string; icon: any; color: string; bg: string; border: string; buttonBg: string; desc: string; indent: string }[] = [
    { id: 'Requirements', title: t('req'), icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-900/50', buttonBg: 'bg-indigo-600 hover:bg-indigo-700', desc: t('req_desc'), indent: 'ml-0' },
    { id: 'High-Level Design', title: t('wf_hld'), icon: PenTool, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-900/50', buttonBg: 'bg-purple-600 hover:bg-purple-700', desc: t('wf_hld_desc'), indent: 'ml-0 md:ml-12' },
    { id: 'Low-Level Design', title: t('wf_lld'), icon: Server, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-900/50', buttonBg: 'bg-cyan-600 hover:bg-cyan-700', desc: t('wf_lld_desc'), indent: 'ml-0 md:ml-24' },
    { id: 'Implementation', title: t('imp'), icon: Code, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900/50', buttonBg: 'bg-blue-600 hover:bg-blue-700', desc: t('imp_desc'), indent: 'ml-0 md:ml-36' },
    { id: 'Verification', title: t('ver'), icon: CheckSquare, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-900/50', buttonBg: 'bg-amber-600 hover:bg-amber-700', desc: t('ver_desc'), indent: 'ml-0 md:ml-48' },
    { id: 'Maintenance', title: t('mai'), icon: Shield, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900/50', buttonBg: 'bg-emerald-600 hover:bg-emerald-700', desc: t('mai_desc'), indent: 'ml-0 md:ml-60' },
  ];

  const {  waterfall, addWaterfallProject, updateWaterfallProjectName, deleteWaterfallProject, addWaterfallItem, updateWaterfallItem, deleteWaterfallItem, advanceWaterfallPhase  } = useRoadmapStore(useShallow((state) => ({
      waterfall: state.waterfall,
      addWaterfallProject: state.addWaterfallProject,
      updateWaterfallProjectName: state.updateWaterfallProjectName,
      deleteWaterfallProject: state.deleteWaterfallProject,
      addWaterfallItem: state.addWaterfallItem,
      updateWaterfallItem: state.updateWaterfallItem,
      deleteWaterfallItem: state.deleteWaterfallItem,
      advanceWaterfallPhase: state.advanceWaterfallPhase
    })));
  const [newProject, setNewProject] = useState('');
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.trim()) return;
    addWaterfallProject(newProject);
    setNewProject('');
  };

  const handleAddItem = (e: React.FormEvent, projectId: string, phase: WaterfallPhase) => {
    e.preventDefault();
    const key = `${projectId}-${phase}`;
    const text = inputs[key];
    if (!text?.trim()) return;
    addWaterfallItem(projectId, phase, text);
    setInputs(prev => ({ ...prev, [key]: '' }));
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 transition-colors overflow-hidden">
      <ToolHeader title={t('wf_title')} subtitle={t('wf_subtitle')} icon={<Layers />} iconColor="text-blue-500" dividerOnTop={true} />

      <div className="flex-1 overflow-auto p-6 md:p-8 space-y-12">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              placeholder={t('wf_placeholder')}
              className="flex-1 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 text-lg outline-none focus:border-blue-500 dark:focus:border-blue-500 shadow-sm text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!newProject.trim()}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              <Plus size={24} />
              <span className="font-bold">{t('start')}</span>
            </button>
          </form>
        </div>

        <div className="mx-auto max-w-5xl space-y-16">
          {waterfall.map((project) => (
            <div key={project.id} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 md:p-10 shadow-xl relative overflow-hidden">
              
              <div className="mb-12 flex items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6 relative z-10">
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-inner">
                    <Layers size={28} />
                  </div>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateWaterfallProjectName(project.id, e.target.value)}
                    className="flex-1 bg-transparent text-3xl font-black text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-300"
                  />
                </div>
                <button
                  onClick={() => deleteWaterfallProject(project.id)}
                  className="flex shrink-0 items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 size={18} />
                  {t('delete')}
                </button>
              </div>

              <div className="space-y-6 relative z-10 pb-10">
                {PHASES.map((phase, index) => {
                  const items = project.items.filter(i => i.phase === phase.id);
                  const inputKey = `${project.id}-${phase.id}`;
                  const isCompleted = index < (project.currentPhaseIndex ?? 0);
                  const isLocked = index > (project.currentPhaseIndex ?? 0);
                  const isActive = index === (project.currentPhaseIndex ?? 0);
                  
                  return (
                    <div key={phase.id} className={clsx("flex flex-col relative", phase.indent)}>
                      
                      {/* Connection Line to next phase */}
                      {index < PHASES.length - 1 && (
                        <div className="hidden md:block absolute left-8 top-full h-12 w-12 border-l-2 border-b-2 border-slate-300 dark:border-slate-700 rounded-bl-3xl -z-10 translate-y-[-10px]">
                           <ArrowDownRight size={24} className="absolute -bottom-3 -right-3 text-slate-300 dark:text-slate-700" />
                        </div>
                      )}

                      <div className={clsx(
                        "flex flex-col rounded-2xl border-2 shadow-md overflow-hidden w-full md:w-[600px] bg-opacity-90 backdrop-blur-sm transition-all duration-300",
                        phase.border, phase.bg,
                        isLocked && "opacity-50 grayscale"
                      )}>
                        <div className="p-5 flex items-center justify-between border-b border-white/20 dark:border-black/20 bg-white/60 dark:bg-black/30">
                          <div className="flex flex-col">
                            <h4 className={`text-xl font-black ${phase.color} flex items-center gap-2`}>
                              <phase.icon size={24} />
                              {phase.title}
                            </h4>
                            <span className={`text-sm opacity-80 mt-1 ${phase.color}`}>{phase.desc}</span>
                          </div>
                          {isCompleted && <CheckCircle2 size={24} className="text-emerald-500" />}
                          {isLocked && <Lock size={24} className="text-slate-400" />}
                        </div>
                        
                        <div className="p-4 space-y-3">
                          {isLocked ? (
                            <div className="flex flex-col items-center justify-center p-6 text-slate-500 text-sm font-medium">
                              <Lock size={32} className="mb-2 opacity-50" />
                              {t('wf_phase_locked')}
                            </div>
                          ) : (
                            <>
                              {items.map(item => (
                                <div key={item.id} className={clsx("group relative flex items-start gap-3 rounded-xl p-4 shadow-sm border transition-shadow", isCompleted ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-md")}>
                                  <textarea
                                    value={item.text}
                                    onChange={(e) => updateWaterfallItem(project.id, item.id, e.target.value)}
                                    disabled={isCompleted}
                                    className="flex-1 resize-none bg-transparent outline-none text-slate-700 dark:text-slate-200 disabled:opacity-80"
                                    rows={2}
                                  />
                                  {!isCompleted && (
                                    <button
                                      onClick={() => deleteWaterfallItem(project.id, item.id)}
                                      className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 shadow-sm"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              ))}
                              
                              {!isCompleted && (
                                <form onSubmit={(e) => handleAddItem(e, project.id, phase.id)} className="flex gap-2 mt-2">
                                  <input
                                    type="text"
                                    value={inputs[inputKey] || ''}
                                    onChange={(e) => setInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
                                    placeholder={t('wf_add_item')}
                                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-4 py-2 text-sm outline-none focus:border-slate-400 text-slate-800 dark:text-slate-100"
                                  />
                                  <button
                                    type="submit"
                                    disabled={!inputs[inputKey]?.trim()}
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 ${phase.buttonBg}`}
                                  >
                                    <Plus size={20} />
                                  </button>
                                </form>
                              )}
                              
                              {isActive && index < PHASES.length - 1 && (
                                <div className="pt-4 mt-4 border-t border-white/20 dark:border-black/20">
                                  <button
                                    onClick={() => advanceWaterfallPhase(project.id)}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-md transition-all active:scale-95"
                                  >
                                    <CheckSquare size={20} />
                                    {t('wf_complete_phase')}
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {waterfall.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
              <Layers size={72} className="mb-6 opacity-20" />
              <p className="text-xl">{t('wf_empty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
