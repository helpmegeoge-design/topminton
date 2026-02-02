"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Icons } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ManagePartyPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [inviteId, setInviteId] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);

    const [party, setParty] = useState<any>(null);

    const [isLoading, setIsLoading] = useState(true);

    const fetchPartyAndMembers = async (supabaseArg?: any) => {
        setIsLoading(true);
        const supabase = supabaseArg || createClient();
        if (!supabase) return;

        try {
            // 1. Fetch Party (include title for notifications)
            const { data: partyData, error: partyError } = await supabase
                .from('parties')
                .select('host_id, current_players, title')
                .eq('id', id)
                .single();

            if (partyError) {
                console.error("Error fetching party:", partyError);
            }
            if (partyData) {
                setParty(partyData);
            }

            // 2. Fetch Members
            const { data: partyMembers, error: membersError } = await supabase
                .from('party_members')
                .select('*')
                .eq('party_id', id);

            if (membersError) {
                console.error("Error fetching members:", membersError);
            }

            const membersList = partyMembers || [];

            // 3. Ensure Host is in the list (even if not in party_members yet)
            const hostId = partyData?.host_id;
            const hostInMembers = membersList.find((m: any) => m.user_id === hostId);

            if (hostId && !hostInMembers) {
                // Host not in party_members, add them with default status
                membersList.unshift({
                    user_id: hostId,
                    party_id: id,
                    status: 'joined',
                    payment_status: 'paid', // Default: Host is playing
                });
            }

            // 4. Fetch all profiles
            const userIds = membersList.map((m: any) => m.user_id);
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, display_name, first_name, avatar_url, short_id')
                .in('id', userIds);

            if (profilesError) console.error("Error fetching profiles:", profilesError);

            // 5. Merge profiles into members
            const membersWithProfiles = membersList.map((member: any) => {
                const profile = profiles?.find((p: any) => p.id === member.user_id);
                return { ...member, profile };
            });

            // 6. Sort: Host first
            const sorted = membersWithProfiles.sort((a: any, b: any) => {
                if (a.user_id === hostId) return -1;
                if (b.user_id === hostId) return 1;
                return 0;
            });
            setMembers(sorted);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived state for playing count
    // Logic: Count everyone EXCEPT Host if Host is 'pending' (Not Playing)
    // Plus legacy check for 'host_spectator'
    const playingCount = members.filter(m => {
        if (m.user_id === party?.host_id) {
            return m.payment_status === 'paid';
        }
        return m.payment_status !== 'host_spectator';
    }).length;

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            // Set User ID explicitly for logic checks
            setCurrentUser((prev: any) => ({ ...prev, id: user.id }));

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setCurrentUser(profile ? { ...profile, id: user.id } : { id: user.id }); // Ensure ID is present
            fetchPartyAndMembers(supabase);
        };
        checkAuth();
    }, []);

    const handleInvite = async () => {
        if (!inviteId || inviteId.length !== 5) {
            alert("กรุณากรอกรหัส 5 หลัก (เช่น AB123)");
            return;
        }

        setIsInviting(true);
        const supabase = createClient();
        if (!supabase) return;

        try {
            // Using RPC for invite logic (RPC handles notification creation)
            const { data, error } = await supabase.rpc('invite_user_by_short_id', {
                p_party_id: id,
                p_short_id: inviteId.toUpperCase(),
                p_host_name: currentUser?.display_name || "ผู้จัด"
            });

            if (error) throw error;

            if (data && data.success) {
                alert("เพิ่มสมาชิกสำเร็จ!");
                setInviteId("");
                fetchPartyAndMembers(supabase); // Refresh list
            } else {
                alert("ไม่สำเร็จ: " + (data?.message || "Unknown error"));
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsInviting(false);
        }
    };

    const toggleHostPlaying = async (isPlaying: boolean) => {
        const supabase = createClient();
        if (!supabase) return;
        if (!party || !currentUser) return;

        // Use 'pending' for "Not Playing" to avoid ENUM errors with custom strings
        const newStatus = isPlaying ? 'paid' : 'pending';

        // Optimistic UI Update
        setMembers(prev => prev.map(m => m.user_id === party.host_id ? { ...m, payment_status: newStatus } : m));

        try {
            // UPSERT to party_members (creates if doesn't exist, updates if exists)
            const { error: memberError } = await supabase
                .from('party_members')
                .upsert({
                    party_id: id,
                    user_id: party.host_id,
                    status: 'joined',
                    payment_status: newStatus
                }, {
                    onConflict: 'party_id,user_id'
                });

            if (memberError) {
                console.error("Failed to upsert member status", memberError);
                // Revert optimistic update
                fetchPartyAndMembers(supabase);
                return;
            }

            // Calculate new playing count
            const updatedMembers = members.map(m =>
                m.user_id === party.host_id ? { ...m, payment_status: newStatus } : m
            );
            const newCount = updatedMembers.filter(m => {
                if (m.user_id === party.host_id) {
                    return m.payment_status === 'paid';
                }
                return m.payment_status !== 'host_spectator';
            }).length;

            // Update parties table
            await supabase.from('parties').update({ current_players: newCount }).eq('id', id);
        } catch (error) {
            console.error("Error toggling host playing:", error);
            fetchPartyAndMembers(supabase);
        }
    };

    const [showAddMember, setShowAddMember] = useState(false);

    if (isLoading && members.length === 0) {
        return (
            <AppShell hideNav>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell hideNav>
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border safe-area-top">
                <div className="flex items-center gap-3 px-4 h-14">
                    <button onClick={() => router.back()} className="tap-highlight">
                        <Icons.chevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="font-semibold text-lg">สมาชิกในก๊วน</h1>
                    <div className="ml-auto text-sm text-muted-foreground">
                        {playingCount} คน
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Header with Add Button */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-medium text-muted-foreground">รายชื่อสมาชิก</h2>
                    <button
                        onClick={() => setShowAddMember(!showAddMember)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full tap-highlight transition-colors hover:bg-primary/20"
                    >
                        <Icons.plus className="w-3 h-3" />
                        เพิ่มสมาชิก
                    </button>
                </div>

                {/* Add Member Input (Collapsible) */}
                {showAddMember && (
                    <div className="bg-card border border-border rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-2">
                            <Input
                                placeholder="รหัส 5 หลัก (เช่น AB123)"
                                value={inviteId}
                                onChange={(e) => setInviteId(e.target.value.toUpperCase())}
                                maxLength={5}
                                className="font-mono uppercase tracking-widest text-center h-10"
                                autoFocus
                            />
                            <Button
                                onClick={handleInvite}
                                disabled={isInviting || inviteId.length < 5}
                                className="shrink-0 h-10 px-4"
                            >
                                {isInviting ? "..." : "เพิ่ม"}
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                            ใส่รหัส Short ID ของเพื่อนเพื่อเชิญ
                        </p>
                    </div>
                )}

                {/* Member List */}
                <div className="space-y-3">
                    {members.map((member) => {
                        const currentUserId = currentUser?.id; // Define currentUserId here
                        const isHost = member.user_id === party?.host_id;
                        const isUserHost = currentUserId === party?.host_id; // Robust check

                        // Logic for Host: Only 'paid' means Playing. 'pending' means Not Playing (Spectator).
                        // Logic for Members: Always Playing (unless kicked, which removes them).
                        // Note: 'host_spectator' is legacy support just in case.
                        const isPlaying = isHost
                            ? member.payment_status === 'paid'
                            : member.payment_status !== 'host_spectator';

                        return (
                            <div key={member.user_id} className={cn(
                                "flex items-center justify-between bg-card border p-3 rounded-xl transition-all",
                                isHost ? "border-primary/50 shadow-sm bg-primary/5 mb-2" : "border-border"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                                            <Image
                                                src={member.profile?.avatar_url || "/placeholder.svg"}
                                                alt="Avatar"
                                                width={40}
                                                height={40}
                                                className={cn("w-full h-full object-cover", !isPlaying && "grayscale opacity-50")}
                                            />
                                        </div>
                                        {isHost && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-[8px] z-10">
                                                👑
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className={cn("font-medium text-sm", !isPlaying && "text-muted-foreground line-through")}>
                                                {member.profile?.display_name || member.profile?.first_name || "Unknown"}
                                            </p>
                                            {!isPlaying && <span className="text-[10px] text-muted-foreground">(ไม่ตี)</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            ID: #{member.profile?.short_id || "---"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    {/* Host Toggle */}
                                    {isHost && isUserHost ? (
                                        <div className="flex items-center gap-2 bg-background/50 p-1.5 rounded-lg border border-border/50">
                                            <span className="text-[10px] font-medium text-muted-foreground">ลงเล่น</span>
                                            <button
                                                onClick={() => toggleHostPlaying(!isPlaying)}
                                                className={cn(
                                                    "w-10 h-6 rounded-full p-1 transition-all duration-300",
                                                    isPlaying ? "bg-green-500" : "bg-muted"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                                                    isPlaying ? "translate-x-4" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                                member.status === 'admin' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                                            )}>
                                                {member.status === 'admin' ? "HOST" : "MEMBER"}
                                            </span>
                                        </div>
                                    )}

                                    {isPlaying && member.payment_status === 'paid' && !isHost && (
                                        <span className="text-[10px] text-green-600 font-medium">จ่ายแล้ว</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppShell>
    );
}
