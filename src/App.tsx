import React, { useEffect, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TopRightUserMenu from './components/TopRightUserMenu';
import TopRightProjectsMenu from './components/TopRightProjectsMenu';
import { useRoadmapStore } from './store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
const Workspace = React.lazy(() => import('./components/Workspace'));

function App() {
  const { user, fetchProjects, currentProjectId, loadProject, activeTool, setActiveTool, projects, joinSharedProject } = useRoadmapStore(useShallow((state) => ({
    user: state.user,
    fetchProjects: state.fetchProjects,
    currentProjectId: state.currentProjectId,
    loadProject: state.loadProject,
    activeTool: state.activeTool,
    setActiveTool: state.setActiveTool,
    projects: state.projects,
    joinSharedProject: state.joinSharedProject
  })));
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Clear undo/redo history when active tool or project changes
    useRoadmapStore.temporal.getState().clear();
  }, [activeTool, currentProjectId]);

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
         const exists = projects.find(p => p.id === pId);
         if (exists) {
           loadProject(pId);
         } else {
           joinSharedProject(pId);
         }
      }
      if (tId && tId !== activeTool) {
         setActiveTool(tId as any);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user, currentProjectId, projects, loadProject, joinSharedProject]);

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
        <>
          <Navbar />
          <div className="relative flex-1 flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
            <TopRightUserMenu />
            <TopRightProjectsMenu />
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            }>
              <Workspace />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
