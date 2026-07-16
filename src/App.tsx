import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import RoadmapCanvas from './components/RoadmapCanvas';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TopRightUserMenu from './components/TopRightUserMenu';
import TopRightProjectsMenu from './components/TopRightProjectsMenu';
import { useRoadmapStore } from './store/useRoadmapStore';

function App() {
  const { user, fetchProjects, currentProjectId, loadProject } = useRoadmapStore();

  useEffect(() => {
    if (user) {
      // Fetch latest cloud data when app opens on any device
      fetchProjects(user.uid).then(() => {
        if (currentProjectId) {
          loadProject(currentProjectId);
        }
      });
    }
  }, [user, user?.uid, fetchProjects, loadProject, currentProjectId]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {!user && <AuthModal />}
      
      {user && (
        <ReactFlowProvider>
          <Navbar />
          <div className="relative flex-1">
            <TopRightUserMenu />
            <TopRightProjectsMenu />
            <RoadmapCanvas onNodeSelect={() => {}} />
          </div>
        </ReactFlowProvider>
      )}
    </div>
  );
}

export default App;
