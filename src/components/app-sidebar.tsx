"use client";

import { Map, BarChart3, Trophy, Download, ChevronLeft } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useIsMobile } from "@/hooks/use-mobile";

const items = [
  {
    title: "地圖",
    url: "/map",
    icon: Map,
  },
  {
    title: "統計",
    url: "/statistics",
    icon: BarChart3,
  },
  {
    title: "排行",
    url: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "導出",
    url: "/export",
    icon: Download,
  },
];

export function AppSidebar() {
  const { toggleSidebar, open } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <Sidebar collapsible="icon" className="relative">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Bio Data Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {!isMobile && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <ThemeSwitcher asMenuItem={true} />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={toggleSidebar}>
                <ChevronLeft
                  className={`h-4 w-4 transition-transform ${
                    !open ? "rotate-180" : ""
                  }`}
                />
                <span>收合側邊欄</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
