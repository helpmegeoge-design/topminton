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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/30 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full tap-highlight relative",
                "transition-all duration-200 ease-out",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all duration-200",
                active && "bg-primary/10"
              )}>
                <Icon size={22} filled={active} />
                {item.hasNotification && !item.notificationCount && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF6B6B] rounded-full border border-card" />
                )}
                {item.notificationCount && item.notificationCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold bg-[#FF6B6B] text-white rounded-full">
                    {item.notificationCount > 9 ? "9+" : item.notificationCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 font-medium",
                  active && "text-primary font-semibold"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
