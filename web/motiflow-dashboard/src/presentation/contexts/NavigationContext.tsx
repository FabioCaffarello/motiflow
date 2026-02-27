'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export type NavigationGroup = 'dashboard' | 'agile' | 'documentation' | null;

interface NavigationContextType {
  activeGroup: NavigationGroup;
  sidebarOpen: boolean;
  activePath: string;
  setActiveGroup: (group: NavigationGroup) => void;
  toggleSidebar: () => void;
  setActivePath: (path: string) => void;
  closeSidebar: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

/**
 * NavigationProvider
 * 
 * Provides navigation state management for the dashboard.
 * Automatically detects active group based on current pathname.
 */
export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const [activeGroup, setActiveGroupState] = useState<NavigationGroup>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activePath, setActivePathState] = useState<string>(pathname || '/');
  const [userSetGroup, setUserSetGroup] = useState<boolean>(false);

  // Update active path when pathname changes
  useEffect(() => {
    setActivePathState(pathname || '/');
  }, [pathname]);

  // Auto-detect active group based on pathname (only if user hasn't manually set it)
  useEffect(() => {
    if (userSetGroup) return; // Don't auto-detect if user manually set the group
    
    if (!pathname) {
      setActiveGroupState(null);
      setSidebarOpen(false);
      return;
    }

    // Dashboard - has custom sidebar
    if (pathname === '/') {
      setActiveGroupState('dashboard');
      setSidebarOpen(true); // Dashboard has custom sidebar
      return;
    }

    // Agile group - always show sidebar
    // Includes backlog items (epics, stories, tasks) and other agile items (kanban, sprints)
    // Check /backlog first since it's the main entry point for agile
    if (pathname.startsWith('/backlog') ||
        pathname.startsWith('/epics') || 
        pathname.startsWith('/stories') || 
        pathname.startsWith('/tasks') ||
        pathname.startsWith('/kanban') || 
        pathname.startsWith('/sprints')) {
      setActiveGroupState('agile');
      setSidebarOpen(true); // Always open for groups with sidebar
      return;
    }

    // Documentation group - always show sidebar
    if (pathname.startsWith('/adrs') || pathname.startsWith('/roadmap')) {
      setActiveGroupState('documentation');
      setSidebarOpen(true); // Always open for groups with sidebar
      return;
    }

    // Default: no active group
    setActiveGroupState(null);
    setSidebarOpen(false);
  }, [pathname, userSetGroup]);

  // Reset userSetGroup when pathname changes to a different group's route
  useEffect(() => {
    if (!userSetGroup) return;
    
    // If user navigated to a route that matches a different group, reset the flag
    const currentDetectedGroup = (() => {
      if (!pathname) return null;
      if (pathname === '/') return 'dashboard';
      if (pathname.startsWith('/backlog') ||
          pathname.startsWith('/epics') || pathname.startsWith('/stories') || 
          pathname.startsWith('/tasks') || 
          pathname.startsWith('/kanban') || pathname.startsWith('/sprints')) return 'agile';
      if (pathname.startsWith('/adrs') || pathname.startsWith('/roadmap')) return 'documentation';
      return null;
    })();

    // Only reset if the detected group is different from the active group
    if (currentDetectedGroup && currentDetectedGroup !== activeGroup) {
      setUserSetGroup(false);
    }
  }, [pathname, userSetGroup, activeGroup]);

  const setActiveGroup = (group: NavigationGroup) => {
    setActiveGroupState(group);
    setUserSetGroup(true);
    // All groups (including dashboard) have sidebar - always visible on desktop
    // sidebarOpen only controls mobile overlay behavior
    setSidebarOpen(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const setActivePath = (path: string) => {
    setActivePathState(path);
  };

  const value: NavigationContextType = {
    activeGroup,
    sidebarOpen,
    activePath,
    setActiveGroup,
    toggleSidebar,
    setActivePath,
    closeSidebar,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * useNavigation hook
 * 
 * Hook to access navigation context.
 * Must be used within NavigationProvider.
 */
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

/**
 * useActiveGroup hook
 * 
 * Hook to get the currently active navigation group.
 */
export function useActiveGroup(): NavigationGroup {
  const { activeGroup } = useNavigation();
  return activeGroup;
}
