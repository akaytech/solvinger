import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactFlowProvider } from '@xyflow/react';
import { useNavigate, useLocation } from 'react-router-dom';
import RoadmapCanvas from './components/RoadmapCanvas';
import FiveWhysCanvas from './components/FiveWhysCanvas';
import SwotCanvas from './components/SwotCanvas';
import IshikawaCanvas from './components/IshikawaCanvas';
import PdcaCanvas from './components/PdcaCanvas';
import WaterfallCanvas from './components/WaterfallCanvas';
import FtaCanvas from './components/FtaCanvas';
import { DecisionMatrixCanvas } from './components/DecisionMatrixCanvas';
import WelcomeScreen from './components/WelcomeScreen';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TopRightUserMenu from './components/TopRightUserMenu';
import TopRightProjectsMenu from './components/TopRightProjectsMenu';
import { useRoadmapStore } from './store/useRoadmapStore';

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
            {!activeTool && <WelcomeScreen />}
            {activeTool === 'wbs' && <RoadmapCanvas onNodeSelect={() => {}} />}
            {activeTool === '5whys' && <FiveWhysCanvas />}
            {activeTool === 'swot' && <SwotCanvas />}
            {activeTool === 'ishikawa' && <IshikawaCanvas />}
            {activeTool === 'pdca' && <PdcaCanvas />}
            {activeTool === 'waterfall' && <WaterfallCanvas />}
            {activeTool === 'fta' && <FtaCanvas />}
            {activeTool === 'decision' && (() => {
              const proj = projects.find(p => p.id === currentProjectId);
              if (!proj) return null;
              if (!proj.decision || proj.decision.length === 0) {
                // Return a wrapper that forces creation, or we can just render nothing until they create one, 
                // wait, if there are none, we should create an initial one just like other tools?
                // Other tools don't auto-create inside App.tsx, they usually have it done inside WelcomeScreen / createProject.
                // Wait! In useRoadmapStore createProject, we initialized decision: [] but we didn't add a default item!
                // Let's check how waterfall works. Waterfall initializes waterfall: [], but wait, does WaterfallCanvas create one if empty?
              }
              // If none exists, we should show a button or auto create. Let's auto-create if empty or just render the first one.
              const dProject = proj.decision?.[0];
              if (!dProject) {
                return (
                  <div className="flex h-full w-full items-center justify-center">
                    <button 
                      onClick={() => useRoadmapStore.getState().addDecisionProject(proj.name + ' - Karar Matrisi')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 font-bold"
                    >
                      {t('app_start')}
                    </button>
                  </div>
                );
              }
              return <DecisionMatrixCanvas project={dProject} />;
            })()}
          </div>
        </ReactFlowProvider>
      )}
    </div>
  );
}

export default App;
