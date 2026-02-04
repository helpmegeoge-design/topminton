"use client";

import React from "react"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

type NotificationType =
  | "party_invite"
  | "system"
  | "general"
  | "match_start"
  | "payment_reminder"
  | "payment_verified"
  | "tournament";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  related_id?: string;
  created_at: string;
}

const typeConfig: Record<
  NotificationType,
  { icon: React.ReactNode; bgColor: string; iconColor: string }
> = {
  party_invite: {
    icon: <PartyIcon size={20} />,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  system: {
    icon: <BellIcon size={20} />,
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
  },
  general: {
    icon: <BellIcon size={20} />,
    bgColor: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  match_start: {
    icon: <SwordsIcon size={20} />,
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  payment_reminder: {
    icon: <CreditCardIcon size={20} />,
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  payment_verified: {
    icon: <CreditCardIcon size={20} />,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  tournament: {
    icon: <GiftIcon size={20} />,
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const formattedNotifications: Notification[] = data.map((n: any) => ({
          id: n.id,
          type: n.type as NotificationType,
          title: n.title,
          message: n.message,
          time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: th }),
          isRead: n.is_read,
          related_id: n.related_id,
          created_at: n.created_at
        }));
        setNotifications(formattedNotifications);
      }
      setIsLoading(false);
    };

    fetchNotifications();
  }, []);

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => !n.isRead);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    const supabase = createClient();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    if (!supabase) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    // Navigate based on type
    if (notification.type === 'party_invite' && notification.related_id) {
      router.push(`/party/${notification.related_id}`);
    } else if (notification.type === 'system') {
      router.push('/messages/system');
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight"
              >
                <ArrowLeftIcon size={20} className="text-foreground" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  การแจ้งเตือน
                </h1>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} รายการที่ยังไม่อ่าน
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary font-medium"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                filter === "all"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1",
                filter === "unread"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              ยังไม่อ่าน
              {unreadCount > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-xs",
                    filter === "unread"
                      ? "bg-white/20 text-white"
                      : "bg-primary text-white"
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 p-4 space-y-2 pb-24">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingShuttlecock />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BellIcon size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const config = typeConfig[notification.type] || typeConfig.general;
              return (
                <GlassCard
                  key={notification.id}
                  className={cn(
                    "p-4 cursor-pointer tap-highlight transition-colors",
                    !notification.isRead && "bg-primary/5 border-primary/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        config.bgColor,
                        config.iconColor
                      )}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={cn(
                            "text-sm font-medium line-clamp-1",
                            !notification.isRead
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}

// Icons
function ArrowLeftIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PartyIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SwordsIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M14.5 17.5L3 6V3H6L17.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 19L19 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 16L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 6.5L6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 3L18 6L15 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GiftIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8V21" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 12V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 8C7.5 8 7 4 9.5 4C12 4 12 8 12 8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.5 8C16.5 8 17 4 14.5 4C12 4 12 8 12 8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CreditCardIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 15H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
