"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching party with ID:", id);
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
          host:profiles(*)
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

      const membersList = membersData || [];
      const hostId = partyData?.host_id;

      // Ensure Host is in the list if they have 'paid' status or don't exist yet
      const hostMember = membersList.find((m: any) => m.user_id === hostId);

      if (hostId && !hostMember) {
        // Host not in party_members, add them with default 'paid' status
        membersList.unshift({
          user_id: hostId,
          party_id: id,
          status: 'joined',
          payment_status: 'paid',
        });
      }

      let membersWithProfiles = [];
      if (membersList.length > 0) {
        // Manually fetch profiles
        const userIds = membersList.map((m: any) => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        membersWithProfiles = membersList.map((m: any) => {
          const profile = profiles?.find((p: any) => p.id === m.user_id);
          return {
            ...m,
            user: profile || { first_name: 'Unknown', id: m.user_id } // Fallback
          };
        });
      }

      // Combine
      setParty({
        ...partyData,
        members: membersWithProfiles || []
      });
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
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
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

  const handleKick = async (userId: string) => {
    if (!confirm("คุณต้องการลบสมาชิกคนนี้ใช่หรือไม่?")) return;

    const supabase = createClient();
    if (!supabase) return;

    // Direct delete fallback
    const { error: delError } = await supabase.from('party_members').delete().eq('party_id', id).eq('user_id', userId);

    if (delError) {
      console.error("Delete failed:", delError);
      alert("ลบไม่สำเร็จ: " + delError.message + " (ตรวจสอบสิทธิ์การลบ)");
      // Revert state if needed or just reload
      window.location.reload();
      return;
    }

    // Update Party Count & Notify
    const { data: latestParty } = await supabase.from('parties').select('current_players, title').eq('id', id).single();
    if (latestParty) {
      const newCount = Math.max(0, latestParty.current_players - 1);
      await supabase.from('parties').update({ current_players: newCount }).eq('id', id);

      // Send Notification to the kicked user
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: 'ระบบแจ้งเตือน',
        message: `คุณถูกลบออกจากก๊วน "${latestParty.title || 'ไม่ระบุชื่อ'}"`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Update Local State (Use user_id for safety)
    setParty((prev: any) => ({
      ...prev,
      members: prev.members.filter((m: any) => m.user_id !== userId),
      current_players: Math.max(0, prev.current_players - 1)
    }));
  };

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

                    {/* Message Button - After ID, with border */}
                    {currentUser?.id !== member.user.id && (
                      <button
                        onClick={() => router.push(`/messages/${member.user.id}`)}
                        className="p-2 text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
                        title="ส่งข้อความ"
                      >
                        <Icons.message size={16} />
                      </button>
                    )}

                    {/* Host Kick Button */}
                    {currentUser?.id === party.host_id && member.user.id !== party.host_id && (
                      <button
                        onClick={() => handleKick(member.user.id)}
                        className="p-1.5 text-destructive rounded-full hover:bg-destructive/10 shrink-0"
                      >
                        <Icons.trash size={16} />
                      </button>
                    )}

                    {/* Level Badge - Far Right */}
                    {member.user.skill_level && (
                      <div className="shrink-0">
                        <LevelBadge level={member.user.skill_level} size="sm" />
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="flex-1 bg-transparent" asChild>
            <Link href={`/party/${party.id}/bill`}>
              <Icons.coins className="w-5 h-5 mr-2" />
              คิดเงิน
            </Link>
          </Button>

          {currentUser?.id === party.host_id ? (
            <>
              <Button
                size="lg"
                variant="destructive"
                className="flex-1"
                onClick={handleCancelParty}
                disabled={isJoining}
              >
                <Icons.trash className="w-5 h-5 mr-2" />
                {isJoining ? "กำลังยกเลิก..." : "ยกเลิกก๊วน"}
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                asChild
              >
                <Link href={`/party/${party.id}/manage`}>
                  <Icons.settings className="w-5 h-5 mr-2" />
                  ดูการจัดการ
                </Link>
              </Button>
            </>
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
