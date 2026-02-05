"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icons, ArrowLeftIcon, UsersIcon, CalendarIcon, ClockIcon, InfoIcon, CourtIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const partyLevelOptions = [
    { id: "light", label: "เบา", color: "bg-green-100 text-green-700" },
    { id: "medium", label: "กลาง", color: "bg-yellow-100 text-yellow-700" },
    { id: "heavy", label: "หนัก", color: "bg-red-100 text-red-700" },
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

    // Import Members State
    const [importText, setImportText] = useState("");
    const [isImporting, setIsImporting] = useState(false);

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
            const userIds = membersList
                .map(m => m.user_id)
                .filter((id): id is string => !!id); // Filter out nulls (guests)

            let profiles: any[] = [];
            if (userIds.length > 0) {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, display_name, first_name, avatar_url, short_id')
                    .in('id', userIds);
                profiles = data || [];
            }

            const membersWithProfiles = membersList.map(member => {
                if (member.user_id) {
                    const profile = profiles.find(p => p.id === member.user_id);
                    return { ...member, profile };
                } else {
                    // It's a guest
                    return {
                        ...member,
                        profile: {
                            id: 'guest',
                            display_name: member.guest_name || 'Guest',
                            first_name: member.guest_name || 'Guest',
                            avatar_url: null,
                            short_id: 'GUEST'
                        }
                    };
                }
            });

            // Sort: Host first, then Users, then Guests
            const sorted = membersWithProfiles.sort((a, b) => {
                if (a.user_id === partyData.host_id) return -1;
                if (b.user_id === partyData.host_id) return 1;
                // If one is guest and other is user
                if (!a.user_id && b.user_id) return 1;
                if (a.user_id && !b.user_id) return -1;
                return 0;
            });

            setMembers(sorted);

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

                // Sync Party Count
                const { count } = await supabase.from('party_members').select('*', { count: 'exact', head: true }).eq('party_id', id);
                if (count !== null) {
                    await supabase.from('parties').update({ current_players: count }).eq('id', id);
                    setParty(prev => ({ ...prev, current_players: count }));
                }

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

                // Sync Party Count
                const { count } = await supabase.from('party_members').select('*', { count: 'exact', head: true }).eq('party_id', id);
                if (count !== null) {
                    await supabase.from('parties').update({ current_players: count }).eq('id', id);
                    setParty(prev => ({ ...prev, current_players: count }));
                }
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
                .eq('id', memberId); // Use Primary Key ID

            if (error) {
                console.error(error);
                alert("เกิดข้อผิดพลาดในการลบสมาชิก");
            } else {
                // Remove from local state
                setMembers(prev => prev.filter(m => m.id !== memberId));

                // Sync Party Count
                const { count } = await supabase.from('party_members').select('*', { count: 'exact', head: true }).eq('party_id', id);
                if (count !== null) {
                    await supabase.from('parties').update({ current_players: count }).eq('id', id);
                    setParty((prev: any) => ({
                        ...prev,
                        current_players: count
                    }));
                }

                alert("ลบสมาชิกเรียบร้อยแล้ว");
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");
        }
    };

    const handleUpdateMemberLevelById = async (partyMemberId: string, level: string) => {
        const supabase = createClient();
        if (!supabase) return;

        // Optimistic Update
        setMembers(prev => prev.map(m => m.id === partyMemberId ? { ...m, skill_level: level } : m));

        try {
            const { error } = await supabase
                .from('party_members')
                .update({ skill_level: level })
                .eq('id', partyMemberId);

            if (error) {
                console.error("Update level error:", error);
                // Revert on error could be implemented here
            }
        } catch (err) {
            console.error("Update level error:", err);
        }
    };

    const handleLinkGuest = async (memberId: string, currentName: string) => {
        const shortIdInput = prompt(`กรอก User ID เพื่อเชื่อมต่อกับ Guest "${currentName}" (เช่น 1001)`);
        if (!shortIdInput || !shortIdInput.trim()) return;

        const supabase = createClient();
        if (!supabase) return;

        try {
            // 1. Find User by Short ID
            const { data: users, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('short_id', shortIdInput.trim())
                .limit(1);

            if (userError || !users || users.length === 0) {
                alert("ไม่พบผู้ใช้ที่มี ID นี้");
                return;
            }

            const targetUser = users[0];

            // 2. Check if user already in party
            const isAlreadyMember = members.some(m => m.user_id === targetUser.id);
            if (isAlreadyMember) {
                alert(`ผู้ใช้ "${targetUser.display_name}" อยู่ในก๊วนนี้แล้ว`);
                return;
            }

            // 3. Update Party Member
            const { error: updateError } = await supabase
                .from('party_members')
                .update({
                    user_id: targetUser.id,
                    guest_name: null, // Clear guest name to make them a real user
                    // status: 'joined' // Keep existing status
                })
                .eq('id', memberId);

            if (updateError) {
                console.error("Link error:", updateError);
                alert("เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล");
            } else {
                // 4. Update Local State
                setMembers(prev => prev.map(m => {
                    if (m.id === memberId) {
                        return {
                            ...m,
                            user_id: targetUser.id,
                            guest_name: null,
                            profile: targetUser
                        };
                    }
                    return m;
                }));
                alert(`เชื่อมต่อกับผู้ใช้ "${targetUser.display_name}" เรียบร้อยแล้ว`);
            }

        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");
        }
    };

    const handleImportMembers = async () => {
        if (!importText.trim()) return;
        setIsImporting(true);
        const supabase = createClient();
        if (!supabase) {
            setIsImporting(false);
            return;
        }

        try {
            // 1. Parse names
            const lines = importText.split('\n').map(l => l.trim()).filter(l => l);
            const namesToFind: string[] = [];

            // Strict Numbered Mode Detection
            const strictPattern = /^(\d+)[\.\)\-\s]+\s*(.*)/;
            const numberedLines = lines.filter(l => strictPattern.test(l));
            const useStrictMode = numberedLines.length > 0;

            if (useStrictMode) {
                for (const line of lines) {
                    const match = line.match(strictPattern);
                    if (match) {
                        const name = match[2].trim();
                        if (name && name.length > 0) namesToFind.push(name);
                    }
                }
            } else {
                const excludePatterns = [
                    /^[🧡📍🏸❌]/, /[🧡📍🏸❌]$/, /^https?:\/\//,
                    /^(ปิด|คอร์ท|สนาม|เวลา|วันที่|ลงชื่อ|@)/,
                    /(กติก|พรุ่งนี้|วันนี้|พบกัน|นัด|คอนเท้น|แรง|จบบ่แฮง)/,
                ];
                for (const line of lines) {
                    const isHeaderFooter = excludePatterns.some(pattern => pattern.test(line));
                    if (!isHeaderFooter && line.length < 50) namesToFind.push(line);
                }
            }

            if (namesToFind.length === 0) {
                alert("ไม่พบรายชื่อในข้อความ");
                setIsImporting(false);
                return;
            }

            // 2. Search & Add
            let addedCount = 0;
            let guestsAddedCount = 0;

            for (const name of namesToFind) {
                // Normalize name (simple trim)
                const cleanName = name.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero width chars

                // Try to find user by display_name or first_name
                const { data: users } = await supabase
                    .from('profiles')
                    .select('id, display_name, first_name, avatar_url, short_id')
                    .or(`display_name.ilike.%${cleanName}%,first_name.ilike.%${cleanName}%`)
                    .limit(1);

                if (users && users.length > 0) {
                    const user = users[0];
                    // Check if already in party
                    const isAlreadyMember = members.some(m => m.user_id === user.id);

                    if (!isAlreadyMember) {
                        const { error } = await supabase
                            .from('party_members')
                            .insert({
                                party_id: id,
                                user_id: user.id,
                                status: 'joined',
                                payment_status: 'pending'
                            });

                        if (!error) {
                            addedCount++;
                            // Update local state temporarily
                            setMembers(prev => [...prev, { user_id: user.id, profile: user }]);
                        }
                    }
                } else {
                    // Not found -> Add as Guest
                    // Check if already exist as guest with same name (simple check)
                    const isAlreadyGuest = members.some(m => !m.user_id && m.guest_name === cleanName);

                    if (!isAlreadyGuest) {
                        const { error } = await supabase
                            .from('party_members')
                            .insert({
                                party_id: id,
                                user_id: null, // No user ID
                                guest_name: cleanName,
                                status: 'joined',
                                payment_status: 'pending'
                            });

                        if (!error) {
                            guestsAddedCount++;
                            setMembers(prev => [...prev, {
                                user_id: null,
                                guest_name: cleanName,
                                profile: {
                                    id: 'guest',
                                    display_name: cleanName,
                                    first_name: cleanName,
                                    avatar_url: null,
                                    short_id: 'GUEST'
                                }
                            }]);
                        }
                    }
                }
            }

            // Update party count if added
            // Sync Party Count
            const { count } = await supabase.from('party_members').select('*', { count: 'exact', head: true }).eq('party_id', id);

            const totalAdded = addedCount + guestsAddedCount; // Re-introduced

            if (count !== null) {
                await supabase.from('parties').update({ current_players: count }).eq('id', id);
                setParty((prev: any) => ({
                    ...prev,
                    current_players: count
                }));
            }

            alert(`เพิ่มสมาชิกเรียบร้อย ${totalAdded} คน\n(สมาชิก: ${addedCount}, Guest: ${guestsAddedCount})`);
            setImportText("");

        } catch (error) {
            console.error("Import error:", error);
            alert("เกิดข้อผิดพลาดในการนำเข้า");
        } finally {
            setIsImporting(false);
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
                                max={50}
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

                        {/* Import Members */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <UsersIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">เพิ่มสมาชิกจาก Line</span>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                                <p className="text-xs text-muted-foreground">วางข้อความเช็คชื่อจาก Line เพื่อค้นหาและเพิ่มสมาชิกอัตโนมัติ</p>
                                <Textarea
                                    placeholder="วางรายชื่อที่นี่..."
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    className="bg-muted/30 min-h-[100px]"
                                />
                                <Button
                                    onClick={handleImportMembers}
                                    disabled={isImporting || !importText.trim()}
                                    variant="outline"
                                    className="w-full"
                                >
                                    {isImporting ? "กำลังค้นหาและเพิ่ม..." : "ค้นหาและเพิ่มสมาชิก"}
                                </Button>
                            </div>
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
                                    {members.map((member, i) => {
                                        const isHost = member.user_id === party?.host_id;
                                        const displayName = member.profile?.display_name ||
                                            member.profile?.first_name ||
                                            "ผู้เล่น";
                                        const shortId = member.profile?.short_id || "";

                                        return (
                                            <div
                                                key={member.id || member.user_id || i} // Use DB ID if available
                                                className="flex flex-col p-3 rounded-xl bg-card border border-border gap-3"
                                            >
                                                <div className="flex items-center justify-between">
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
                                                                {shortId === 'GUEST' ? (
                                                                    <button
                                                                        onClick={() => handleLinkGuest(member.id, displayName)}
                                                                        className="flex items-center gap-1 text-orange-500 hover:underline bg-orange-500/10 px-1.5 py-0.5 rounded"
                                                                    >
                                                                        <span>#GUEST</span>
                                                                        <Icons.link className="w-3 h-3" />
                                                                    </button>
                                                                ) : (
                                                                    <span>#{shortId}</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {!isHost && (
                                                        <button
                                                            onClick={() => {
                                                                // Pass ID (PK) correctly
                                                                handleRemoveMember(member.id, displayName);
                                                            }}
                                                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors tap-highlight"
                                                        >
                                                            <Icons.trash className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Level Selector */}
                                                <div className="flex items-center gap-2 pl-[52px]">
                                                    <span className="text-xs text-muted-foreground">ระดับ:</span>
                                                    <div className="flex bg-muted/50 rounded-lg p-1 gap-1">
                                                        {partyLevelOptions.map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => handleUpdateMemberLevelById(member.id, opt.id)}
                                                                className={cn(
                                                                    "px-3 py-1 rounded text-xs font-medium transition-all",
                                                                    member.skill_level === opt.id
                                                                        ? opt.color + " shadow-sm ring-1 ring-inset ring-black/5"
                                                                        : "text-muted-foreground hover:bg-white/50"
                                                                )}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
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
