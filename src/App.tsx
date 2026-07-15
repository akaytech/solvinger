import { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import RoadmapCanvas from './components/RoadmapCanvas';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProjectsPanel from './components/ProjectsPanel';
import { useRoadmapStore } from './store/useRoadmapStore';

function App() {
  const { user, fetchProjects, currentProjectId, loadProject } = useRoadmapStore();
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch latest cloud data when app opens on any device
      fetchProjects(user.uid).then(() => {
        if (currentProjectId) {
          loadProject(currentProjectId);
        }
      });
    }
  }, [user?.uid]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {!user && <AuthModal />}
      
      {user && (
        <ReactFlowProvider>
          <Navbar onOpenProjects={() => setIsProjectsOpen(true)} />
          <div className="relative flex-1">
            <RoadmapCanvas onNodeSelect={() => {}} />
          </div>
          <ProjectsPanel isOpen={isProjectsOpen} onClose={() => setIsProjectsOpen(false)} />
        </ReactFlowProvider>
      )}
    </div>
  );
}

export default App;
