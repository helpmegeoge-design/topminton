"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ChevronLeftIcon, Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { playNotificationSound } from "@/lib/notification-sound";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
}

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗',
  '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤔',
  '👍', '👎', '👊', '✊', '🤝', '🙏', '💪', '🏸',
  '🎾', '⚽', '🏀', '🏆', '🥇', '🥈', '🥉', '🏅',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🔥', '⚡',
  '💥', '✨', '🌟', '⭐', '💯', '👏', '🙌', '👐'
];

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSystemChat = chatId === 'system';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      if (!supabase) {
        setError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('กรุณาเข้าสู่ระบบ');
        setIsLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      // System chat
      if (isSystemChat) {
        const { data: notifications, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (notifError) {
          console.error('Error fetching notifications:', notifError);
          setError('ไม่สามารถโหลดการแจ้งเตือนได้');
        } else if (notifications) {
          const notifMessages: any[] = notifications.map((n: any) => ({
            id: n.id,
            content: n.message || n.title,
            sender_id: 'system',
            receiver_id: user.id,
            created_at: n.created_at,
            is_read: n.is_read
          }));
          setMessages(notifMessages);

          // Mark as read
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        }

        setContact({
          id: 'system',
          name: 'ข้อความระบบ',
          avatar: ''
        });

        setIsLoading(false);
        return;
      }

      // Direct message chat
      console.log('Loading chat with:', chatId);

      // Fetch contact
      const { data: contactData, error: contactError } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, avatar_url')
        .eq('id', chatId)
        .single();

      if (contactError || !contactData) {
        console.error('Contact error:', contactError);
        setError('ไม่พบผู้ใช้นี้');
        setIsLoading(false);
        return;
      }

      setContact({
        id: contactData.id,
        name: contactData.display_name || contactData.first_name || 'Unknown',
        avatar: contactData.avatar_url || ''
      });

      // Fetch messages
      console.log('Fetching messages...');
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Messages error:', messagesError);
        if (messagesError.message?.includes('relation') || messagesError.message?.includes('does not exist')) {
          setError('กรุณารัน SQL script ที่ /scripts/009_create_messages_table.sql ใน Supabase');
        } else {
          setError('ไม่สามารถโหลดข้อความได้');
        }
        setIsLoading(false);
        return;
      }

      console.log('Messages loaded:', messagesData?.length || 0);
      if (messagesData) {
        setMessages(messagesData);

        // Mark as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('receiver_id', user.id)
          .eq('sender_id', chatId)
          .eq('is_read', false);
      }

      // Realtime subscription
      const channel = supabase
        .channel(`messages:${chatId}`)
        // Listen for new incoming messages
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${chatId},receiver_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New message:', payload);
            setMessages((prev) => [...prev, payload.new as Message]);

            // Play notification sound
            playNotificationSound();

            // Mark as read
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', payload.new.id);
          }
        )
        // Listen for sent message confirmation
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${user.id},receiver_id=eq.${chatId}`
          },
          (payload) => {
            setMessages((prev) => {
              const exists = prev.some(m => m.id === payload.new.id);
              return exists ? prev : [...prev, payload.new as Message];
            });
          }
        )
        // Listen for read status updates (READ RECEIPTS!)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${user.id},receiver_id=eq.${chatId}`
          },
          (payload) => {
            console.log('Message read status updated:', payload);
            setMessages((prev) =>
              prev.map(m =>
                m.id === payload.new.id
                  ? { ...m, is_read: payload.new.is_read }
                  : m
              )
            );
          }
        )
        .subscribe();

      unsubscribe = () => channel.unsubscribe();

      // Polling fallback (in case Realtime is not enabled)
      const pollMessages = async () => {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (data) {
          setMessages(data);
          // Mark new received messages as read
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('receiver_id', user.id)
            .eq('sender_id', chatId)
            .eq('is_read', false);
        }
      };

      // Poll every 3 seconds as fallback
      const pollInterval = setInterval(pollMessages, 3000);
      unsubscribe = () => {
        clearInterval(pollInterval);
        channel.unsubscribe();
      };

      setIsLoading(false);
    };

    fetchData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatId, isSystemChat]);

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUserId || isSystemChat) return;

    const supabase = createClient();
    if (!supabase) return;

    // Enable audio on first interaction
    playNotificationSound();

    const newMessage = {
      sender_id: currentUserId,
      receiver_id: chatId,
      content: inputText.trim(),
      is_read: false,
      created_at: new Date().toISOString()
    };

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { ...newMessage, id: tempId } as Message]);
    setInputText("");
    setShowEmojis(false);

    const { error } = await supabase.from('messages').insert(newMessage);

    if (error) {
      console.error('Send error:', error);
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      alert('ส่งข้อความล้มเหลว');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.back()} className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className={cn(
                "w-10 h-10 rounded-full overflow-hidden flex items-center justify-center",
                isSystemChat ? "bg-red-100" : "bg-muted"
              )}>
                {isSystemChat ? (
                  <Icons.bell className="w-5 h-5 text-red-500" />
                ) : contact?.avatar ? (
                  <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                ) : (
                  <Icons.profile className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-sm">
                {contact?.name || 'Loading...'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isSystemChat ? 'การแจ้งเตือนทั้งหมด' : 'ออนไลน์'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 pb-36 space-y-3">
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <Icons.message size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isSystemChat ? 'ไม่มีการแจ้งเตือน' : 'เริ่มต้นการสนทนา'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const isSystemMsg = msg.sender_id === 'system';

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  isSystemMsg ? "justify-start" : isMe ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    isSystemMsg
                      ? "bg-muted text-foreground rounded-bl-md"
                      : isMe
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className={cn(
                    "flex items-center gap-1 mt-1",
                    isMe ? "justify-end" : "justify-start"
                  )}>
                    <span className={cn(
                      "text-[10px]",
                      isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {format(new Date(msg.created_at), 'HH:mm', { locale: th })}
                    </span>
                    {/* Read Receipts - Only show for messages I sent */}
                    {isMe && (
                      <div className="flex items-center">
                        {msg.is_read ? (
                          // Double checkmark - Message read
                          <div className="flex -space-x-1">
                            <Icons.check size={12} className="text-blue-400" />
                            <Icons.check size={12} className="text-blue-400" />
                          </div>
                        ) : (
                          // Single checkmark - Message sent but not read
                          <Icons.check size={12} className="text-primary-foreground/50" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Box - ALWAYS SHOW for non-system chats */}
      {!isSystemChat && (
        <div className="fixed bottom-16 left-0 right-0 p-3 bg-background/95 backdrop-blur-xl border-t border-border shadow-lg">
          {/* Emoji Picker */}
          {showEmojis && (
            <div className="mb-2 p-3 bg-card rounded-xl border border-border max-h-48 overflow-y-auto shadow-lg">
              <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => addEmoji(emoji)}
                    className="text-2xl p-1 hover:bg-muted rounded transition-colors tap-highlight"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojis(!showEmojis)}
              disabled={isLoading}
              className={cn(
                "p-2 transition-colors tap-highlight rounded-full shrink-0",
                showEmojis ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="text-xl">😊</span>
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isLoading ? "กำลังโหลด..." : "พิมพ์ข้อความ..."}
                disabled={isLoading}
                className="w-full h-11 px-4 rounded-full bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            <button
              type="button"
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className={cn(
                "p-2.5 rounded-full transition-all tap-highlight shrink-0",
                inputText.trim() && !isLoading
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icons.send size={20} />
            </button>
          </div>
        </div>
      )}

      {/* System Chat Footer */}
      {isSystemChat && (
        <div className="fixed bottom-16 left-0 right-0 p-3 bg-background/95 backdrop-blur-xl border-t border-border">
          <div className="text-center text-xs text-muted-foreground py-2">
            ข้อความระบบ (ไม่สามารถตอบกลับได้)
          </div>
        </div>
      )}
    </AppShell>
  );
}
