"use client"

import {
  Database,
  BarChart3,
  Settings,
  Home,
  FileText,
  FileJson,
  FileSpreadsheet,
  FileCode,
  FileImage,
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
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
  },
  {
    title: "Data Sources",
    url: "#",
    icon: Database,
  },
  {
    title: "Visualizations",
    url: "#",
    icon: BarChart3,
  },
  {
    title: "Analysis",
    url: "#",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

const exportOptions = [
  {
    title: "Export to JSON",
    icon: FileJson,
    action: () => console.log("Export to JSON"),
  },
  {
    title: "Export to CSV",
    icon: FileSpreadsheet,
    action: () => console.log("Export to CSV"),
  },
  {
    title: "Export to XML",
    icon: FileCode,
    action: () => console.log("Export to XML"),
  },
  {
    title: "Export to PDF",
    icon: FileImage,
    action: () => console.log("Export to PDF"),
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
        <SidebarGroup>
          <SidebarGroupLabel>Export Data</SidebarGroupLabel>
          <Separator className="mb-2" />
          <SidebarGroupContent>
            <div className="space-y-1">
              {exportOptions.map((option) => (
                <Button
                  key={option.title}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={option.action}
                >
                  <option.icon className="mr-2 h-4 w-4" />
                  {option.title}
                </Button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}