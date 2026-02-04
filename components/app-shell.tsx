"use client";

import type { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
  className?: string;
}

export function AppShell({ children, hideNav = false, className }: AppShellProps) {
  // Update user's last_seen automatically
  useOnlineStatus();

  return (
    <div className="min-h-screen">
      <main
        className={cn(
          "safe-area-bottom pb-20", // Added padding-bottom to prevent content being hidden behind floating nav
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
