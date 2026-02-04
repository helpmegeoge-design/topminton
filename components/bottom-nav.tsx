"use client";

import React, { useState, useEffect } from "react"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  CourtIcon,
  ShuttlecockIcon,
  ProfileIcon,
  Icons,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; filled?: boolean; className?: string }>;
  hasNotification?: boolean;
  notificationCount?: number;
}

export function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const navItems: NavItem[] = [
    { href: "/", label: "หน้าหลัก", icon: HomeIcon },
    { href: "/courts", label: "คอร์ท", icon: CourtIcon },
    { href: "/party", label: "ก๊วน", icon: ShuttlecockIcon },
    { href: "/messages", label: "ข้อความ", icon: Icons.message, hasNotification: unreadCount > 0 },
    { href: "/profile", label: "โปรไฟล์", icon: ProfileIcon },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={cn(
      "sticky bottom-0 z-50 pb-[env(safe-area-inset-bottom)] transition-all duration-300",
      // Light Mode: Standard Sticky Bar
      "bg-card/95 backdrop-blur-lg border-t border-border/30",
      // Dark Mode: Floating Cyber Pill
      "dark:fixed dark:bottom-4 dark:left-4 dark:right-4 dark:rounded-2xl dark:border dark:border-white/10 dark:bg-black/60 dark:backdrop-blur-xl dark:shadow-[0_0_30px_rgba(34,211,238,0.2)] dark:pb-0"
    )}>
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full tap-highlight relative group",
                "transition-all duration-200 ease-out",
                active ? "text-primary dark:text-cyan-400" : "text-muted-foreground dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
            >
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all duration-200",
                active && "bg-primary/10 dark:bg-cyan-500/10 dark:shadow-[0_0_15px_rgba(34,211,238,0.3)]",
                "group-hover:scale-110"
              )}>
                <Icon size={22} filled={active} className={cn(active && "dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]")} />
                {item.hasNotification && !item.notificationCount && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF6B6B] dark:bg-red-500 rounded-full border-2 border-card dark:border-black dark:shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                )}
                {item.notificationCount && item.notificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-[#FF6B6B] dark:bg-red-600 text-white rounded-full border-2 border-card dark:border-black dark:shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    {item.notificationCount > 9 ? "9+" : item.notificationCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 font-medium transition-all",
                  active && "text-primary font-semibold dark:text-cyan-400 dark:font-bold dark:tracking-wide"
                )}
              >
                {item.label}
              </span>

              {/* Active Indicator Dot for Cyber Mode */}
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)] hidden dark:block" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
