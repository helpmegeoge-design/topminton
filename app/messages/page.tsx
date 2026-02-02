"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  type: "direct" | "system";
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const allChats: Chat[] = [];

      // 1. Fetch System Notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notifications && notifications.length > 0) {
        const unreadCount = notifications.filter((n: any) => !n.is_read).length;
        const lastNote = notifications[0];
        const date = new Date(lastNote.created_at);
        const timeStr = format(date, 'HH:mm', { locale: th });

        allChats.push({
          id: 'system',
          name: 'ข้อความระบบ',
          avatar: '',
          lastMessage: lastNote.message || lastNote.title,
          timestamp: timeStr,
          unreadCount: unreadCount,
          isOnline: true,
          type: 'system'
        });
      }

      // 2. Fetch Direct Messages - Get unique conversations
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          created_at,
          is_read
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messages && messages.length > 0) {
        // Group messages by conversation partner
        const conversationMap = new Map<string, any>();

        for (const msg of messages) {
          // Determine the other user ID
          const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

          // Only keep the latest message per conversation
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              userId: otherUserId,
              lastMessage: msg.content,
              timestamp: msg.created_at,
              isUnread: msg.receiver_id === user.id && !msg.is_read
            });
          }
        }

        // Fetch profiles for all conversation partners
        const userIds = Array.from(conversationMap.keys());
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, first_name, avatar_url')
            .in('id', userIds);

          if (profiles) {
            for (const profile of profiles) {
              const conversation = conversationMap.get(profile.id);
              if (conversation) {
                // Count unread messages from this user
                const unreadCount = messages.filter(
                  m => m.sender_id === profile.id &&
                    m.receiver_id === user.id &&
                    !m.is_read
                ).length;

                const date = new Date(conversation.timestamp);
                const now = new Date();
                const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

                let timeStr;
                if (diffHours < 24) {
                  timeStr = format(date, 'HH:mm', { locale: th });
                } else {
                  timeStr = format(date, 'd MMM', { locale: th });
                }

                allChats.push({
                  id: profile.id,
                  name: profile.display_name || profile.first_name || 'Unknown',
                  avatar: profile.avatar_url || '',
                  lastMessage: conversation.lastMessage,
                  timestamp: timeStr,
                  unreadCount: unreadCount,
                  isOnline: false,
                  type: 'direct'
                });
              }
            }
          }
        }
      }

      setChats(allChats);
      setIsLoading(false);
    };

    fetchChats();

    // Refresh every 5 seconds
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center gap-3 px-4 h-14">
            <h1 className="text-xl font-bold text-foreground">ข้อความ</h1>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหาข้อความ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </header>

        {/* Chat List */}
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Icons.message size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ยังไม่มีข้อความ
              </h3>
              <p className="text-sm text-muted-foreground">
                เริ่มต้นการสนทนาจากหน้ารายละเอียดก๊วน
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredChats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/messages/${chat.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 active:bg-muted transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center",
                      chat.type === 'system' ? "bg-red-100" : "bg-muted"
                    )}>
                      {chat.type === 'system' ? (
                        <Icons.bell className="w-6 h-6 text-red-500" />
                      ) : chat.avatar ? (
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icons.profile className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    {chat.isOnline && chat.type !== 'system' && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {chat.name}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {chat.timestamp}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm truncate",
                      chat.unreadCount > 0
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}>
                      {chat.lastMessage}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {chat.unreadCount > 0 && (
                    <div className="shrink-0">
                      <Badge className="bg-primary text-primary-foreground min-w-[20px] h-5 flex items-center justify-center px-1.5">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </Badge>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}
