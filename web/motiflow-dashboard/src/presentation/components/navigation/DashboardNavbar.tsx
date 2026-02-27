'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Text, NavbarGroup } from '@fabio.caffarello/react-design-system';
import { useNavigation } from '@/presentation/hooks/useNavigation';

const NAV_GROUPS = [
  {
    id: 'dashboard' as const,
    label: 'Dashboard',
    href: '/',
    hasSidebar: true, // Dashboard now has custom sidebar
  },
  {
    id: 'agile' as const,
    label: 'Agile',
    hasSidebar: true,
    items: [
      { href: '/backlog', label: 'Backlog' },
      { href: '/epics', label: 'Epics' },
      { href: '/stories', label: 'Stories' },
      { href: '/tasks', label: 'Tasks' },
      { href: '/kanban', label: 'Kanban' },
      { href: '/sprints', label: 'Sprints' },
    ],
  },
  {
    id: 'documentation' as const,
    label: 'Documentação',
    hasSidebar: true,
    items: [
      { href: '/adrs', label: 'ADRs' },
      { href: '/roadmap', label: 'Roadmap' },
    ],
  },
];

export function DashboardNavbar() {
  const router = useRouter();
  const { activeGroup, setActiveGroup, activePath } = useNavigation();

  const handleGroupClick = (e: React.MouseEvent, group: typeof NAV_GROUPS[number]) => {
    e.preventDefault();
    if (group.hasSidebar) {
      // If clicking the same group, keep it active (sidebar stays open)
      if (activeGroup === group.id) {
        return;
      }
      // Set new active group and open sidebar
      setActiveGroup(group.id);
      // Navigate based on group type
      if (group.id === 'dashboard') {
        // For dashboard, navigate to home
        router.push(group.href);
      } else if (group.items && group.items.length > 0) {
        // For groups with items, navigate to first item if not already in that group's route
        const firstItem = group.items[0];
        const isInGroupRoute = group.items.some(item => 
          activePath === item.href || (item.href !== '/' && activePath?.startsWith(item.href))
        );
        if (!isInGroupRoute) {
          router.push(firstItem.href);
        }
      }
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Text as="h1" className="text-xl font-bold text-gray-900">
                Motiflow Dashboard
              </Text>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {NAV_GROUPS.map((group) => {
                const isActive = activeGroup === group.id;

                return (
                  <NavbarGroup
                    key={group.id}
                    label={group.label}
                    isActive={isActive}
                    onClick={(e) => handleGroupClick(e, group)}
                  />
                );
              })}
            </div>
          </div>
          {/* Right side - user actions (future) */}
          <div className="flex items-center">
            {/* Placeholder for user menu, settings, etc. */}
          </div>
        </div>
      </div>
    </nav>
  );
}
