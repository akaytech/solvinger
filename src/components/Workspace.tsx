import React, { Suspense } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';

import UndoRedoControls from './UndoRedoControls';
import GlobalExportButton from './GlobalExportButton';
import GlobalShareButton from './GlobalShareButton';
import WelcomeScreen from './WelcomeScreen';

const RoadmapCanvas = React.lazy(() => import('./RoadmapCanvas'));
const FiveWhysCanvas = React.lazy(() => import('./FiveWhysCanvas'));
const SwotCanvas = React.lazy(() => import('./SwotCanvas'));
const IshikawaCanvas = React.lazy(() => import('./IshikawaCanvas'));
const PdcaCanvas = React.lazy(() => import('./PdcaCanvas'));
const WaterfallCanvas = React.lazy(() => import('./WaterfallCanvas'));
const FtaCanvas = React.lazy(() => import('./FtaCanvas'));
const DecisionMatrixCanvas = React.lazy(() => import('./DecisionMatrixCanvas').then(m => ({ default: m.DecisionMatrixCanvas })));
const FlowchartCanvas = React.lazy(() => import('./FlowchartCanvas'));
const ParetoCanvas = React.lazy(() => import('./ParetoCanvas'));
const HistogramCanvas = React.lazy(() => import('./HistogramCanvas'));
const NotepadCanvas = React.lazy(() => import('./NotepadCanvas'));
const EodCanvas = React.lazy(() => import('./EodCanvas'));

function DecisionMatrixWrapper() {
  const { currentProjectId, projects, addDecisionProject } = useRoadmapStore(useShallow((state) => ({
    currentProjectId: state.currentProjectId,
    projects: state.projects,
    addDecisionProject: state.addDecisionProject
  })));
  const { t } = useTranslation();

  const proj = projects.find(p => p.id === currentProjectId);
  if (!proj) return null;
  const dProject = proj.decision?.[0];
  if (!dProject) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <button 
          onClick={() => addDecisionProject(proj.name + ' - ' + t('decision_title'))}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 font-bold"
        >
          {t('app_start')}
        </button>
      </div>
    );
  }
  return <DecisionMatrixCanvas project={dProject} />;
}

export default function Workspace() {
  const activeTool = useRoadmapStore(s => s.activeTool);

  return (
    <ReactFlowProvider>
      <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-200 flex flex-col">
        {activeTool && <UndoRedoControls />}
        {activeTool && (
          <div className="absolute top-4 end-36 sm:end-40 z-[100] flex items-center gap-2">
            <GlobalShareButton />
            <GlobalExportButton />
          </div>
        )}
        
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }>
          {!activeTool && <WelcomeScreen />}
          {activeTool === 'wbs' && <RoadmapCanvas onNodeSelect={() => {}} />}
          {activeTool === '5whys' && <FiveWhysCanvas />}
          {activeTool === 'swot' && <SwotCanvas />}
          {activeTool === 'ishikawa' && <IshikawaCanvas />}
          {activeTool === 'pdca' && <PdcaCanvas />}
          {activeTool === 'waterfall' && <WaterfallCanvas />}
          {activeTool === 'fta' && <FtaCanvas />}
          {activeTool === 'flowchart' && <FlowchartCanvas />}
          {activeTool === 'pareto' && <ParetoCanvas />}
          {activeTool === 'histogram' && <HistogramCanvas />}
          {activeTool === 'notepad' && <NotepadCanvas />}
          {activeTool === 'eod' && <EodCanvas />}
          {activeTool === 'decision' && <DecisionMatrixWrapper />}
        </Suspense>
      </div>
    </ReactFlowProvider>
  );
}
