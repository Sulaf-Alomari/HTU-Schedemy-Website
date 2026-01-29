
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  CalendarPlus,
  BookOpen,
  Settings,
  LogOut,
  Dumbbell,
  ListChecks,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule/add', label: 'Add Schedule Entry', icon: CalendarPlus },
  { href: '/schedule/view', label: 'View Schedule', icon: ListChecks },
  { href: '/courses', label: 'Manage Courses', icon: BookOpen },
  { href: '/instructors', label: 'Manage Instructors', icon: Dumbbell },
];

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

export function SiteSidebar() {
  const pathname = usePathname();
  const hasMounted = useHasMounted();
  if (!hasMounted) return null;

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2">
           <Button variant="ghost" size="icon" className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" asChild>
            <Link href="/">
              <Dumbbell className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Sci-Ed Schedule
          </h1>
          <div className="ml-auto group-data-[collapsible=icon]:hidden">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* <SidebarMenuButton tooltip={{ children: 'Settings', side: 'right', align: 'center' }}>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton> */}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: 'Logout', side: 'right', align: 'center' }}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

