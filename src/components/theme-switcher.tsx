"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({
  className,
  asMenuItem = false,
}: {
  className?: string;
  asMenuItem?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    if (asMenuItem) {
      return (
        <SidebarMenuButton className={className}>
          <Sun className="h-4 w-4" />
          <span>主題</span>
        </SidebarMenuButton>
      );
    }
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn("h-9 w-9", className)}
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getThemeName = () => {
    switch (theme) {
      case "light":
        return "淺色模式";
      case "dark":
        return "深色模式";
      case "system":
        return "跟隨系統";
      default:
        return "主題";
    }
  };

  if (asMenuItem) {
    return (
      <SidebarMenuButton onClick={cycleTheme} className={className}>
        {getIcon()}
        <span>{getThemeName()}</span>
      </SidebarMenuButton>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      className={cn("h-8 w-8", className)}
    >
      {getIcon()}
    </Button>
  );
}
