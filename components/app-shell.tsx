"use client";

import type { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
  className?: string;
}

export function AppShell({ children, hideNav = false, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <main 
        className={cn(
          "pb-20 safe-area-bottom",
          !hideNav && "min-h-screen",
          className
        )}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
