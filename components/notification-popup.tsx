"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { BellIcon } from "@/components/icons";

// --- Notification Icons & Types ---
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

// Inline Icons for specific notification types
function PartyIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SwordsIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14.5 17.5L3 6V3H6L17.5 14.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 19L19 13" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 16L19 19" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function GiftIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8V21" />
            <path d="M19 12V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V12" />
            <path d="M7.5 8C7.5 8 7 4 9.5 4C12 4 12 8 12 8" />
            <path d="M16.5 8C16.5 8 17 4 14.5 4C12 4 12 8 12 8" />
        </svg>
    );
}

function CreditCardIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10H22" />
            <path d="M6 15H10" strokeLinecap="round" />
        </svg>
    );
}

const typeConfig: Record<
    NotificationType,
    { icon: React.ReactNode; bgColor: string; iconColor: string }
> = {
    party_invite: {
        icon: <PartyIcon />,
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
    },
    system: {
        icon: <BellIcon size={20} />,
        bgColor: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
    },
    general: {
        icon: <BellIcon size={20} />,
        bgColor: "bg-zinc-100 dark:bg-zinc-800",
        iconColor: "text-zinc-600 dark:text-zinc-400",
    },
    match_start: {
        icon: <SwordsIcon />,
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        iconColor: "text-orange-600 dark:text-orange-400",
    },
    payment_reminder: {
        icon: <CreditCardIcon />,
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    payment_verified: {
        icon: <CreditCardIcon />,
        bgColor: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
    },
    tournament: {
        icon: <GiftIcon />,
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
    },
};

export function NotificationPopup() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {
        setIsLoading(true);
        const supabase = createClient();
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
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
                // Ignore AbortError and generic fetch errors if unmounted
                if (error.code !== '20') {
                    console.error("Error fetching notifications:", error);
                }
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
                setUnreadCount(formattedNotifications.filter(n => !n.isRead).length);
            }
        } catch (err: any) {
            if (err?.name !== 'AbortError') {
                console.error("Notification fetch error:", err);
            }
        } finally {
            setIsLoading(false);
        }
    };



    // Initial fetch on mount
    useEffect(() => {
        fetchNotifications();

        // Optional: Realtime subscription could go here
        const supabase = createClient();
        if (!supabase) return; // Add check

        const subscription = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        }
    }, []);

    const markAsRead = async (id: string) => {
        const supabase = createClient();
        if (!supabase) return;
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

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

        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) markAsRead(notification.id);
        setIsOpen(false); // Close popup

        if (notification.type === 'party_invite' && notification.related_id) {
            router.push(`/party/${notification.related_id}`);
        } else if (notification.type === 'system') {
            router.push('/messages/system');
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className="relative w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all group active:scale-95 tap-highlight"
                    onClick={() => {
                        if (!isOpen) fetchNotifications();
                    }}
                >
                    <BellIcon size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white animate-pulse shadow-sm" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[380px] p-0 mr-4 overflow-hidden rounded-2xl shadow-2xl border-border/50 dark:border-cyan-500/30 glass-card bg-background/95 dark:bg-black/80 backdrop-blur-xl"
                align="end"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/10 dark:border-cyan-500/20 bg-muted/30 dark:bg-cyan-900/10">
                    <h3 className="font-semibold text-sm">การแจ้งเตือน</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary dark:text-cyan-400 font-medium hover:underline"
                        >
                            อ่านทั้งหมด
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <LoadingShuttlecock />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <BellIcon size={32} className="opacity-20 mb-2" />
                            <p className="text-sm">ไม่มีการแจ้งเตือนใหม่</p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const config = typeConfig[notification.type] || typeConfig.general;
                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "flex gap-3 p-4 border-b border-border/10 dark:border-white/5 cursor-pointer transition-colors hover:bg-muted/50 dark:hover:bg-white/5 relative group",
                                        !notification.isRead && "bg-primary/5 dark:bg-cyan-500/10"
                                    )}
                                >
                                    {!notification.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary dark:bg-cyan-400" />
                                    )}

                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                        config.bgColor,
                                        config.iconColor
                                    )}>
                                        {config.icon}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm font-medium leading-tight", !notification.isRead ? "text-foreground" : "text-muted-foreground dark:text-zinc-400")}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground dark:text-zinc-500 line-clamp-2 mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/70 mt-1.5 flex items-center gap-1">
                                            {notification.time}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
