"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="md:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <h1 className="text-lg font-semibold">Bio Data Dashboard</h1>
        
        <ThemeSwitcher className="h-8 w-8" variant="ghost" />
      </div>
    </header>
  );
}