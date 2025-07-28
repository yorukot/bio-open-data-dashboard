"use client"

import {
  Map,
  BarChart3,
  Trophy,
  Download,
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import { ThemeSwitcher } from "@/components/theme-switcher"

const items = [
  {
    title: "地圖",
    url: "#",
    icon: Map,
  },
  {
    title: "統計",
    url: "#",
    icon: BarChart3,
  },
  {
    title: "排行",
    url: "#",
    icon: Trophy,
  },
  {
    title: "導出",
    url: "#",
    icon: Download,
  },
]


export function AppSidebar() {
  return (
    <Sidebar>
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
      <SidebarFooter>
        <div className="p-2">
          <ThemeSwitcher />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}