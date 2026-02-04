"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ArrowLeftIcon, Icons } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";

export default function PartyChatsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [party, setParty] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const init = async () => {
            const supabase = createClient();
            if (!supabase) return;

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setCurrentUser(profile);

            // Fetch party details
            const { data: partyData } = await supabase
                .from('parties')
                .select('id, title, host_id')
                .eq('id', id)
                .single();

            if (!partyData) {
                alert("ไม่พบก๊วนนี้");
                router.back();
                return;
            }

            setParty(partyData);

            // Fetch messages
            await fetchMessages(supabase);

            // Subscribe to new messages
            const channel = supabase
                .channel(`party_chats:${id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'party_chats',
                        filter: `party_id=eq.${id}`
                    },
                    () => {
                        fetchMessages(supabase);
                    }
                )
                .subscribe();

            setIsLoading(false);

            return () => {
                supabase.removeChannel(channel);
            };
        };

        init();
    }, [id, router]);

    useEffect(() => {
        scrollToBottom();
        // Mark as read when messages change
        if (currentUser && messages.length > 0) {
            markAsRead();
        }
    }, [messages, currentUser]);

    const fetchMessages = async (supabase: any) => {
        const { data } = await supabase
            .from('party_chats')
            .select(`
        id,
        message,
        created_at,
        user:profiles!party_chats_user_id_fkey (
          id,
          display_name,
          first_name,
          avatar_url
        )
      `)
            .eq('party_id', id)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
        }
    };

    const markAsRead = async () => {
        if (!currentUser) return;

        const supabase = createClient();
        if (!supabase) return;

        // Upsert last read timestamp
        await supabase
            .from('party_chat_reads')
            .upsert({
                party_id: id,
                user_id: currentUser.id,
                last_read_at: new Date().toISOString()
            }, {
                onConflict: 'party_id,user_id'
            });
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !currentUser) return;

        const messageText = newMessage.trim();
        setNewMessage(""); // Clear input immediately
        setIsSending(true);

        // Optimistic Update
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            message: messageText,
            created_at: new Date().toISOString(),
            user: currentUser,
            isOptimistic: true
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        scrollToBottom();

        const supabase = createClient();
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('party_chats')
                .insert({
                    party_id: id,
                    user_id: currentUser.id,
                    message: messageText,
                });

            if (error) {
                console.error(error);
                alert("ส่งข้อความไม่สำเร็จ");
                // Rollback if error
                setMessages((prev) => prev.filter(m => m.id !== optimisticMsg.id));
                setNewMessage(messageText); // Restore text
            } else {
                // Success: Realtime subscription will handle the update (fetching latest messages)
                // Or we could let the fetchMessages replace our optimistic message
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");
            // Rollback if error
            setMessages((prev) => prev.filter(m => m.id !== optimisticMsg.id));
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <LoadingShuttlecock className="mx-auto mb-4" />
                        <p className="text-muted-foreground">กำลังโหลด...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell hideNav>
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/30">
                <div className="flex items-center gap-3 p-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-xl hover:bg-muted tap-highlight"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold truncate">{party?.title}</h1>
                        <p className="text-xs text-muted-foreground">แชทกลุ่ม</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <Icons.message className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">ยังไม่มีข้อความ</p>
                        <p className="text-sm text-muted-foreground">เริ่มสนทนากันเลย!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user?.id === currentUser?.id;
                        const displayName = msg.user?.display_name || msg.user?.first_name || "ผู้ใช้";

                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3",
                                    isMe && "flex-row-reverse"
                                )}
                            >
                                {/* Avatar */}
                                {!isMe && (
                                    <div className="shrink-0">
                                        {msg.user?.avatar_url ? (
                                            <Image
                                                src={msg.user.avatar_url}
                                                alt={displayName}
                                                width={32}
                                                height={32}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-xs text-primary font-bold">
                                                    {displayName.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className={cn("flex flex-col", isMe ? "items-end" : "items-start", "max-w-[75%]")}>
                                    {!isMe && (
                                        <span className="text-xs text-muted-foreground mb-1 px-2">
                                            {displayName}
                                        </span>
                                    )}
                                    <div
                                        className={cn(
                                            "px-4 py-2.5 rounded-2xl",
                                            isMe
                                                ? "bg-primary text-white rounded-br-sm"
                                                : "bg-muted rounded-bl-sm"
                                        )}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1 px-2">
                                        {new Date(msg.created_at).toLocaleTimeString('th-TH', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border z-50">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1"
                        disabled={isSending}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isSending}
                        size="lg"
                        className="bg-primary text-white"
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Icons.send className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>
        </AppShell>
    );
}
