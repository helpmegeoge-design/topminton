"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LevelBadge } from "@/components/ui/level-badge";
import Image from "next/image";

interface OnlineUser {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    skill_level: string;
    last_seen: string;
    is_online: boolean;
    display_name?: string; // Add helper for display
}

export function OnlineUsers() {
    const [users, setUsers] = useState<OnlineUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOnlineUsers = async () => {
        const supabase = createClient();
        if (!supabase) {
            console.log("OnlineUsers: No Supabase client");
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, avatar_url, skill_level, last_seen')
                .not('last_seen', 'is', null)
                .order('last_seen', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching online users:', JSON.stringify(error, null, 2));
                setIsLoading(false);
                return;
            }

            console.log('Fetched users:', data?.length || 0);

            if (data) {
                const now = new Date();
                const usersWithStatus = data.map((user) => {
                    const lastSeen = new Date(user.last_seen);
                    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);
                    return {
                        ...user,
                        is_online: diffInMinutes < 5,
                        display_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No Name',
                    };
                });
                setUsers(usersWithStatus);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Exception fetching online users:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOnlineUsers();

        // Setup realtime subscription
        const supabase = createClient();
        if (!supabase) return;

        console.log('Setting up realtime subscription for profiles...');

        const channel = supabase
            .channel('profiles-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles'
                },
                (payload) => {
                    console.log('Profile changed:', payload);
                    // Refetch when any profile changes
                    fetchOnlineUsers();
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
            });

        // Also refresh every 30 seconds as backup
        const interval = setInterval(fetchOnlineUsers, 30000);

        return () => {
            console.log('Cleaning up subscription...');
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, []);

    const getLastSeenText = (user: OnlineUser) => {
        if (user.is_online) return "ออนไลน์";

        const now = new Date();
        const lastSeen = new Date(user.last_seen);
        const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);

        if (diffInMinutes < 1) return "เมื่อสักครู่";
        if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} วันที่แล้ว`;
    };

    if (isLoading) {
        return (
            <div>
                <h2 className="font-semibold text-foreground mb-3">นักแบดที่กำลังออนไลน์</h2>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-1 min-w-[80px]">
                            <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse"></div>
                            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div>
                <h2 className="font-semibold text-foreground mb-3">นักแบดที่กำลังออนไลน์</h2>
                <div className="p-6 rounded-2xl bg-card border border-border text-center">
                    <p className="text-muted-foreground text-sm">ยังไม่มีนักแบดออนไลน์ในขณะนี้</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground">นักแบดที่กำลังออนไลน์</h2>
                <span className="text-xs text-muted-foreground">
                    {users.filter(u => u.is_online).length} ออนไลน์
                </span>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex flex-col items-center justify-between gap-1.5 min-w-[80px] h-full min-h-[110px] snap-start"
                    >
                        <div className="flex flex-col items-center gap-1.5 w-full">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden ring-2 ring-border">
                                    {user.avatar_url ? (
                                        <Image
                                            src={user.avatar_url}
                                            alt={user.display_name || 'User'}
                                            width={56}
                                            height={56}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-lg">
                                            {(user.display_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {/* Online indicator */}
                                {user.is_online && (
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="text-center max-w-[80px]">
                                <p className="text-xs font-medium text-foreground truncate w-full">
                                    {user.display_name || 'Unknown'}
                                </p>
                                <p className="text-[10px] text-muted-foreground w-full">
                                    {getLastSeenText(user)}
                                </p>
                            </div>
                        </div>
                        <LevelBadge level={user.skill_level || ''} size="sm" />
                    </div>
                ))}
            </div>
        </div>
    );
}
