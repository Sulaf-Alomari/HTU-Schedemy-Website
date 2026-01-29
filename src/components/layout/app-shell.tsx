
"use client";
import type { ReactNode } from 'react';
import { SiteSidebar } from '@/components/layout/site-sidebar';
import { SiteHeader } from '@/components/layout/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <SiteSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
