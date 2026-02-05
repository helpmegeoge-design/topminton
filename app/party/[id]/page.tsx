"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";
import { LevelBadge } from "@/components/ui/level-badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function PartyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [party, setParty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [competitionStatus, setCompetitionStatus] = useState<'active' | 'inactive'>('inactive');

  useEffect(() => {
    const fetchData = async () => {
      // Log Removed
      const supabase = createClient();
      if (!supabase) return;

      // Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 1. Fetch Party Details (Basic)
      const { data: partyData, error: partyError } = await supabase
        .from('parties')
        .select(`
          *,
          court:courts(*),
          host:profiles!parties_host_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (partyError) {
        console.error("Error fetching party details:", partyError);
        setErrorMsg(partyError.message);
        setIsLoading(false);
        return;
      }

      // 2. Fetch Members
      const { data: membersData, error: membersError } = await supabase
        .from('party_members')
        .select('*')
        .eq('party_id', id);

      if (membersError) {
        console.error("Error fetching members:", membersError);
      }

      // Self-Healing: Check if current_players matches actual members count
      const realCount = membersData ? membersData.length : 0;
      if (partyData && partyData.current_players !== realCount) {
        console.log(`Fixing party count mismatch: ${partyData.current_players} -> ${realCount}`);
        await supabase
          .from('parties')
          .update({ current_players: realCount })
          .eq('id', id);

        // Update local state to reflect accurate count immediatey
        partyData.current_players = realCount;
      }

      const membersList = membersData || [];
      const hostId = partyData?.host_id;

      // Ensure Host is in the list if they have 'paid' status or don't exist yet
      const hostMember = membersList.find((m: any) => m.user_id === hostId);

      if (hostId && !hostMember) {
        // Do not force add host if they are not in party_members (meaning they toggled off playing)
        // Host is already shown in the Host Info card.
      }

      let membersWithProfiles = [];
      if (membersList.length > 0) {
        // Manually fetch profiles
        const userIds = membersList
          .map((m: any) => m.user_id)
          .filter((id: any) => id); // Filter out nulls/undefined/empty strings

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        if (profileError) {
          console.error("Error fetching profiles:", profileError);
        }

        membersWithProfiles = membersList.map((m: any) => {
          if (m.user_id) {
            // Try to find in fetched profiles, OR use party.host if it's the host
            let profile = profiles?.find((p: any) => p.id === m.user_id);

            // Fallback: If this is the host, use the host data we already fetched in step 1
            if (!profile && m.user_id === hostId && partyData.host) {
              profile = partyData.host;
            }

            return {
              ...m,
              user: profile || { first_name: 'Unknown', id: m.user_id }
            };
          } else {
            // Guest logic
            return {
              ...m,
              user: {
                id: 'guest-' + m.id,
                first_name: m.guest_name || 'Guest',
                display_name: m.guest_name || 'Guest',
                avatar_url: null,
                short_id: 'GUEST'
              }
            };
          }
        });
      }

      // Combine
      setParty({
        ...partyData,
        members: membersWithProfiles || []
      });

      // 3. Fetch Competition Status
      const { data: compRoom } = await supabase
        .from('competition_rooms')
        .select('status')
        .eq('party_id', id)
        .eq('status', 'active')
        .maybeSingle();

      setCompetitionStatus(compRoom ? 'active' : 'inactive');

      // Fetch unread chat count
      if (user?.id) {
        const { data: unreadData } = await supabase
          .rpc('get_party_unread_count', {
            p_party_id: id,
            p_user_id: user.id
          });

        if (unreadData !== null) {
          setUnreadChatCount(unreadData);
        }

        // Subscribe to party chat changes for live unread count
        const chatChannel = supabase
          .channel(`party_chats_unread:${id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'party_chats',
              filter: `party_id=eq.${id}`
            },
            async (payload: any) => {
              // Log Removed

              const newMsg = payload.new;

              // If it's a new message from SOMEONE ELSE -> Increment count locally (Optimistic Update)
              if (payload.eventType === 'INSERT' && newMsg && newMsg.user_id !== user.id) {
                setUnreadChatCount(prev => prev + 1);
              }
              // Otherwise (e.g. initial load or weird state), fetch accurate count
              else {
                const { data } = await supabase.rpc('get_party_unread_count', {
                  p_party_id: id,
                  p_user_id: user.id
                });
                if (data !== null) setUnreadChatCount(data);
              }
            }
          )
          .subscribe();

        // Subscribe to competition status changes
        const compChannel = supabase
          .channel(`competition_status:${id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'competition_rooms', filter: `party_id=eq.${id}` },
            (payload: any) => {
              if (payload.new && payload.new.status === 'active') {
                setCompetitionStatus('active');
              } else {
                setCompetitionStatus('inactive');
              }
            }
          )
          .subscribe();
      }

      setIsLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  const handleJoinToggle = async () => {
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    setIsJoining(true);
    const supabase = createClient();
    if (!supabase) {
      alert("ไม่สามารถเชื่อมต่อได้");
      setIsJoining(false);
      return;
    }

    // Check if already joined based on ID
    const isJoined = party.members.some((m: any) => m.user_id === currentUser.id);

    if (isJoined) {
      // Leave Party
      const { error } = await supabase
        .from('party_members')
        .delete()
        .eq('party_id', id)
        .eq('user_id', currentUser.id);

      if (!error) {
        // Update local state
        setParty((prev: any) => {
          const newMembers = prev.members.filter((m: any) => m.user_id !== currentUser.id);
          // Recalculate players: Exclude Pending Host
          const count = newMembers.filter((m: any) => {
            if (m.user_id === prev.host_id) return m.payment_status === 'paid';
            return m.payment_status !== 'host_spectator';
          }).length;

          return {
            ...prev,
            members: newMembers,
            current_players: count
          };
        });

        // Optimistic update for DB count is hard without RPC logic, but we can assume simple --
        // However, manage page handles authoritative count logic.
        // We will just do a simple decrement on DB for now or let trigger handle it.
        // Given previous context, we might be manually updating.
        // Let's rely on simple decrement for now if USER IS NOT HOST.
        if (currentUser.id !== party.host_id) {
          await supabase.from('parties').update({ current_players: Math.max(0, party.current_players - 1) }).eq('id', id);
        }
      } else {
        alert("เกิดข้อผิดพลาดในการออกจากก๊วน");
      }
    } else {
      // Join Party
      const { error } = await supabase
        .from('party_members')
        .insert({
          party_id: id,
          user_id: currentUser.id,
          status: 'joined',
          payment_status: 'pending' // Normal members start as pending/participating
        });

      if (!error) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        if (profile) {
          setParty((prev: any) => {
            const newMembers = [...prev.members, {
              status: 'joined',
              payment_status: 'pending',
              user_id: currentUser.id,
              user: profile
            }];
            const count = newMembers.filter((m: any) => {
              if (m.user_id === prev.host_id) return m.payment_status === 'paid';
              return m.payment_status !== 'host_spectator';
            }).length;

            return {
              ...prev,
              members: newMembers,
              current_players: count
            };
          });

          if (currentUser.id !== party.host_id) {
            await supabase.from('parties').update({ current_players: party.current_players + 1 }).eq('id', id);
          }
        }
      } else if (error.code === '23505') {
        // Unique violation: User already joined but UI didn't know
        alert("คุณเข้าร่วมก๊วนนี้ไปแล้ว");
        location.reload(); // Simple reload to sync state
      } else {
        alert("เกิดข้อผิดพลาดในการเข้าร่วม: " + error.message);
      }
    }
    setIsJoining(false);
  };

  if (isLoading) {
    return (
      <AppShell hideNav>
        <div className="flex items-center justify-center min-h-screen">
          <div className="py-12 flex justify-center">
            <LoadingShuttlecock />
          </div>
        </div>
      </AppShell>
    );
  }

  if (errorMsg || !party) {
    return (
      <AppShell hideNav>
        <div className="p-8 text-center bg-background min-h-screen pt-20">
          <h1 className="text-xl font-bold mb-4 text-destructive">เกิดข้อผิดพลาด</h1>
          <p className="text-muted-foreground mb-6">
            {errorMsg ? `Error: ${errorMsg}` : "ไม่พบข้อมูลก๊วน (Party not found)"}
          </p>
          <p className="text-xs text-muted-foreground mb-4">ID: {id}</p>
          <Link href="/party" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium">
            กลับไปหน้าก๊วน
          </Link>
        </div>
      </AppShell>
    );
  }

  const isJoined = currentUser && party.members?.some((m: any) => m.user.id === currentUser.id);

  // Calculate actual playing count (same logic as manage page)
  const playingCount = party.members?.filter((m: any) => {
    if (m.user_id === party.host_id) {
      return m.payment_status === 'paid';
    }
    return m.payment_status !== 'host_spectator';
  }).length || 0;

  const spotsLeft = party.max_players - playingCount;
  const price = party.price_per_person || 0;

  // Format date info
  const dateObj = new Date(`${party.date}T${party.start_time}`);
  const dayStr = format(dateObj, 'eeee', { locale: th });
  const dateStr = format(dateObj, 'd MMM yyyy', { locale: th });
  const timeStr = `${party.start_time.slice(0, 5)} - ${party.end_time.slice(0, 5)}`;

  // Default image
  const bannerImage = party.court?.images?.[0] || "/images/party/party-banner-1.jpg"; // Fallback

  // Required Levels
  const requiredLevels = party.skill_level === 'all'
    ? ["beginner", "bg", "normal", "strong"]
    : [party.skill_level];


  const handleCancelParty = async () => {
    if (!currentUser || currentUser.id !== party.host_id) {
      alert("คุณไม่มีสิทธิ์ยกเลิกก๊วนนี้");
      return;
    }

    const confirmed = confirm(
      `คุณต้องการยกเลิกก๊วน "${party.title}" ใช่หรือไม่?\n\n` +
      `การยกเลิกจะทำให้:\n` +
      `- ก๊วนนี้ถูกลบออกจากระบบ\n` +
      `- สมาชิกทั้งหมดจะไม่สามารถเข้าถึงได้\n` +
      `- ข้อมูลไม่สามารถกู้คืนได้\n\n` +
      `ยืนยันการยกเลิก?`
    );

    if (!confirmed) return;

    setIsJoining(true);
    const supabase = createClient();
    if (!supabase) {
      alert("ไม่สามารถเชื่อมต่อได้");
      setIsJoining(false);
      return;
    }

    // Delete party (cascade will delete members automatically)
    const { error } = await supabase
      .from('parties')
      .delete()
      .eq('id', id)
      .eq('host_id', currentUser.id); // Double check host

    setIsJoining(false);

    if (error) {
      console.error('Cancel party error:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert('ยกเลิกก๊วนเรียบร้อยแล้ว');
      router.push('/party');
    }
  };

  return (
    <AppShell hideNav>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/party" className="p-2 -ml-2 tap-highlight">
            <Icons.chevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-semibold text-lg">รายละเอียดก๊วน</h1>
          <button className="p-2 -mr-2 tap-highlight">
            <Icons.share className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="pb-32">
        {/* Banner Image */}
        <div className="relative h-48 bg-muted">
          <Image
            src={bannerImage}
            alt={party.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              {/* Tag example */}
            </div>
            <h2 className="text-xl font-bold text-white">{party.title}</h2>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Host Info */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={party.host?.avatar_url || "/placeholder.svg"}
                  alt={party.host?.first_name || "Host"}
                  width={48}
                  height={48}
                  className="rounded-full object-cover bg-gray-200"
                />
                {(party.host?.is_verified) && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Icons.check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">ผู้จัด</p>
                <p className="font-semibold">{party.host?.display_name || party.host?.first_name || "Unknown"}</p>
              </div>
              <Button variant="outline" size="sm">
                <Icons.message className="w-4 h-4 mr-1" />
                แชท
              </Button>
            </div>
          </GlassCard>

          {/* Schedule & Location */}
          <GlassCard className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icons.calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วันและเวลา</p>
                <p className="font-semibold">{dayStr} {dateStr}</p>
                <p className="text-sm text-muted-foreground">{timeStr} ({party.court_hours || 2} ชั่วโมง)</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icons.mapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">สถานที่</p>
                  <p className="font-semibold">{party.court?.name || "ไม่ระบุ"}</p>
                  <p className="text-sm text-muted-foreground">{party.court?.address}</p>
                  {/* <p className="text-xs text-primary mt-1">{party.court?.distance}</p> */}
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Icons.navigate className="w-5 h-5 text-primary" />
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Required Levels */}
          <GlassCard className="p-4">
            <p className="text-sm text-muted-foreground mb-3">ระดับที่ต้องการ</p>
            <div className="flex flex-wrap gap-2">
              {requiredLevels.map((level: any) => (
                <LevelBadge key={level} level={level} size="md" />
              ))}
            </div>
          </GlassCard>

          {/* Description */}
          {party.description && (
            <GlassCard className="p-4">
              <p className="text-sm text-muted-foreground mb-2">รายละเอียด</p>
              <p className="text-foreground">{party.description}</p>
            </GlassCard>
          )}

          {/* Payment Info */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ค่าใช้จ่าย</p>
                <p className="font-semibold">
                  {price > 0 ? "หารเท่า / จ่ายตามจริง" : "ฟรี/ไม่มีค่าใช้จ่าย"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">ประมาณ</p>
                <p className="text-xl font-bold text-primary">{price} บาท/คน</p>
              </div>
            </div>
          </GlassCard>

          {/* Matchmaking Section */}
          <Link href={`/party/${id}/competition/active`}>
            <GlassCard className={cn(
              "p-4 overflow-hidden relative transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
              competitionStatus === 'active'
                ? "border-green-500/50 bg-gradient-to-br from-green-500/10 via-background to-background shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]"
                : "border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background"
            )}>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    competitionStatus === 'active' ? "bg-green-500/20 text-green-500" : "bg-primary/20 text-primary"
                  )}>
                    <Icons.trophy className={cn("w-6 h-6", competitionStatus === 'active' && "animate-pulse")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg tracking-tight">MATCHMAKING</p>
                      {competitionStatus === 'active' ? (
                        <Badge className="bg-green-500 hover:bg-green-600 text-[10px] h-5 px-1.5 animation-pulse border-0">
                          กำลังแข่งขัน (LIVE)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground border-border bg-background/50">
                          รอเริ่มระบบ
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {competitionStatus === 'active'
                        ? "กดเพื่อดูตารางการแข่งขันและคิวปัจจุบัน"
                        : "ระบบจัดทีม แบ่งคู่ และบันทึกผลอัตโนมัติ"
                      }
                    </p>
                  </div>
                </div>

                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  competitionStatus === 'active' ? "bg-green-500/10 text-green-500" : "bg-white/5 text-muted-foreground"
                )}>
                  <Icons.chevronRight className="w-5 h-5" />
                </div>
              </div>

              {/* Background Decorative Element */}
              <div className={cn(
                "absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl transition-colors",
                competitionStatus === 'active' ? "bg-green-500/10" : "bg-primary/5"
              )} />
            </GlassCard>
          </Link>

          {/* Participants */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold">ผู้เข้าร่วม</p>
              <Badge variant="secondary">
                {playingCount}/{party.max_players} คน
              </Badge>
            </div>

            <div className="space-y-3">
              {party.members
                .filter((member: any) => {
                  // Hide Host if they are NOT 'paid' (i.e., 'pending' or 'host_spectator')
                  if (member.user_id === party.host_id) {
                    return member.payment_status === 'paid';
                  }
                  // Show all other members
                  return true;
                })
                .sort((a: any, b: any) => (a.user_id === party.host_id ? -1 : 1)) // Host first
                .map((member: any) => (
                  <div key={member.user.id} className="flex items-center gap-3">
                    {/* Avatar */}
                    <Image
                      src={member.user.avatar_url || "/placeholder.svg"}
                      alt={member.user.first_name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover bg-gray-200"
                    />

                    {/* Name and Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{member.user.display_name || member.user.first_name}</span>
                        {member.user.id === party.host_id && (
                          <Badge variant="outline" className="text-xs shrink-0">ผู้จัด</Badge>
                        )}
                        <span className="text-xs text-muted-foreground shrink-0">#{member.user.short_id || '---'}</span>
                      </div>
                    </div>


                    {/* Message Button - Only for Real Users */}
                    {currentUser?.id !== member.user.id && member.user.id && !member.user.id.startsWith('guest-') && (
                      <button
                        onClick={() => router.push(`/messages/${member.user.id}`)}
                        className="p-2 text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
                        title="ส่งข้อความ"
                      >
                        <Icons.message size={16} />
                      </button>
                    )}

                    {/* Level Badge - Prioritize Party Level -> Profile Level */}
                    {(member.skill_level || member.user.skill_level) && (
                      <div className="shrink-0">
                        <LevelBadge level={member.skill_level || member.user.skill_level} size="sm" />
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {spotsLeft > 0 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                เหลืออีก {spotsLeft} ที่ว่าง
              </p>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border safe-area-bottom z-50">
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="bg-transparent relative" asChild>
            <Link href={`/party/${party.id}/chat`}>
              <Icons.message className="w-5 h-5 mr-2" />
              แชทกลุ่ม
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadChatCount > 9 ? '9+' : unreadChatCount}
                </span>
              )}
            </Link>
          </Button>

          <Button variant="outline" size="lg" className="bg-transparent" asChild>
            <Link href={`/party/${party.id}/bill`}>
              <Icons.coins className="w-5 h-5 mr-2" />
              คิดเงิน
            </Link>
          </Button>

          {currentUser?.id === party.host_id ? (
            <Button
              size="lg"
              className="flex-1 bg-primary text-white hover:bg-primary/90"
              asChild
            >
              <Link href={`/party/${party.id}/manage`}>
                <Icons.settings className="w-5 h-5 mr-2" />
                จัดการก๊วน
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              className={cn(
                "flex-1",
                isJoined && "bg-destructive hover:bg-destructive/90"
              )}
              onClick={handleJoinToggle}
              disabled={isJoining || (!isJoined && spotsLeft <= 0)}
            >
              {isJoining ? (
                "กำลังดำเนินการ..."
              ) : isJoined ? (
                <>ออกจากก๊วน</>
              ) : spotsLeft <= 0 ? (
                <>ก๊วนเต็ม</>
              ) : (
                <>
                  <Icons.plus className="w-5 h-5 mr-2" />
                  เข้าร่วม
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
