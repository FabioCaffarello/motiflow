import type { ReactNode } from 'react';
import { NavigationProvider } from '@/presentation/contexts/NavigationContext';
import { DashboardNavbar } from '@/presentation/components/navigation/DashboardNavbar';
import { SidebarLayout } from '@/presentation/components/navigation/SidebarLayout';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <NavigationProvider>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <DashboardNavbar />
        <SidebarLayout>
          {children}
        </SidebarLayout>
      </div>
    </NavigationProvider>
  );
}
