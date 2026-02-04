"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icons, ArrowLeftIcon, UsersIcon, CalendarIcon, ClockIcon, InfoIcon, CourtIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";
import { CounterInput } from "@/components/ui/counter-input";
import type { Level } from "@/components/ui/level-badge";
import Image from "next/image";
import { cn } from "@/lib/utils";

const paymentTypes = [
    { id: "split", label: "หารเท่า" },
    { id: "general", label: "ทั่วไป" },
    { id: "buffet", label: "บุฟเฟต์" },
    { id: "free", label: "ฟรี" },
];

const levelOptions: { id: Level; label: string }[] = [
    { id: "beginner", label: "หน้าบ้าน" },
    { id: "intermediate", label: "BG" },
    { id: "advanced", label: "N" },
    { id: "strong", label: "S" },
    { id: "pro", label: "P" },
    { id: "champion", label: "B-A" },
];

export default function ManagePartyPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [members, setMembers] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Party data
    const [party, setParty] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [courts, setCourts] = useState<any[]>([]);

    // Form states (editable)
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCourt, setSelectedCourt] = useState("");
    const [courtInfo, setCourtInfo] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [duration, setDuration] = useState("2");
    const [maxParticipants, setMaxParticipants] = useState(8);
    const [paymentType, setPaymentType] = useState("split");
    const [price, setPrice] = useState(0);
    const [requireLevel, setRequireLevel] = useState(false);
    const [selectedLevels, setSelectedLevels] = useState<Level[]>([]);
    const [noWalkIn, setNoWalkIn] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState<"info" | "members">("info");

    useEffect(() => {
        const init = async () => {
            const supabase = createClient();
            if (!supabase) return;

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            // Fetch courts list
            const { data: courtsData } = await supabase.from('courts').select('id, name');
            if (courtsData) setCourts(courtsData);

            // Fetch party details
            const { data: partyData, error } = await supabase
                .from('parties')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !partyData) {
                alert("ไม่พบข้อมูลก๊วน");
                router.push('/party');
                return;
            }

            // Check permission
            if (user?.id !== partyData.host_id) {
                alert("คุณไม่มีสิทธิ์จัดการก๊วนนี้");
                router.push(`/party/${id}`);
                return;
            }

            setParty(partyData);

            // Populate form with existing data
            setTitle(partyData.title || "");
            setDescription(partyData.description || "");
            setSelectedCourt(partyData.court_id || "");
            setCourtInfo(partyData.court_info || "");
            setDate(partyData.date || "");
            setStartTime(partyData.start_time?.substring(0, 5) || "18:00");

            // Calculate duration from start_time and end_time
            // Calculate duration from start_time and end_time (approx)
            if (partyData.start_time && partyData.end_time) {
                // Parse "HH:MM:SS"
                const startH = parseInt(partyData.start_time.split(':')[0]);
                const endH = parseInt(partyData.end_time.split(':')[0]);
                // Handle crossing midnight or simple duration
                let diff = endH - startH;
                if (diff <= 0) diff += 24;
                setDuration(String(diff));
            } else if (partyData.court_hours) {
                setDuration(String(partyData.court_hours));
            }

            // Map DB columns to State
            setMaxParticipants(partyData.max_players || 8);
            setPaymentType(partyData.payment_type || "divide");
            setPrice(partyData.price_per_person || 0);
            setNoWalkIn(partyData.no_walk_in || false);

            // Level Handling (Backward Compatibility)
            if (partyData.required_levels && partyData.required_levels.length > 0) {
                setRequireLevel(true);
                setSelectedLevels(partyData.required_levels);
            } else if (partyData.skill_level && partyData.skill_level !== 'all') {
                setRequireLevel(true);
                setSelectedLevels([partyData.skill_level]);
            } else {
                setRequireLevel(false);
                setSelectedLevels([]);
            }

            // Fetch members
            const { data: partyMembers } = await supabase
                .from('party_members')
                .select('*')
                .eq('party_id', id);

            const membersList = partyMembers || [];

            // Fetch profiles for members
            const userIds = membersList.map(m => m.user_id);
            if (userIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, display_name, first_name, avatar_url, short_id')
                    .in('id', userIds);

                const membersWithProfiles = membersList.map(member => {
                    const profile = profiles?.find(p => p.id === member.user_id);
                    return { ...member, profile };
                });

                // Sort: Host first
                const sorted = membersWithProfiles.sort((a, b) => {
                    if (a.user_id === partyData.host_id) return -1;
                    if (b.user_id === partyData.host_id) return 1;
                    return 0;
                });

                setMembers(sorted);
            }

            setIsLoading(false);
        };

        init();
    }, [id, router]);

    const toggleLevel = (level: Level) => {
        setSelectedLevels((prev) =>
            prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
        );
    };

    const handleSave = async () => {
        if (!title.trim() || !selectedCourt || !date || !startTime) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setIsSaving(true);
        const supabase = createClient();
        if (!supabase) return;

        try {
            // Calculate end time
            const [startH, startM] = startTime.split(':').map(Number);
            const endH = startH + parseInt(duration);
            const endTime = `${String(endH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

            const updates = {
                title,
                description,
                court_id: selectedCourt,
                court_info: courtInfo,
                date,
                start_time: startTime + ":00",
                end_time: endTime + ":00",
                court_hours: parseFloat(duration),
                max_players: maxParticipants,      // Map to correct DB column
                payment_type: paymentType,
                price_per_person: price,           // Map to correct DB column
                require_level: requireLevel,
                required_levels: requireLevel ? selectedLevels : [],
                no_walk_in: noWalkIn,
                updated_at: new Date().toISOString(),
            };



            const { error } = await supabase
                .from('parties')
                .update(updates)
                .eq('id', id);

            if (error) {
                console.error("Save Error:", error);
                alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message} (${error.code})`);
            } else {
                alert("บันทึกข้อมูลเรียบร้อย");
                router.push(`/party/${id}`);
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`คุณต้องการลบก๊วน "${title}" ใช่หรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
            return;
        }

        setIsDeleting(true);
        const supabase = createClient();
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('parties')
                .delete()
                .eq('id', id);

            if (error) {
                console.error(error);
                alert("เกิดข้อผิดพลาดในการลบก๊วน");
            } else {
                alert("ลบก๊วนเรียบร้อยแล้ว");
                router.push('/party');
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleHostParticipation = async () => {
        const isPlaying = members.some(m => m.user_id === currentUser?.id);
        const supabase = createClient();
        if (!supabase || !currentUser) return;

        try {
            if (!isPlaying) {
                // Join
                const { error } = await supabase
                    .from('party_members')
                    .insert({
                        party_id: id,
                        user_id: currentUser.id,
                        status: 'confirmed',
                        payment_status: 'paid'
                    });
                if (error) throw error;
                // Update local state
                const { data: newMember } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
                setMembers([...members, { user_id: currentUser.id, profile: newMember }]);
            } else {
                // Leave
                const { error } = await supabase
                    .from('party_members')
                    .delete()
                    .eq('party_id', id)
                    .eq('user_id', currentUser.id);
                if (error) throw error;
                // Update local state
                setMembers(members.filter(m => m.user_id !== currentUser.id));
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        if (!confirm(`คุณต้องการลบ "${memberName}" ออกจากก๊วนใช่หรือไม่?`)) {
            return;
        }

        const supabase = createClient();
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('party_members')
                .delete()
                .eq('user_id', memberId)
                .eq('party_id', id);

            if (error) {
                console.error(error);
                alert("เกิดข้อผิดพลาดในการลบสมาชิก");
            } else {
                // Remove from local state
                setMembers(prev => prev.filter(m => m.user_id !== memberId));

                // Update current_players count
                const { error: updateError } = await supabase
                    .from('parties')
                    .update({
                        current_players: Math.max(0, (party?.current_players || 0) - 1)
                    })
                    .eq('id', id);

                if (!updateError) {
                    setParty((prev: any) => ({
                        ...prev,
                        current_players: Math.max(0, (prev?.current_players || 0) - 1)
                    }));
                }

                alert("ลบสมาชิกเรียบร้อยแล้ว");
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");
        }
    };

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <LoadingShuttlecock className="mx-auto" />
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!party) return null;

    return (
        <AppShell>
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/30">
                <div className="flex items-center justify-between p-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-xl hover:bg-muted tap-highlight"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold">จัดการก๊วน</h1>
                    <div className="w-10" />
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="sticky top-[60px] z-30 bg-background/95 backdrop-blur-lg border-b border-border/30">
                <div className="flex p-2 gap-2">
                    <button
                        onClick={() => setActiveTab("info")}
                        className={cn(
                            "flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm",
                            activeTab === "info"
                                ? "bg-primary text-white shadow-sm"
                                : "bg-transparent text-muted-foreground hover:bg-muted"
                        )}
                    >
                        ข้อมูลก๊วน
                    </button>
                    <button
                        onClick={() => setActiveTab("members")}
                        className={cn(
                            "flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm",
                            activeTab === "members"
                                ? "bg-primary text-white shadow-sm"
                                : "bg-transparent text-muted-foreground hover:bg-muted"
                        )}
                    >
                        สมาชิก ({members.length})
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6 pb-32">
                {/* Tab Content: Party Info */}
                {activeTab === "info" && (
                    <>
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <InfoIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">ข้อมูลพื้นฐาน</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">ชื่อก๊วน</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="ชื่อก๊วนของคุณ"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">รายละเอียด (ไม่บังคับ)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="รายละเอียดเพิ่มเติม..."
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Court Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CourtIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">สนามและเวลา</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">เลือกสนาม</label>
                                    <select
                                        value={selectedCourt}
                                        onChange={(e) => setSelectedCourt(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">-- เลือกสนาม --</option>
                                        {courts.map(court => (
                                            <option key={court.id} value={court.id}>{court.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">ข้อมูลสนามเพิ่มเติม (ไม่บังคับ)</label>
                                    <Input
                                        value={courtInfo}
                                        onChange={(e) => setCourtInfo(e.target.value)}
                                        placeholder="เช่น สนามที่ 1, โซน A"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">วันที่</label>
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">เวลาเริ่ม</label>
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">ระยะเวลา (ชั่วโมง)</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="1">1 ชั่วโมง</option>
                                        <option value="2">2 ชั่วโมง</option>
                                        <option value="3">3 ชั่วโมง</option>
                                        <option value="4">4 ชั่วโมง</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Participants */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <UsersIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">จำนวนผู้เล่น</span>
                            </div>

                            <CounterInput
                                value={maxParticipants}
                                onChange={setMaxParticipants}
                                min={2}
                                max={20}
                                label="จำนวนผู้เล่นสูงสุด"
                            />
                        </div>

                        {/* Payment */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Icons.coins className="w-5 h-5" />
                                <span className="text-sm font-medium">การชำระเงิน</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {paymentTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setPaymentType(type.id)}
                                        className={cn(
                                            "p-3 rounded-xl border-2 transition-all text-center",
                                            paymentType === type.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border bg-card"
                                        )}
                                    >
                                        <span className="text-sm font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>

                            {paymentType !== "free" && (
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">ราคา (บาท)</label>
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Level Requirement */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">ระดับที่ต้องการ</span>
                                <button
                                    type="button"
                                    onClick={() => setRequireLevel(!requireLevel)}
                                    className={cn(
                                        "relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                        requireLevel ? "bg-primary" : "bg-muted"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                                            requireLevel ? "translate-x-6" : "translate-x-0.5"
                                        )}
                                    />
                                </button>
                            </div>

                            {requireLevel && (
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    {levelOptions.map((level) => (
                                        <button
                                            key={level.id}
                                            type="button"
                                            onClick={() => toggleLevel(level.id)}
                                            className={cn(
                                                "p-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2",
                                                selectedLevels.includes(level.id)
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border bg-card hover:bg-muted/50"
                                            )}
                                        >
                                            <span className={cn(
                                                "w-2 h-2 rounded-full",
                                                selectedLevels.includes(level.id) ? "bg-primary" : "bg-muted-foreground/30"
                                            )} />
                                            {level.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* No Walk-in */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                            <span className="text-sm font-medium">ไม่รับ Walk-in</span>
                            <button
                                onClick={() => setNoWalkIn(!noWalkIn)}
                                className={cn(
                                    "relative w-12 h-6 rounded-full transition-colors",
                                    noWalkIn ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <div
                                    className={cn(
                                        "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                                        noWalkIn ? "right-0.5" : "left-0.5"
                                    )}
                                />
                            </button>
                        </div>
                    </>
                )}

                {/* Tab Content: Members */}
                {activeTab === "members" && (
                    <>
                        {/* Host Participation Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Icons.users className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">ฉันลงเล่นด้วย</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {members.some(m => m.user_id === currentUser?.id)
                                            ? "คุณอยู่ในรายชื่อผู้เล่นแล้ว"
                                            : "คุณเป็นเพียงผู้จัด"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleHostParticipation}
                                className={cn(
                                    "relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                    members.some(m => m.user_id === currentUser?.id) ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                                    members.some(m => m.user_id === currentUser?.id) ? "translate-x-6" : "translate-x-0.5"
                                )} />
                            </button>
                        </div>

                        {/* Members Management */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <UsersIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">จัดการสมาชิก</span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {members.length} คน
                                </span>
                            </div>

                            {members.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    ยังไม่มีสมาชิก
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {members.map((member) => {
                                        const isHost = member.user_id === party?.host_id;
                                        const displayName = member.profile?.display_name ||
                                            member.profile?.first_name ||
                                            "ผู้เล่น";
                                        const shortId = member.profile?.short_id || "";

                                        return (
                                            <div
                                                key={member.user_id}
                                                className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {member.profile?.avatar_url ? (
                                                            <Image
                                                                src={member.profile.avatar_url}
                                                                alt={displayName}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <span className="text-primary font-bold">
                                                                    {displayName.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {isHost && (
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent-gold rounded-full flex items-center justify-center">
                                                                <span className="text-xs">👑</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{displayName}</span>
                                                            {isHost && (
                                                                <span className="text-xs bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded">
                                                                    เจ้าของก๊วน
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            #{shortId}
                                                        </span>
                                                    </div>
                                                </div>

                                                {!isHost && (
                                                    <button
                                                        onClick={() => handleRemoveMember(member.user_id, displayName)}
                                                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors tap-highlight"
                                                    >
                                                        <Icons.trash className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border space-y-3 z-50">
                {activeTab === "info" && (
                    <Button
                        size="lg"
                        className="w-full bg-primary text-white"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                    </Button>
                )}

                <Button
                    size="lg"
                    variant="destructive"
                    className="w-full"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    <Icons.trash className="w-5 h-5 mr-2" />
                    {isDeleting ? "กำลังลบ..." : "ลบก๊วน"}
                </Button>
            </div>
        </AppShell>
    );
}
