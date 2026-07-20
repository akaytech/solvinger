import React, { useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactFlowProvider } from '@xyflow/react';
import { useNavigate, useLocation } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TopRightUserMenu from './components/TopRightUserMenu';
import TopRightProjectsMenu from './components/TopRightProjectsMenu';
import { useRoadmapStore } from './store/useRoadmapStore';

const RoadmapCanvas = React.lazy(() => import('./components/RoadmapCanvas'));
const FiveWhysCanvas = React.lazy(() => import('./components/FiveWhysCanvas'));
const SwotCanvas = React.lazy(() => import('./components/SwotCanvas'));
const IshikawaCanvas = React.lazy(() => import('./components/IshikawaCanvas'));
const PdcaCanvas = React.lazy(() => import('./components/PdcaCanvas'));
const WaterfallCanvas = React.lazy(() => import('./components/WaterfallCanvas'));
const FtaCanvas = React.lazy(() => import('./components/FtaCanvas'));
const DecisionMatrixCanvas = React.lazy(() => import('./components/DecisionMatrixCanvas').then(m => ({ default: m.DecisionMatrixCanvas })));
const FlowchartCanvas = React.lazy(() => import('./components/FlowchartCanvas'));
const ParetoCanvas = React.lazy(() => import('./components/ParetoCanvas'));
const HistogramCanvas = React.lazy(() => import('./components/HistogramCanvas'));
const NotepadCanvas = React.lazy(() => import('./components/NotepadCanvas'));

function App() {
  const { user, fetchProjects, currentProjectId, loadProject, activeTool, setActiveTool, projects } = useRoadmapStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      // Fetch latest cloud data when app opens on any device
      fetchProjects(user.uid).then(() => {
        if (currentProjectId && location.pathname === '/') {
          // If we open at root but have a persistent project, we let the state sync handle it
        }
      });
    }
  }, [user, user?.uid, fetchProjects, currentProjectId, location.pathname]);

  // URL -> State (Back button, manual URL entry)
  useEffect(() => {
    if (!user) return;
    const path = location.pathname;
    if (path === '/') {
      if (activeTool !== null) setActiveTool(null);
    } else if (path.startsWith('/project/')) {
      const parts = path.split('/');
      const pId = parts[2];
      const tId = parts[3];
      if (pId && pId !== currentProjectId) {
         loadProject(pId);
      }
      if (tId && tId !== activeTool) {
         setActiveTool(tId as any);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user]);

  // State -> URL (Clicking buttons in the app)
  useEffect(() => {
    if (!user) return;
    const path = location.pathname;
    if (!activeTool) {
      if (path !== '/') navigate('/');
    } else if (currentProjectId && activeTool) {
      const newPath = `/project/${currentProjectId}/${activeTool}`;
      if (path !== newPath) navigate(newPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId, activeTool, user]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {!user && <AuthModal />}
      
      {user && (
        <ReactFlowProvider>
          <Navbar />
          <div className="relative flex-1 flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
            <TopRightUserMenu />
            <TopRightProjectsMenu />
            <div className="flex-1 relative bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
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
              {activeTool === 'decision' && (() => {
                const proj = projects.find(p => p.id === currentProjectId);
                if (!proj) return null;
                const dProject = proj.decision?.[0];
                if (!dProject) {
                  return (
                    <div className="flex h-full w-full items-center justify-center">
                      <button 
                        onClick={() => useRoadmapStore.getState().addDecisionProject(proj.name + ' - ' + t('decision_title'))}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 font-bold"
                      >
                        {t('app_start')}
                      </button>
                    </div>
                  );
                }
                return <DecisionMatrixCanvas project={dProject} />;
              })()}
            </Suspense>
          </div>
          </div>
        </ReactFlowProvider>
      )}
    </div>
  );
}

export default App;
