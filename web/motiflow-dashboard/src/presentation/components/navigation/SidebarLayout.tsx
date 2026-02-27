'use client';

import { useNavigation } from '@/presentation/hooks/useNavigation';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardCustomSidebar } from './DashboardCustomSidebar';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { activeGroup } = useNavigation();

  return (
    <div className="flex min-h-[calc(100vh-64px)] overflow-x-hidden">
      {/* Render appropriate sidebar based on active group */}
      {activeGroup === 'dashboard' && <DashboardCustomSidebar />}
      {activeGroup && activeGroup !== 'dashboard' && <DashboardSidebar />}
      {/* Main content - adjusts automatically when sidebar is visible */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
