import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useNavigate, useLocation } from 'react-router-dom';
import RoadmapCanvas from './components/RoadmapCanvas';
import FiveWhysCanvas from './components/FiveWhysCanvas';
import SwotCanvas from './components/SwotCanvas';
import IshikawaCanvas from './components/IshikawaCanvas';
import PdcaCanvas from './components/PdcaCanvas';
import WaterfallCanvas from './components/WaterfallCanvas';
import WelcomeScreen from './components/WelcomeScreen';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TopRightUserMenu from './components/TopRightUserMenu';
import TopRightProjectsMenu from './components/TopRightProjectsMenu';
import { useRoadmapStore } from './store/useRoadmapStore';

function App() {
  const { user, fetchProjects, currentProjectId, loadProject, activeTool, setActiveTool } = useRoadmapStore();
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
  }, [user, user?.uid, fetchProjects]);

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
          </div>
        </ReactFlowProvider>
      )}
    </div>
  );
}

export default App;
