/**
 * DashboardNav Component
 * 
 * Navigation component for the dashboard header.
 * Uses NavLink from the design system.
 */

'use client';

import { usePathname } from 'next/navigation';
import { NavLink } from '@fabio.caffarello/react-design-system';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/epics', label: 'Epics' },
  { href: '/stories', label: 'Stories' },
  { href: '/backlog', label: 'Backlog' },
  { href: '/kanban', label: 'Kanban' },
  { href: '/sprints', label: 'Sprints' },
  { href: '/adrs', label: 'ADRs' },
  { href: '/roadmap', label: 'Roadmap' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/' && pathname?.startsWith(item.href));
        
        return (
          <NavLink
            key={item.href}
            href={item.href}
            variant={isActive ? 'active' : 'default'}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
