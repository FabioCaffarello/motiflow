'use client';

import { useState, useEffect } from 'react';
import { FileText, ClipboardList, CheckSquare2, LayoutGrid, Zap, FileCheck, Map, FolderKanban } from 'lucide-react';
import { useNavigation } from '@/presentation/hooks/useNavigation';
import { Sidebar } from '@fabio.caffarello/react-design-system';
import { NextLinkSidebarItem } from './NextLinkSidebarItem';

// Backlog items - Epics, Stories, and Tasks are part of the Backlog
const BACKLOG_ITEMS = [
  { 
    href: '/epics', 
    label: 'Epics',
    icon: <FileText className="h-5 w-5" />
  },
  { 
    href: '/stories', 
    label: 'Stories',
    icon: <FileCheck className="h-5 w-5" />
  },
  { 
    href: '/tasks', 
    label: 'Tasks',
    icon: <CheckSquare2 className="h-5 w-5" />
  },
];

// Other Agile items - Kanban and Sprints
const OTHER_AGILE_ITEMS = [
  { 
    href: '/kanban', 
    label: 'Kanban',
    icon: <LayoutGrid className="h-5 w-5" />
  },
  { 
    href: '/sprints', 
    label: 'Sprints',
    icon: <Zap className="h-5 w-5" />
  },
];

const DOCUMENTATION_ITEMS = [
  { 
    href: '/adrs', 
    label: 'ADRs',
    icon: <FileText className="h-5 w-5" />
  },
  { 
    href: '/roadmap', 
    label: 'Roadmap',
    icon: <Map className="h-5 w-5" />
  },
];

export function DashboardSidebar() {
  const { activeGroup, sidebarOpen, activePath, closeSidebar } = useNavigation();
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

  // Don't show sidebar for dashboard group or if no active group
  if (!activeGroup || activeGroup === 'dashboard') {
    return null;
  }

  // Sidebar should ALWAYS be visible for groups that have one (agile, documentation)
  // Integrated layout: desktop side-by-side, mobile overlay

  const getSidebarTitle = () => {
    switch (activeGroup) {
      case 'agile':
        return 'Agile';
      case 'documentation':
        return 'Documentação';
      default:
        return 'Navigation';
    }
  };

  const renderAgileItems = () => {
    return (
      <>
        {/* Backlog Group - Epics, Stories, Tasks (collapsible) */}
        <Sidebar.Group
          title="Backlog"
          titleIcon={<FolderKanban className="h-4 w-4" />}
          collapsible={true}
          defaultCollapsed={false}
          storageKey="sidebar-backlog-collapsed"
        >
          <div className="pl-4">
            {BACKLOG_ITEMS.map((item) => {
              const isActive =
                activePath === item.href ||
                (item.href !== '/' && activePath?.startsWith(item.href));

              return (
                <NextLinkSidebarItem
                  key={item.href}
                  href={item.href}
                  isActive={isActive}
                  icon={item.icon}
                  nested={false}
                >
                  {item.label}
                </NextLinkSidebarItem>
              );
            })}
          </div>
        </Sidebar.Group>

        {/* Other Agile Items - Kanban, Sprints */}
        <Sidebar.Group>
          {OTHER_AGILE_ITEMS.map((item) => {
            const isActive =
              activePath === item.href ||
              (item.href !== '/' && activePath?.startsWith(item.href));

            return (
              <NextLinkSidebarItem
                key={item.href}
                href={item.href}
                isActive={isActive}
                icon={item.icon}
              >
                {item.label}
              </NextLinkSidebarItem>
            );
          })}
        </Sidebar.Group>
      </>
    );
  };

  const renderDocumentationItems = () => {
    return (
      <Sidebar.Group>
        {DOCUMENTATION_ITEMS.map((item) => {
          const isActive =
            activePath === item.href ||
            (item.href !== '/' && activePath?.startsWith(item.href));

          return (
            <NextLinkSidebarItem
              key={item.href}
              href={item.href}
              isActive={isActive}
              icon={item.icon}
            >
              {item.label}
            </NextLinkSidebarItem>
          );
        })}
      </Sidebar.Group>
    );
  };

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
            title={getSidebarTitle()}
            showHeader={false}
            onClose={closeSidebar}
            variant="default"
            className="h-full"
            role="navigation"
            aria-label="Main navigation"
          >
          {activeGroup === 'agile' && renderAgileItems()}
          {activeGroup === 'documentation' && renderDocumentationItems()}
          </Sidebar>
        </div>
      </div>
    </>
  );
}
