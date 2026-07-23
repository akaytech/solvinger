import React, { useEffect, Suspense, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import TopRightUserMenu from './components/TopRightUserMenu';
import TopRightProjectsMenu from './components/TopRightProjectsMenu';
import TopRightMobileMoreMenu from './components/TopRightMobileMoreMenu';
import { useRoadmapStore } from './store/useRoadmapStore';
import { useAuthStore } from './store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';

const Workspace = React.lazy(() => import('./components/Workspace'));

export default function AuthenticatedApp() {
  const user = useAuthStore(state => state.user);
  
  const { fetchProjects, currentProjectId, loadProject, activeTool, setActiveTool, projects, joinSharedProject, projectsLoaded } = useRoadmapStore(useShallow((state) => ({
    fetchProjects: state.fetchProjects,
    currentProjectId: state.currentProjectId,
    loadProject: state.loadProject,
    activeTool: state.activeTool,
    setActiveTool: state.setActiveTool,
    projects: state.projects,
    joinSharedProject: state.joinSharedProject,
    projectsLoaded: state.projectsLoaded
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

  const isFirstSyncRef = useRef(true);
  const lastPathnameRef = useRef(location.pathname);

  // Unified URL <-> State Synchronization
  useEffect(() => {
    if (!user || !projectsLoaded) return;
    
    const path = location.pathname;
    const urlChanged = path !== lastPathnameRef.current;
    lastPathnameRef.current = path;

    let isUrlSyncRunning = false;

    // 1. URL -> State (Priority 1: Sync state from URL if URL changed or initial load)
    if (urlChanged || isFirstSyncRef.current) {
      if (path === '/') {
        if (activeTool !== null) {
          setActiveTool(null);
          isUrlSyncRunning = true;
        }
      } else if (path.startsWith('/project/')) {
        const parts = path.split('/');
        const pId = parts[2];
        const tId = parts[3];
        
        let needsStateUpdate = false;
        if (pId && pId !== currentProjectId) {
           const exists = projects.find(p => p.id === pId);
           if (exists) {
             loadProject(pId);
           } else {
             joinSharedProject(pId);
           }
           needsStateUpdate = true;
        }
        if (tId && tId !== activeTool) {
           setActiveTool(tId as any);
           needsStateUpdate = true;
        }
        
        if (needsStateUpdate) {
           isUrlSyncRunning = true;
        }
      }
    }

    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
    }

    // 2. State -> URL (Priority 2: Sync URL from state if state changed via UI interaction)
    // We only execute this if we didn't just trigger a state update to match the URL.
    if (!isUrlSyncRunning) {
      if (!activeTool) {
        if (path !== '/') navigate('/');
      } else if (currentProjectId && activeTool) {
        const newPath = `/project/${currentProjectId}/${activeTool}`;
        if (path !== newPath) navigate(newPath);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user, currentProjectId, activeTool, projects, loadProject, joinSharedProject, projectsLoaded, navigate, setActiveTool]);

  return (
    <>
      <Navbar />
      <div className="relative flex-1 flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
        <TopRightUserMenu />
        <TopRightProjectsMenu />
        <TopRightMobileMoreMenu />
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <Workspace />
        </Suspense>
      </div>
    </>
  );
}
