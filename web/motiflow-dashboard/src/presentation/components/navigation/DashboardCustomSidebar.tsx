'use client';

import { useState, useEffect } from 'react';
import { FileText, PenTool, Rocket, Zap } from 'lucide-react';
import { useNavigation } from '@/presentation/hooks/useNavigation';
import { Sidebar } from '@fabio.caffarello/react-design-system';
import { NextLinkSidebarItem } from './NextLinkSidebarItem';

const QUICK_ACTIONS = [
  { 
    href: '/epics/new', 
    label: 'Create Epic',
    icon: <FileText className="h-5 w-5" />
  },
  { 
    href: '/stories/new', 
    label: 'Create Story',
    icon: <PenTool className="h-5 w-5" />
  },
  { 
    href: '/sprints/new', 
    label: 'Create Sprint',
    icon: <Rocket className="h-5 w-5" />
  },
];

export function DashboardCustomSidebar() {
  const { sidebarOpen, closeSidebar, activePath } = useNavigation();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Mobile backdrop - only visible on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar - desktop: side-by-side (static), mobile: overlay (fixed) */}
      <div
        className={`
          w-52 shrink-0
          bg-white border-r border-gray-200
          lg:static
          ${isMobile 
            ? `fixed top-16 left-0 bottom-0 z-30 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } shadow-lg`
            : ''
          }
        `}
      >
        <div className="h-full flex flex-col">
          <Sidebar
            title="Dashboard"
            showHeader={false}
            onClose={closeSidebar}
            variant="default"
            className="h-full"
          >
            {/* Quick Actions Group - Collapsible */}
            <Sidebar.Group
              title="Quick Actions"
              titleIcon={<Zap className="h-4 w-4" />}
              collapsible={true}
              defaultCollapsed={false}
              storageKey="sidebar-quick-actions-collapsed"
            >
              <div className="pl-4">
                {QUICK_ACTIONS.map((action) => {
                  const isActive =
                    activePath === action.href ||
                    (action.href !== '/' && activePath?.startsWith(action.href));

                  return (
                    <NextLinkSidebarItem
                      key={action.href}
                      href={action.href}
                      isActive={isActive}
                      icon={action.icon}
                      nested={false}
                    >
                      {action.label}
                    </NextLinkSidebarItem>
                  );
                })}
              </div>
            </Sidebar.Group>
          </Sidebar>
        </div>
      </div>
    </>
  );
}
