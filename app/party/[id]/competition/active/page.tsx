"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Types
type Player = {
    id: string; // party_member_id
    name: string;
    avatar_url: string | null;
    level: string; // Skill Level
    roundsPlayed: number;
    wins: number;
    lastPlayedTime: number; // For fairness logic
    isPaused?: boolean;
};

type Match = {
    id: string;
    courtId: number;
    status: 'waiting' | 'playing' | 'finished';
    startTime?: number;
    team1: Player[];
    team2: Player[];
    score1?: number;
    score2?: number;
    team1Games?: number; // Games played consecutively on this court
    team2Games?: number;
};

type Court = {
    id: number;
    name?: string;
    currentMatch: Match | null;
};

type RotationMode = 'out_4' | 'out_2';
type MatchmakingMode = 'random' | 'split_level' | 'balanced_mix';

// --- Helpers ---
const getLevelWeight = (level: string) => {
    const l = level?.toLowerCase() || '';
    if (l === 'pro' || l === 'competitor') return 10;
    if (l === 'strong' || l === 'heavy') return 8;
    if (l === 'intermediate' || l === 'normal' || l === 'medium') return 5;
    if (l === 'beginner' || l === 'bg') return 2;
    return 1; // Unknow
};
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getLevelColor = (level: string) => {
    const l = level?.toLowerCase() || '';
    if (l === 'heavy' || l === 'strong' || l === 'pro') return 'bg-red-500';
    if (l === 'medium' || l === 'normal' || l === 'intermediate') return 'bg-orange-500';
    return 'bg-green-500'; // Default: light, beginner
};

function ActiveCompetitionContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;

    // Config from Params
    const courtCount = parseInt(searchParams.get('courts') || '2');
    const queueFormat = searchParams.get('mode') || 'winner_stays';
    const autoFill = searchParams.get('auto') === 'true';

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [players, setPlayers] = useState<Player[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [queue, setQueue] = useState<Player[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isToggling, setIsToggling] = useState(false);

    // Settings State
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [matchmakingMode, setMatchmakingMode] = useState<MatchmakingMode>('random');
    const [rotationMode, setRotationMode] = useState<RotationMode>('out_4');

    // Timer State
    const [now, setNow] = useState(Date.now());

    // Score Modal
    const [finishMatchId, setFinishMatchId] = useState<string | null>(null);
    const [score1, setScore1] = useState("");
    const [score2, setScore2] = useState("");

    // Court Name Edit State
    const [editingCourtId, setEditingCourtId] = useState<number | null>(null);
    const [tempCourtName, setTempCourtName] = useState("");

    // Finish Competition State
    const [isFinishConfirmed, setIsFinishConfirmed] = useState(false);

    // --- Persistence Logic ---
    const updateRemoteState = async (newCourts: Court[], newQueue: Player[]) => {
        if (!isHost || !roomId) return;
        const supabase = createClient();
        if (!supabase) return;
        await supabase
            .from('competition_rooms')
            .update({
                state: {
                    courts: newCourts,
                    queue: newQueue,
                    settings: { matchmakingMode, rotationMode }
                },
                updated_at: new Date().toISOString()
            })
            .eq('id', roomId);
    };

    const handleResetSession = async () => {
        if (!confirm("คุณต้องการรีเซ็ตการจัดทีมทั้งหมดใช่หรือไม่? (ข้อมูลเดิมจะหายไป)")) return;
        const supabase = createClient();
        if (!supabase || !roomId) return;

        // Reset local and remote
        const emptyCourts = Array.from({ length: courtCount }, (_, i) => ({ id: i + 1, currentMatch: null }));
        const allPlayers = [...players].map(p => ({ ...p, roundsPlayed: 0, lastPlayedTime: 0 }));
        const shuffled = [...allPlayers].sort(() => 0.5 - Math.random());

        setCourts(emptyCourts);
        setQueue(shuffled);
        setPlayers(allPlayers);
        updateRemoteState(emptyCourts, shuffled);
    };

    const handleShuffleQueue = () => {
        const shuffled = [...queue].sort(() => 0.5 - Math.random());
        setQueue(shuffled);
        updateRemoteState(courts, shuffled);
    };

    // --- Settings Sync ---
    useEffect(() => {
        if (isHost && roomId) {
            updateRemoteState(courts, queue);
        }
    }, [matchmakingMode, rotationMode]);

    const saveCourtName = (courtId: number) => {
        const newCourts = courts.map(c =>
            c.id === courtId ? { ...c, name: tempCourtName } : c
        );
        setCourts(newCourts);
        setEditingCourtId(null);
        updateRemoteState(newCourts, queue);
    };

    const handleTogglePause = (playerId: string) => {
        if (!isHost) return;
        const newQueue = queue.map(p =>
            p.id === playerId ? { ...p, isPaused: !p.isPaused } : p
        );
        setQueue(newQueue);
        if (roomId) updateRemoteState(courts, newQueue);
    };

    const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [guestLevel, setGuestLevel] = useState("beginner");

    const handleAddGuest = async () => {
        if (!guestName.trim() || !isHost) return;
        const supabase = createClient();
        if (!supabase) return;

        const { data: newMember, error } = await supabase
            .from('party_members')
            .insert({
                party_id: id,
                guest_name: guestName,
                skill_level: guestLevel,
                payment_status: 'paid'
            })
            .select()
            .single();

        if (newMember) {
            const newPlayer: Player = {
                id: newMember.id,
                name: guestName,
                avatar_url: null,
                level: guestLevel,
                roundsPlayed: 0,
                wins: 0,
                lastPlayedTime: 0
            };
            const newQueue = [...queue, newPlayer];
            const newPlayers = [...players, newPlayer];
            setQueue(newQueue);
            setPlayers(newPlayers);
            updateRemoteState(courts, newQueue);
            setIsAddGuestOpen(false);
            setGuestName("");
        }
    };

    // --- Initialization ---
    useEffect(() => {
        const init = async () => {
            const supabase = createClient();
            if (!supabase) return;

            // 1. Get Current User & Party Host Info
            const { data: { user } } = await supabase.auth.getUser();
            const { data: party } = await supabase.from('parties').select('host_id').eq('id', id).single();
            const hostId = party?.host_id;
            const userIsHost = user?.id === hostId;
            setIsHost(userIsHost);

            // 2. Check for existing room
            const { data: rooms } = await supabase
                .from('competition_rooms')
                .select('*')
                .eq('party_id', id)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            let activeRoom = rooms?.[0];

            if (activeRoom) {
                setRoomId(activeRoom.id);
                // If room exists, sync local state to room state (unless it's empty)
                if (activeRoom.state && activeRoom.state.courts) {
                    setCourts(activeRoom.state.courts);
                    setQueue(activeRoom.state.queue || []);
                    if (activeRoom.state.settings) {
                        if (activeRoom.state.settings.matchmakingMode) setMatchmakingMode(activeRoom.state.settings.matchmakingMode);
                        if (activeRoom.state.settings.rotationMode) setRotationMode(activeRoom.state.settings.rotationMode);
                    }
                } else if (userIsHost) {
                    await fetchPlayersOnly();
                }
            } else if (userIsHost) {
                // Just fetch players, let the host start manually
                await fetchPlayersOnly();
            }

            setIsLoading(false);

            // 4. Realtime Subscription
            const channel = supabase
                .channel(`competition:${id}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'competition_rooms', filter: `party_id=eq.${id}` },
                    (payload) => {
                        const newData = payload.new as any;
                        if (!userIsHost && newData && newData.state) {
                            // Sync state for spectators
                            setRoomId(newData.id);
                            setCourts(newData.state.courts);
                            setQueue(newData.state.queue);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        if (id) init();

        // Timer Interval
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchPlayersOnly = async () => {
        const supabase = createClient();
        if (!supabase) return;
        setIsLoading(true);

        const { data: members } = await supabase
            .from("party_members")
            .select(`
                id,
                skill_level,
                guest_name,
                user:profiles!user_id(id, display_name, first_name, avatar_url, skill_level)
            `)
            .eq("party_id", id);

        if (members) {
            const mappedPlayers: Player[] = members.map((m: any) => ({
                id: m.id,
                name: m.user ? (m.user.display_name || m.user.first_name) : (m.guest_name || "Guest"),
                avatar_url: m.user?.avatar_url || null,
                level: m.skill_level || m.user?.skill_level || "beginner",
                roundsPlayed: 0,
                wins: 0,
                lastPlayedTime: 0
            }));
            setPlayers(mappedPlayers);
            setQueue(mappedPlayers);

            // Initialize empty courts if not already set
            if (courts.length === 0) {
                const initialCourts: Court[] = Array.from({ length: courtCount }, (_, i) => ({
                    id: i + 1,
                    currentMatch: null
                }));
                setCourts(initialCourts);
            }
        }
        setIsLoading(false);
    };

    const handleStopSession = async () => {
        if (!confirm("คุณต้องการปิดระบบ Matchmaking ใช่หรือไม่? ผู้เล่นอื่นจะไม่เห็นข้อมูลการจัดทีมแบบ Real-time อีก")) return;

        setIsToggling(true);
        const supabase = createClient();
        if (!supabase || !roomId) return;

        const { error } = await supabase
            .from('competition_rooms')
            .update({ status: 'finished', updated_at: new Date().toISOString() })
            .eq('id', roomId);

        if (!error) {
            setRoomId(null);
        }
        setIsToggling(false);
    };

    const handleStartSession = async () => {
        setIsToggling(true);
        const supabase = createClient();
        if (!supabase) {
            setIsToggling(false);
            return;
        }

        // Use existing state or assign if empty
        let currentCourts = courts.length > 0 ? [...courts] : Array.from({ length: courtCount }, (_, i) => ({
            id: i + 1,
            currentMatch: null
        }));
        let currentQueue = [...queue];

        // If no matches yet, assign from existing queue
        const hasMatch = currentCourts.some(c => c.currentMatch);
        if (!hasMatch) {
            for (let court of currentCourts) {
                if (currentQueue.length >= 4) {
                    const p1 = currentQueue.shift()!;
                    const p2 = currentQueue.shift()!;
                    const p3 = currentQueue.shift()!;
                    const p4 = currentQueue.shift()!;
                    court.currentMatch = {
                        id: `match-${Date.now()}-${court.id}`,
                        courtId: court.id,
                        status: 'waiting',
                        team1: [p1, p2],
                        team2: [p3, p4]
                    };
                }
            }
            setCourts(currentCourts);
            setQueue(currentQueue);
        }

        // Create or Update Room
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("Matchmaking toggle failed: No user found");
            setIsToggling(false);
            return;
        }

        try {
            const { data: existing, error: checkError } = await supabase
                .from('competition_rooms')
                .select('id')
                .eq('party_id', id)
                .eq('status', 'active')
                .maybeSingle();

            if (existing) {
                const { error: updateError } = await supabase.from('competition_rooms').update({
                    state: { courts: currentCourts, queue: currentQueue },
                    updated_at: new Date().toISOString()
                }).eq('id', existing.id);

                if (!updateError) setRoomId(existing.id);
                else console.error("Update Room Error:", updateError);
            } else {
                const { data: newRoom, error: createError } = await supabase
                    .from('competition_rooms')
                    .insert({
                        party_id: id,
                        name: `Matchmaking - ${new Date().toLocaleDateString()}`,
                        created_by: user.id,
                        status: 'active',
                        state: { courts: currentCourts, queue: currentQueue }
                    })
                    .select()
                    .maybeSingle();

                if (newRoom) {
                    setRoomId(newRoom.id);
                } else {
                    console.error("Create Room Error Detail:", JSON.stringify(createError));
                    // Check if maybe it already exists but checkError missed it
                }
            }
        } catch (err) {
            console.error("Session Toggle Error:", err);
        }

        setIsToggling(false);
    };

    const refreshPlayers = async () => {
        // This is for manual player list manual sync - it will re-fetch everything
        if (!confirm("ดึงรายชื่อผู้เล่นใหม่จากระบบ? คิวปัจจุบันจะถูกรีเซ็ต (ใช้เมื่อมีคนใหม่เข้าร่วมก๊วน)")) return;

        setIsToggling(true);
        const supabase = createClient();
        if (!supabase) return;

        const { data: members } = await supabase
            .from("party_members")
            .select(`
                id,
                skill_level,
                guest_name,
                user:profiles!user_id(id, display_name, first_name, avatar_url, skill_level)
            `)
            .eq("party_id", id);

        if (members) {
            const mappedPlayers: Player[] = members.map((m: any) => ({
                id: m.id,
                name: m.user ? (m.user.display_name || m.user.first_name) : (m.guest_name || "Guest"),
                avatar_url: m.user?.avatar_url || null,
                level: m.skill_level || m.user?.skill_level || "beginner",
                roundsPlayed: 0,
                wins: 0,
                lastPlayedTime: 0
            }));

            setPlayers(mappedPlayers);
            setQueue(mappedPlayers);

            // Re-initialize courts to match current settings
            const emptyCourts = Array.from({ length: courtCount }, (_, i) => ({ id: i + 1, currentMatch: null }));
            setCourts(emptyCourts);

            if (roomId) {
                updateRemoteState(emptyCourts, mappedPlayers);
            }
        }
        setIsToggling(false);
    };

    const assignCourtsInitial = (availablePlayers: Player[], initialCourts: Court[]) => {
        let currentQueue = [...availablePlayers];

        // Respect current mode for initial assignment too logic could be shared but for now keep simple default
        if (matchmakingMode !== 'random') {
            // If specific mode is set, use the auto assign logic?
            // Actually, let's just let the queue be processed by handleAutoAssign logic if called.
            // But for initialization, we just fill linearly. 
            // To support 'Split' on init, we should sort the queue first.
            if (matchmakingMode === 'split_level') {
                currentQueue.sort((a, b) => getLevelWeight(b.level) - getLevelWeight(a.level));
            } else if (matchmakingMode === 'balanced_mix') {
                // Sort High -> Low
                currentQueue.sort((a, b) => getLevelWeight(b.level) - getLevelWeight(a.level));
            }
        }

        const newCourts = [...initialCourts];

        for (let court of newCourts) {
            if (currentQueue.length >= 4) {
                // For balanced mix, we need to pick specific indices, not just shift()
                let p1, p2, p3, p4;

                if (matchmakingMode === 'balanced_mix') {
                    // Pick 1 High, 1 Low, 1 High, 1 Low
                    p1 = currentQueue.shift()!;
                    p2 = currentQueue.pop()!;
                    if (currentQueue.length >= 2) {
                        p3 = currentQueue.shift()!;
                        p4 = currentQueue.pop()!;
                    } else {
                        // Fallback
                        p3 = currentQueue.shift() || p1; // Should not happen due to check
                        p4 = currentQueue.shift() || p2;
                    }
                } else {
                    // Random or Split (Sorted)
                    p1 = currentQueue.shift()!;
                    p2 = currentQueue.shift()!;
                    p3 = currentQueue.shift()!;
                    p4 = currentQueue.shift()!;
                }

                court.currentMatch = {
                    id: `match-${Date.now()}-${court.id}`,
                    courtId: court.id,
                    status: 'waiting',
                    team1: [p1, p2],
                    team2: [p3, p4]
                };
            }
        }

        setCourts(newCourts);
        setQueue(currentQueue);
    };

    const handleAutoAssign = () => {
        if (!confirm("ระบบจะจัดทีมใหม่ตามโหมดที่เลือก (" + (
            matchmakingMode === 'split_level' ? 'แยกมือ' :
                matchmakingMode === 'balanced_mix' ? 'คละมือ' : 'สุ่ม'
        ) + ") และล้างสนามปัจจุบัน?")) return;

        // Reset courts and ensure type safety
        const newCourts: Court[] = courts.map(c => ({ ...c, currentMatch: null }));

        // Gather everyone (on court + in queue)
        const allOnCourt = courts.flatMap(c => c.currentMatch ? [...c.currentMatch.team1, ...c.currentMatch.team2] : []);

        // Separate paused players from active pool
        const pausedPlayers = queue.filter(p => p.isPaused);
        const activePool = [...queue.filter(p => !p.isPaused), ...allOnCourt];
        const pool = [...activePool];

        if (matchmakingMode === 'random') {
            pool.sort(() => 0.5 - Math.random());
        } else {
            // Sort by Skill Descending for algorithms
            pool.sort((a, b) => getLevelWeight(b.level) - getLevelWeight(a.level));
        }

        // Distribute
        for (let court of newCourts) {
            if (pool.length < 4) break;

            let p1: Player, p2: Player, p3: Player, p4: Player;

            if (matchmakingMode === 'split_level') {
                p1 = pool.shift()!;
                p2 = pool.shift()!;
                p3 = pool.shift()!;
                p4 = pool.shift()!;
            } else if (matchmakingMode === 'balanced_mix') {
                p1 = pool.shift()!;
                p4 = pool.pop()!;
                if (pool.length >= 2) {
                    p2 = pool.shift()!;
                    p3 = pool.pop()!;
                } else {
                    p2 = pool.shift()!;
                    p3 = pool.shift()!;
                }
            } else {
                p1 = pool.shift()!;
                p2 = pool.shift()!;
                p3 = pool.shift()!;
                p4 = pool.shift()!;
            }

            court.currentMatch = {
                id: `match-${Date.now()}-${court.id}`,
                courtId: court.id,
                status: 'waiting',
                team1: [p1, p4],
                team2: [p2, p3],
                team1Games: 0,
                team2Games: 0
            };
        }

        const finalQueue = [...pool, ...pausedPlayers];
        setCourts(newCourts);
        setQueue(finalQueue);
        updateRemoteState(newCourts, finalQueue);
    };

    const updateCourtCount = (count: number) => {
        if (count < 1) return;
        if (count > courts.length) {
            // Add courts
            const added = Array.from({ length: count - courts.length }, (_, i) => ({
                id: courts.length + i + 1,
                currentMatch: null
            }));
            const newCourts = [...courts, ...added];
            setCourts(newCourts);
            // Sync? Not yet, maybe explicit
            if (roomId) updateRemoteState(newCourts, queue);
        } else if (count < courts.length) {
            // Remove courts (from end)
            // Ideally check if playing?
            const newCourts = courts.slice(0, count);
            setCourts(newCourts);
            if (roomId) updateRemoteState(newCourts, queue);
        }
    };

    const [substitutionData, setSubstitutionData] = useState<{ source: 'court' | 'queue', courtId?: number, player: Player } | null>(null);

    // --- Logic: Fill Empty Court ---
    const fillCourt = (courtId: number) => {
        if (!isHost) return;
        if (queue.length < 4) {
            alert("ผู้เล่นไม่เพียงพอสำหรับจัดคู่ใหม่ (ต้องการ 4 คน)");
            return;
        }

        const sortedQueue = [...queue].sort((a, b) => {
            if (a.roundsPlayed !== b.roundsPlayed) return a.roundsPlayed - b.roundsPlayed;
            return a.lastPlayedTime - b.lastPlayedTime;
        });

        const activePlayersInQueue = sortedQueue.filter(p => !p.isPaused);
        const pausedPlayersInQueue = sortedQueue.filter(p => p.isPaused);

        if (activePlayersInQueue.length < 4) {
            alert("ผู้เล่นที่ไม่ถูกพัก (Active) ไม่เพียงพอสำหรับจัดคู่ใหม่ (ต้องการ 4 คน)");
            return;
        }

        const nextPlayers = activePlayersInQueue.slice(0, 4);
        const remainingActive = activePlayersInQueue.slice(4);
        const remainingQueue = [...remainingActive, ...pausedPlayersInQueue];
        const shuffled4 = nextPlayers.sort(() => 0.5 - Math.random());

        const newMatch: Match = {
            id: `match-${Date.now()}-${courtId}`,
            courtId: courtId,
            status: 'waiting',
            team1: [shuffled4[0], shuffled4[1]],
            team2: [shuffled4[2], shuffled4[3]],
            team1Games: 0,
            team2Games: 0
        };

        const newCourts = courts.map(c => c.id === courtId ? { ...c, currentMatch: newMatch } : c);
        setCourts(newCourts);
        setQueue(remainingQueue);
        updateRemoteState(newCourts, remainingQueue);
    };

    const handleSubstitute = (targetQueuePlayer: Player) => {
        if (!isHost || !substitutionData) return;
        const { source, courtId, player: courtPlayer } = substitutionData;

        let finalCourts = [...courts];
        let finalQueue = [...queue];

        if (source === 'court' && courtId) {
            finalQueue = finalQueue.filter(p => p.id !== targetQueuePlayer.id);
            finalQueue.unshift({ ...courtPlayer });
            finalCourts = finalCourts.map(c => {
                if (c.id !== courtId || !c.currentMatch) return c;
                const m = c.currentMatch;
                const updateTeam = (team: Player[]) => team.map(p => p.id === courtPlayer.id ? targetQueuePlayer : p);
                return {
                    ...c,
                    currentMatch: {
                        ...m,
                        team1: updateTeam(m.team1),
                        team2: updateTeam(m.team2)
                    }
                };
            });
        } else {
            const idx1 = finalQueue.findIndex(p => p.id === courtPlayer.id);
            const idx2 = finalQueue.findIndex(p => p.id === targetQueuePlayer.id);
            if (idx1 !== -1 && idx2 !== -1) {
                [finalQueue[idx1], finalQueue[idx2]] = [finalQueue[idx2], finalQueue[idx1]];
            }
        }

        setCourts(finalCourts);
        setQueue(finalQueue);
        updateRemoteState(finalCourts, finalQueue);
        setSubstitutionData(null);
    };

    const handleUpdatePlayerInfo = (playerId: string, newName: string, newLevel: string) => {
        if (!isHost) return;
        const update = (p: Player) => p.id === playerId ? { ...p, name: newName, level: newLevel } : p;

        const newPlayers = players.map(update);
        const newQueue = queue.map(update);
        const newCourts = courts.map(c => ({
            ...c,
            currentMatch: c.currentMatch ? {
                ...c.currentMatch,
                team1: c.currentMatch.team1.map(update),
                team2: c.currentMatch.team2.map(update)
            } : null
        }));

        setPlayers(newPlayers);
        setQueue(newQueue);
        setCourts(newCourts);
        updateRemoteState(newCourts, newQueue);
    };

    const handleSwapPlayers = (courtId: number) => {
        if (!isHost) return;
        const newCourts = courts.map(c => {
            if (c.id !== courtId || !c.currentMatch || c.currentMatch.status !== 'waiting') return c;

            const m = c.currentMatch;
            const all = [...m.team1, ...m.team2];
            if (all.length !== 4) return c;

            const sorted = [...all].sort((a, b) => a.id.localeCompare(b.id));
            const [p1, p2, p3, p4] = sorted;

            const isP1WithP2 = m.team1.some(x => x.id === p1.id) && m.team1.some(x => x.id === p2.id) ||
                m.team2.some(x => x.id === p1.id) && m.team2.some(x => x.id === p2.id);

            const isP1WithP3 = m.team1.some(x => x.id === p1.id) && m.team1.some(x => x.id === p3.id) ||
                m.team2.some(x => x.id === p1.id) && m.team2.some(x => x.id === p3.id);

            let newTeam1, newTeam2;
            if (isP1WithP2) {
                newTeam1 = [p1, p3];
                newTeam2 = [p2, p4];
            } else if (isP1WithP3) {
                newTeam1 = [p1, p4];
                newTeam2 = [p2, p3];
            } else {
                newTeam1 = [p1, p2];
                newTeam2 = [p3, p4];
            }

            return {
                ...c,
                currentMatch: {
                    ...m,
                    team1: newTeam1,
                    team2: newTeam2
                }
            };
        });

        setCourts(newCourts);
        updateRemoteState(newCourts, queue);
    };

    const handleStartMatch = (courtId: number) => {
        if (!isHost) return;
        const newCourts = courts.map(c => {
            if (c.id === courtId && c.currentMatch) {
                return {
                    ...c,
                    currentMatch: {
                        ...c.currentMatch,
                        status: 'playing' as const,
                        startTime: Date.now()
                    }
                };
            }
            return c;
        });
        setCourts(newCourts);
        updateRemoteState(newCourts, queue);
    };

    const handleFinishMatch = (courtId: number) => {
        if (!isHost) return;
        setFinishMatchId(courtId.toString());
        setScore1("");
        setScore2("");
    };

    const confirmFinishMatch = () => {
        if (!finishMatchId || !isHost) return;
        const court = courts.find(c => c.id.toString() === finishMatchId);
        if (!court || !court.currentMatch) return;

        const match = court.currentMatch;
        const s1 = parseInt(score1 || "0");
        const s2 = parseInt(score2 || "0");
        const team1Won = s1 > s2;

        if (rotationMode === 'out_2') {
            const team1Played = match.team1Games || 0;
            const team2Played = match.team2Games || 0;

            let playersLeaving: Player[] = [];
            let playersStaying: Player[] = [];
            let stayingTeamGames = 0;

            if (team1Played === 0 && team2Played === 0) {
                // Game 1: Winner stays
                if (team1Won) {
                    playersStaying = match.team1;
                    playersLeaving = match.team2;
                } else {
                    playersStaying = match.team2;
                    playersLeaving = match.team1;
                }
                stayingTeamGames = 1;
            } else {
                // Subsequent games: 2 in 2 out
                if (team1Played === 1) {
                    playersLeaving = match.team1;
                    playersStaying = match.team2;
                } else {
                    playersLeaving = match.team2;
                    playersStaying = match.team1;
                }
                stayingTeamGames = 1;
            }

            const updatedLeaving = playersLeaving.map(p => {
                const isTeam1 = match.team1.some(tp => tp.id === p.id);
                const won = isTeam1 ? team1Won : !team1Won;
                return {
                    ...p,
                    roundsPlayed: (p.roundsPlayed || 0) + 1,
                    wins: (p.wins || 0) + (won ? 1 : 0),
                    lastPlayedTime: Date.now()
                };
            });

            const updatedStaying = playersStaying.map(p => {
                const isTeam1 = match.team1.some(tp => tp.id === p.id);
                const won = isTeam1 ? team1Won : !team1Won;
                return {
                    ...p,
                    roundsPlayed: (p.roundsPlayed || 0) + 1,
                    wins: (p.wins || 0) + (won ? 1 : 0),
                    lastPlayedTime: Date.now()
                };
            });

            const sortedQueue = [...queue].filter(p => !p.isPaused).sort((a, b) => {
                if (a.roundsPlayed !== b.roundsPlayed) return a.roundsPlayed - b.roundsPlayed;
                return a.lastPlayedTime - b.lastPlayedTime;
            });

            if (sortedQueue.length >= 2) {
                const newIn = sortedQueue.slice(0, 2);
                const remainingQueue = [...sortedQueue.slice(2), ...queue.filter(p => p.isPaused), ...updatedLeaving];

                const nextMatch: Match = {
                    id: `match-${Date.now()}-${court.id}`,
                    courtId: court.id,
                    status: 'waiting',
                    team1: updatedStaying,
                    team2: newIn,
                    team1Games: stayingTeamGames,
                    team2Games: 0
                };

                const newCourts = courts.map(c => c.id === court.id ? { ...c, currentMatch: nextMatch } : c);
                setQueue(remainingQueue);
                setCourts(newCourts);
                updateRemoteState(newCourts, remainingQueue);
            } else {
                const newQueue = [...queue, ...updatedLeaving, ...updatedStaying];
                const newCourts = courts.map(c => c.id === court.id ? { ...c, currentMatch: null } : c);
                setQueue(newQueue);
                setCourts(newCourts);
                updateRemoteState(newCourts, newQueue);
            }
        } else {
            // Default Matchmaking Logic
            const allPlayersInMatch = [...match.team1, ...match.team2];
            const updatedPlayers = allPlayersInMatch.map(p => {
                const isTeam1 = match.team1.some(tp => tp.id === p.id);
                const won = isTeam1 ? team1Won : !team1Won;
                return {
                    ...p,
                    roundsPlayed: (p.roundsPlayed || 0) + 1,
                    wins: (p.wins || 0) + (won ? 1 : 0),
                    lastPlayedTime: Date.now()
                };
            });

            const newQueue = [...queue, ...updatedPlayers];
            const newCourts = courts.map(c => c.id === court.id ? { ...c, currentMatch: null } : c);

            setQueue(newQueue);
            setCourts(newCourts);
            updateRemoteState(newCourts, newQueue);
        }

        setFinishMatchId(null);
        setScore1("");
        setScore2("");
    };

    if (isLoading) {
        return (
            <AppShell hideNav>
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <LoadingShuttlecock />
                    <p className="text-muted-foreground animate-pulse text-sm">กำลังโหลดข้อมูลการแข่งขัน...</p>
                </div>
            </AppShell>
        );
    }

    if (!roomId && !isHost) {
        return (
            <AppShell hideNav>
                <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center bg-[#1a1b1e]">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                        <Icons.loader className="w-10 h-10 text-primary animate-spin" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">ยังไม่มีการจัดทีม</h2>
                        <p className="text-muted-foreground">รอผู้จัด (Host) เริ่มต้นระบบ Matchmaking แล้วทีมจะแสดงขึ้นมาที่นี่แบบ Real-time</p>
                    </div>
                    <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
                        กลับสารบัญก๊วน
                    </Button>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell hideNav>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 safe-area-top">
                <div className="flex items-center justify-between px-4 h-16">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground hover:text-white transition-colors">
                        <Icons.chevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col items-center flex-1 min-w-0 px-2">
                        <h1 className="font-bold text-base sm:text-xl tracking-tight flex items-center gap-2 truncate w-full justify-center">
                            การแข่งขัน
                            {roomId && (
                                <Badge variant="secondary" className="h-4 text-[7px] sm:text-[8px] bg-green-500/10 text-green-500 border-green-500/20 px-1 py-0 animation-pulse shrink-0">
                                    LIVE
                                </Badge>
                            )}
                        </h1>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5 truncate">
                            {courts.length} คอร์ท
                            <span className="text-muted-foreground/30 mx-0.5">|</span>
                            {isHost ? (
                                <span className="flex items-center gap-1 text-primary">
                                    HOST
                                </span >
                            ) : (
                                <span className="flex items-center gap-1">
                                    VIEW
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center justify-end shrink-0">
                        {isHost && (
                            !roomId ? (
                                <Button
                                    onClick={handleStartSession}
                                    disabled={isToggling}
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold h-9 rounded-xl px-4 text-xs shadow-lg shadow-green-900/40 border-0 flex items-center gap-2 transition-all active:scale-95"
                                >
                                    {isToggling ? (
                                        <Icons.loader className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Icons.play className="w-3 h-3 fill-current" />
                                    )}
                                    <span className="hidden xs:inline">เริ่ม Matchmaking</span>
                                    <span className="xs:hidden">เริ่ม</span>
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleStopSession}
                                    disabled={isToggling}
                                    className="bg-red-600 hover:bg-red-500 text-white font-bold h-8 sm:h-9 rounded-xl px-2 sm:px-4 text-[10px] sm:text-xs shadow-lg shadow-red-900/40 border-0 flex items-center gap-1.5 transition-all active:scale-95 group"
                                >
                                    {isToggling ? (
                                        <Icons.loader className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Icons.trash className="w-3 h-3 group-hover:fill-current" />
                                    )}
                                    <span className="hidden xs:inline">ระบบ Matchmaking</span>
                                    <span className="xs:hidden">เปิดอยู่</span>
                                </Button>
                            )
                        )}
                        {!isHost && roomId && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] uppercase font-bold text-green-500 tracking-wider">Session Active</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Background Gradient */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-background to-background" />
            </div>

            <div className="pb-32 px-4 pt-6 space-y-6 max-w-5xl mx-auto relative z-10">
                {/* Host Controls */}
                {isHost && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddGuestOpen(true)}
                            className="shrink-0 bg-white/5 border-white/10 text-xs gap-1.5 h-9 rounded-xl"
                        >
                            <Icons.plus className="w-3.5 h-3.5" />
                            เพิ่มคนนอก
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSettingsOpen(true)}
                            className="shrink-0 bg-white/5 border-white/10 text-xs gap-1.5 h-9 rounded-xl"
                        >
                            <Icons.settings className="w-3.5 h-3.5" />
                            ตั้งค่า/จัดทีม
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShuffleQueue}
                            className="shrink-0 bg-white/5 border-white/10 text-xs gap-1.5 h-9 rounded-xl"
                        >
                            <Icons.shuffle className="w-3.5 h-3.5" />
                            สลับคิวใหม่
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshPlayers}
                            className="shrink-0 bg-white/5 border-white/10 text-xs gap-1.5 h-9 rounded-xl"
                        >
                            <Icons.refresh className="w-3.5 h-3.5" />
                            ดึงข้อมูลล่าสุด
                        </Button>
                        <div className="flex-1" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetSession}
                            className="shrink-0 text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs gap-1.5 h-9 rounded-xl"
                        >
                            <Icons.trash className="w-3.5 h-3.5" />
                            รีเซ็ต
                        </Button>
                    </div>
                )}

                {/* Courts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {courts.map(court => {
                        const match = court.currentMatch;
                        const isPlaying = match?.status === 'playing';
                        const duration = (isPlaying && match?.startTime)
                            ? Math.floor((now - match.startTime) / 1000)
                            : 0;

                        return (
                            <GlassCard key={court.id} className={cn(
                                "overflow-hidden border border-white/10 shadow-lg transition-all duration-500 flex flex-col min-h-[14rem]",
                                isPlaying ? "ring-1 ring-primary/30 shadow-primary/5" : ""
                            )}>
                                {/* Court Header */}
                                <div className="bg-white/5 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-white/5">
                                    <h3 className="font-bold flex items-center gap-2 text-primary tracking-wide text-sm flex-1 min-w-0">
                                        <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                                            <Icons.mapPin className="w-3.5 h-3.5" />
                                        </div>
                                        {isHost ? (
                                            editingCourtId === court.id ? (
                                                <input
                                                    autoFocus
                                                    className="bg-primary/20 border-none text-primary font-bold w-full max-w-[120px] px-2 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                                                    value={tempCourtName}
                                                    onChange={e => setTempCourtName(e.target.value)}
                                                    onBlur={() => saveCourtName(court.id)}
                                                    onKeyDown={e => e.key === 'Enter' && saveCourtName(court.id)}
                                                />
                                            ) : (
                                                <span
                                                    className="cursor-pointer hover:text-primary/80 transition-colors flex items-center gap-1.5 truncate"
                                                    onClick={() => {
                                                        setEditingCourtId(court.id);
                                                        setTempCourtName(court.name || `คอร์ท ${court.id}`);
                                                    }}
                                                >
                                                    {court.name || `คอร์ท ${court.id}`}
                                                    <Icons.edit className="w-3 h-3 opacity-40 shrink-0" />
                                                </span>
                                            )
                                        ) : (
                                            <span className="truncate">{court.name || `คอร์ท ${court.id}`}</span>
                                        )}
                                    </h3>
                                    {match ? (
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border",
                                            isPlaying
                                                ? "bg-red-500/10 border-red-500/20 text-red-500"
                                                : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                        )}>
                                            {isPlaying ? (
                                                <>
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                    </span>
                                                    <span className="tabular-nums text-xs">{formatTime(duration)}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                    รอเริ่ม
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <Badge variant="secondary" className="bg-white/5 text-muted-foreground border-transparent text-[10px] px-2 h-6">ว่าง</Badge>
                                    )}
                                </div>

                                {/* Court Body */}
                                <div className="p-3 flex-1 flex flex-col justify-center">
                                    {match ? (
                                        <div className="space-y-3">
                                            {/* Teams Display */}
                                            <div className="flex items-center justify-between relative gap-1">
                                                {/* VS Badge / Swap Button */}
                                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                                    {match.status === 'waiting' ? (
                                                        <button
                                                            onClick={() => handleSwapPlayers(court.id)}
                                                            className="w-8 h-8 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center shadow-lg hover:scale-110 hover:border-primary active:scale-95 transition-all group"
                                                            title="สลับคู่"
                                                        >
                                                            <Icons.refresh className="w-3.5 h-3.5 text-primary group-hover:rotate-180 transition-transform duration-500" />
                                                        </button>
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-background border border-primary/20 flex items-center justify-center shadow-lg">
                                                            <span className="text-[9px] font-black text-muted-foreground">VS</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Team 1 */}
                                                <div className="flex-1 flex flex-col items-start gap-2 min-w-0">
                                                    {rotationMode === 'out_2' && (
                                                        <div className="px-1.5 py-0.5 rounded bg-primary/10 text-[8px] font-bold text-primary uppercase tracking-tighter">
                                                            {match.team1Games === 1 ? 'เกมที่ 2' : 'เกมที่ 1'}
                                                        </div>
                                                    )}
                                                    {match.team1.map((p, idx) => (
                                                        <div
                                                            key={p.id}
                                                            onClick={() => match.status === 'waiting' && setSubstitutionData({ source: 'court', courtId: court.id, player: p })}
                                                            className={cn(
                                                                "relative group w-full transition-all",
                                                                match.status === 'waiting' && "cursor-pointer hover:opacity-80 active:scale-95"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2 bg-white/5 pr-3 pl-1.5 py-1.5 rounded-full border border-white/5 transition-all hover:bg-white/10">
                                                                <div className="relative shrink-0">
                                                                    <Image src={p.avatar_url || "/placeholder.svg"} alt={p.name} width={28} height={28} className="rounded-full bg-muted object-cover" />
                                                                    <div className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#1a1b1e]", getLevelColor(p.level))} />
                                                                </div>
                                                                <span className="text-xs font-medium truncate">{p.name}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Team 2 */}
                                                <div className="flex-1 flex flex-col items-end gap-2 min-w-0">
                                                    {rotationMode === 'out_2' && (
                                                        <div className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[8px] font-bold text-blue-500 uppercase tracking-tighter">
                                                            {match.team2Games === 1 ? 'เกมที่ 2' : 'เกมที่ 1'}
                                                        </div>
                                                    )}
                                                    {match.team2.map((p, idx) => (
                                                        <div
                                                            key={p.id}
                                                            onClick={() => match.status === 'waiting' && setSubstitutionData({ source: 'court', courtId: court.id, player: p })}
                                                            className={cn(
                                                                "relative group w-full flex justify-end transition-all",
                                                                match.status === 'waiting' && "cursor-pointer hover:opacity-80 active:scale-95"
                                                            )}
                                                        >
                                                            <div className="flex flex-row-reverse items-center gap-2 bg-white/5 pl-3 pr-1.5 py-1.5 rounded-full border border-white/5 transition-all hover:bg-white/10">
                                                                <div className="relative shrink-0">
                                                                    <Image src={p.avatar_url || "/placeholder.svg"} alt={p.name} width={28} height={28} className="rounded-full bg-muted object-cover" />
                                                                    <div className={cn("absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border border-[#1a1b1e]", getLevelColor(p.level))} />
                                                                </div>
                                                                <span className="text-xs font-medium truncate text-right">{p.name}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="pt-2">
                                                {match.status === 'waiting' && (
                                                    <Button
                                                        onClick={() => handleStartMatch(court.id)}
                                                        className="w-full h-9 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-md shadow-green-900/20 font-bold tracking-wide text-xs"
                                                    >
                                                        <Icons.play className="w-3.5 h-3.5 mr-2 fill-current" />
                                                        เริ่มแข่ง
                                                    </Button>
                                                )}
                                                {match.status === 'playing' && (
                                                    <Button
                                                        onClick={() => handleFinishMatch(court.id)}
                                                        variant="outline"
                                                        className="w-full h-9 rounded-xl border-primary/20 hover:bg-primary/5 text-primary font-semibold text-xs"
                                                    >
                                                        <Icons.checkCircle className="w-3.5 h-3.5 mr-2" />
                                                        จบเกม
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-muted-foreground border border-dashed border-white/10">
                                                <Icons.trophy className="w-5 h-5" />
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 text-xs border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary/60 text-primary rounded-xl px-3"
                                                onClick={() => fillCourt(court.id)}
                                                disabled={queue.length < 4}
                                            >
                                                <Icons.plus className="w-3.5 h-3.5 mr-1.5" />
                                                เรียกคิวถัดไป ({queue.length}/4)
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>

                {/* Queue Divider */}
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-background px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Waiting Area
                        </span>
                    </div>
                </div>

                {/* Next Queue Preview (Top 4) */}
                {queue.length >= 4 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground/90 px-1">
                            <span className="w-1 h-6 bg-primary rounded-full mr-1"></span>
                            คิวถัดไป (Next Match)
                        </h2>

                        <div className="relative group">
                            {/* Glow Effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-500"></div>

                            <GlassCard className="relative p-0 overflow-hidden bg-background/80 backdrop-blur-xl border-white/10">
                                <div className="p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Team 1 Preview */}
                                        <div className="flex-1 space-y-3">
                                            {[...queue].filter(p => !p.isPaused).sort((a, b) => {
                                                if (a.roundsPlayed !== b.roundsPlayed) return a.roundsPlayed - b.roundsPlayed;
                                                return a.lastPlayedTime - b.lastPlayedTime;
                                            }).slice(0, 2).map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => setSubstitutionData({ source: 'queue', player: p })}
                                                    className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all active:scale-95"
                                                >
                                                    <Image src={p.avatar_url || "/placeholder.svg"} alt={p.name} width={32} height={32} className="rounded-full bg-muted" />
                                                    <span className={cn(
                                                        "text-sm font-medium truncate flex-1 flex items-center gap-1.5",
                                                        p.isPaused && "opacity-50"
                                                    )}>
                                                        {p.name}
                                                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", getLevelColor(p.level))} />
                                                        {p.isPaused && <Badge variant="secondary" className="scale-75 origin-left h-4 px-1 text-[8px] bg-red-500/10 text-red-500 border-red-500/20">PAUSED</Badge>}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col items-center justify-center gap-1 px-2">
                                            <span className="text-3xl font-black text-muted-foreground/20 italic">VS</span>
                                        </div>

                                        {/* Team 2 Preview */}
                                        <div className="flex-1 space-y-3">
                                            {[...queue].filter(p => !p.isPaused).sort((a, b) => {
                                                if (a.roundsPlayed !== b.roundsPlayed) return a.roundsPlayed - b.roundsPlayed;
                                                return a.lastPlayedTime - b.lastPlayedTime;
                                            }).slice(2, 4).map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => setSubstitutionData({ source: 'queue', player: p })}
                                                    className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all active:scale-95"
                                                >
                                                    <Image src={p.avatar_url || "/placeholder.svg"} alt={p.name} width={32} height={32} className="rounded-full bg-muted" />
                                                    <span className={cn(
                                                        "text-sm font-medium truncate flex-1 flex items-center gap-1.5",
                                                        p.isPaused && "opacity-50"
                                                    )}>
                                                        {p.name}
                                                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", getLevelColor(p.level))} />
                                                        {p.isPaused && <Badge variant="secondary" className="scale-75 origin-left h-4 px-1 text-[8px] bg-red-500/10 text-red-500 border-red-500/20">PAUSED</Badge>}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-primary/10 py-2 text-center border-t border-primary/10">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                        เตรียมตัวลงสนาม
                                    </span>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                )}

                {/* Queue Section */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground/90">
                            <Icons.clock className="w-5 h-5 text-muted-foreground" />
                            รอเล่น ({Math.max(0, queue.length - 4)})
                        </h2>
                    </div>

                    {queue.length <= 4 ? (
                        <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors">
                            <p className="text-muted-foreground font-medium">
                                {queue.length === 0 ? "ทุกคนกำลังเล่นอยู่" : "อยู่ในคิวถัดไปทั้งหมดแล้ว"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {/* Display sorted queue (Excluding top 4) - Grid View is better for Mobile often if cards are small */}
                            {[...queue].sort((a, b) => {
                                if (a.roundsPlayed !== b.roundsPlayed) return a.roundsPlayed - b.roundsPlayed;
                                return a.lastPlayedTime - b.lastPlayedTime;
                            }).slice(4).map((p, i) => (
                                <GlassCard
                                    key={p.id}
                                    onClick={() => setSubstitutionData({ source: 'queue', player: p })}
                                    className="p-3 flex flex-col items-center justify-center text-center gap-2 bg-card/50 hover:bg-card/80 transition-all border-white/5 shadow-sm relative overflow-hidden cursor-pointer active:scale-95"
                                >
                                    {/* Rounds played badge */}
                                    {/* <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                                        {p.roundsPlayed}
                                    </div> */}

                                    <div className="relative">
                                        <Image src={p.avatar_url || "/placeholder.svg"} alt={p.name} width={40} height={40} className="rounded-full bg-muted border-2 border-background" />
                                        <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background", getLevelColor(p.level))} />
                                    </div>

                                    <div className={cn("min-w-0 w-full transition-opacity", p.isPaused && "opacity-50")}>
                                        <div className="flex items-center justify-between gap-1 w-full px-1">
                                            <p className="font-semibold text-sm truncate">
                                                {p.name}
                                            </p>
                                            {isHost && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTogglePause(p.id);
                                                    }}
                                                    className={cn(
                                                        "p-1 rounded-md transition-colors",
                                                        p.isPaused ? "text-red-500 hover:bg-red-500/10" : "text-muted-foreground hover:bg-white/10"
                                                    )}
                                                >
                                                    {p.isPaused ? <Icons.play className="w-3 h-3" /> : <Icons.pause className="w-3 h-3" />}
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            {p.isPaused ? (
                                                <Badge variant="secondary" className="h-5 px-1.5 text-[8px] bg-red-500/10 text-red-500 border-red-500/20 font-bold">พ้นพักชั่วคราว</Badge>
                                            ) : (
                                                <>
                                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-white/5 hover:bg-white/10 text-muted-foreground">
                                                        รอ {Math.floor((p.lastPlayedTime ? (Date.now() - p.lastPlayedTime) : 0) / 60000)} น.
                                                    </Badge>
                                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-primary/20 text-primary bg-primary/5">
                                                        W: {p.wins} | {p.roundsPlayed} เกม
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Finish Competition Section */}
                {isHost && (
                    <div className="mt-12 mb-20 px-4">
                        <GlassCard className="p-6 border-red-500/20 bg-red-500/5">
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="finish-competition"
                                        checked={isFinishConfirmed}
                                        onCheckedChange={setIsFinishConfirmed}
                                        className="data-[state=checked]:bg-red-500"
                                    />
                                    <Label htmlFor="finish-competition" className="text-sm font-bold text-white cursor-pointer select-none">
                                        ยืนยันว่าต้องการสิ้นสุดการแข่งขัน
                                    </Label>
                                </div>

                                {isFinishConfirmed && (
                                    <Button
                                        onClick={() => {
                                            // Handle Finish - Navigate to Ranking
                                            router.push(`/party/${id}/competition/ranking`);
                                        }}
                                        className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-red-500/20 animate-in zoom-in slide-in-from-top-4 duration-300"
                                    >
                                        <Icons.swords className="w-6 h-6 mr-2" />
                                        สิ้นสุดการแข่งขัน
                                    </Button>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>

            {/* Finish Match Dialog */}
            <Dialog open={!!finishMatchId} onOpenChange={(open) => !open && setFinishMatchId(null)}>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">บันทึกผลการแข่งขัน</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-6 py-6 items-center justify-items-center">
                        <div className="text-center space-y-2">
                            <Label className="uppercase text-xs font-bold text-muted-foreground tracking-wider">ทีม 1</Label>
                            <Input
                                type="number"
                                className="text-center text-3xl font-bold h-20 w-24 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                                placeholder="0"
                                value={score1}
                                onChange={e => setScore1(e.target.value)}
                            />
                        </div>
                        <div className="text-2xl font-black text-muted-foreground/30">VS</div>
                        <div className="text-center space-y-2">
                            <Label className="uppercase text-xs font-bold text-muted-foreground tracking-wider">ทีม 2</Label>
                            <Input
                                type="number"
                                className="text-center text-3xl font-bold h-20 w-24 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                                placeholder="0"
                                value={score2}
                                onChange={e => setScore2(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setFinishMatchId(null)} className="flex-1 h-12 rounded-xl text-muted-foreground border-white/10 hover:bg-white/5">
                            ยกเลิก
                        </Button>
                        <Button onClick={confirmFinishMatch} className="flex-1 bg-primary hover:bg-primary/90 h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20">
                            บันทึกผล
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Substitution Dialog */}
            <SubstitutionDialog
                substitutionData={substitutionData}
                setSubstitutionData={setSubstitutionData}
                queue={queue}
                handleSubstitute={handleSubstitute}
                handleUpdatePlayerInfo={handleUpdatePlayerInfo}
                getLevelColor={getLevelColor}
                isHost={isHost}
            />

            {/* Add Guest Dialog */}
            <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg">เพิ่มผู้เล่นคนนอก (Guest)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>ชื่อผู้เล่น</Label>
                            <Input
                                placeholder="ระบุชื่อ..."
                                value={guestName}
                                onChange={e => setGuestName(e.target.value)}
                                className="bg-white/5 border-white/10 h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ระดับฝีมือ</Label>
                            <div className="flex gap-2">
                                {['beginner', 'normal', 'pro'].map(lv => (
                                    <button
                                        key={lv}
                                        onClick={() => setGuestLevel(lv)}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl border text-xs font-bold transition-all capitalize",
                                            guestLevel === lv
                                                ? "bg-primary/20 border-primary text-primary"
                                                : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                        )}
                                    >
                                        {lv === 'beginner' ? 'มือใหม่' : lv === 'normal' ? 'ทั่วไป' : 'มือโปร'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button
                            onClick={handleAddGuest}
                            disabled={!guestName.trim()}
                            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold mt-2"
                        >
                            เพิ่มเข้าคิว
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Host Settings Dialog Component Insertion */}
            <HostSettingsDialog
                open={settingsOpen}
                setOpen={setSettingsOpen}
                courts={courts}
                updateCourtCount={updateCourtCount}
                matchmakingMode={matchmakingMode}
                setMatchmakingMode={setMatchmakingMode}
                rotationMode={rotationMode}
                setRotationMode={setRotationMode}
                handleAutoAssign={handleAutoAssign}
            />
        </AppShell>
    );
}

export default function ActiveCompetitionPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <LoadingShuttlecock />
            </div>
        }>
            <ActiveCompetitionContent />
        </Suspense>
    );
}

// --- Sub-components ---

function HostSettingsDialog({
    open,
    setOpen,
    courts,
    updateCourtCount,
    matchmakingMode,
    setMatchmakingMode,
    rotationMode,
    setRotationMode,
    handleAutoAssign
}: {
    open: boolean,
    setOpen: (o: boolean) => void,
    courts: any[],
    updateCourtCount: (n: number) => void,
    matchmakingMode: MatchmakingMode,
    setMatchmakingMode: (m: MatchmakingMode) => void,
    rotationMode: RotationMode,
    setRotationMode: (r: RotationMode) => void,
    handleAutoAssign: () => void
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md rounded-3xl bg-[#1a1b1e]/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden shadow-2xl">
                <div className="p-6 space-y-6">
                    <DialogHeader className="flex flex-row items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icons.settings className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white tracking-tight text-left">ตั้งค่า Matchmaking</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">ปรับแต่งสนามและรูปแบบการจัดคู่</DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="space-y-5">
                        {/* Court Management */}
                        <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Label className="text-sm font-bold flex items-center justify-between text-white">
                                จำนวนสนามที่เปิดใช้งาน
                                <Badge variant="secondary" className="bg-primary/20 text-primary border-0">{courts.length} สนาม</Badge>
                            </Label>
                            <div className="flex items-center gap-4 pt-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateCourtCount(courts.length - 1)}
                                    disabled={courts.length <= 1}
                                    className="h-11 w-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <Icons.minus className="w-5 h-5" />
                                </Button>
                                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden relative">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                                        style={{ width: `${(courts.length / 20) * 100}%` }}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateCourtCount(courts.length + 1)}
                                    disabled={courts.length >= 20}
                                    className="h-11 w-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <Icons.plus className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Rotation Mode */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-white px-1">ระบบการวนคน (Rotation)</Label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {[
                                    { id: 'out_4', title: 'ออก 4 (All Change)', desc: 'จบเกมออกหมดทั้ง 4 คน', icon: Icons.users },
                                    { id: 'out_2', title: 'ออก 2 (2-in-2-out)', desc: 'เล่น 2 เกมวน (ผู้ชนะอยู่ต่อเกมแรก)', icon: Icons.refresh },
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setRotationMode(mode.id as RotationMode)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all text-center",
                                            rotationMode === mode.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/5 bg-white/5 hover:bg-white/10"
                                        )}
                                    >
                                        <mode.icon className={cn("w-5 h-5", rotationMode === mode.id ? "text-primary" : "text-white/20")} />
                                        <div className="space-y-0.5">
                                            <p className={cn("font-bold text-[11px]", rotationMode === mode.id ? "text-primary" : "text-white/90")}>
                                                {mode.title}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Matchmaking Algorithm */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-white px-1">รูปแบบการจัดคู่ (Algorithm)</Label>
                            <div className="grid grid-cols-1 gap-2.5">
                                {[
                                    { id: 'random', title: 'สุ่มทั่วไป (Random)', desc: 'เน้นความเร็ว สุ่มทุกคนในคิวเท่าๆ กัน', icon: Icons.shuffle },
                                    { id: 'split_level', title: 'แยกตามมือ (Split Level)', desc: 'จัดคนเก่งไว้สนามหน้า แยกมือเบาไวสนามหลัง', icon: Icons.mapPin },
                                    { id: 'balanced_mix', title: 'คละมือสมดุล (Mixed Levels)', desc: 'จับคู่มือโปรคู่มือใหม่ ทีมสูสี ตีสนุกขึ้น', icon: Icons.users }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setMatchmakingMode(mode.id as MatchmakingMode)}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                                            matchmakingMode === mode.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                            matchmakingMode === mode.id ? "border-primary" : "border-muted-foreground group-hover:border-white/20"
                                        )}>
                                            {matchmakingMode === mode.id && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-in zoom-in duration-300" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn("font-bold text-sm mb-0.5 transition-colors", matchmakingMode === mode.id ? "text-primary" : "text-white/90")}>
                                                {mode.title}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">{mode.desc}</p>
                                        </div>
                                        <mode.icon className={cn("w-5 h-5 mt-1 transition-colors", matchmakingMode === mode.id ? "text-primary" : "text-white/20")} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <Button
                            onClick={() => {
                                handleAutoAssign();
                                setOpen(false);
                            }}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            ยืนยันและจัดทีมใหม่ทันที
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="w-full text-muted-foreground hover:text-white hover:bg-white/5 h-11 rounded-xl"
                        >
                            กลับไปหน้าสนาม
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Sub-component for better organization
function SubstitutionDialog({ substitutionData, setSubstitutionData, queue, handleSubstitute, handleUpdatePlayerInfo, getLevelColor, isHost }: any) {
    const [editName, setEditName] = useState("");
    const [editLevel, setEditLevel] = useState("");

    useEffect(() => {
        if (substitutionData) {
            setEditName(substitutionData.player.name);
            setEditLevel(substitutionData.player.level);
        }
    }, [substitutionData]);

    const levels = [
        { id: 'beginner', label: 'มือใหม่', color: 'bg-green-500' },
        { id: 'normal', label: 'ทั่วไป', color: 'bg-orange-500' },
        { id: 'pro', label: 'มือโปร', color: 'bg-red-500' },
    ];

    if (!substitutionData) return null;

    return (
        <Dialog open={!!substitutionData} onOpenChange={(open) => !open && setSubstitutionData(null)}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg">{isHost ? "จัดการผู้เล่น" : "ข้อมูลผู้เล่น"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Quick Edit Section */}
                    <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex flex-col gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground ml-1">ชื่อผู้เล่น</Label>
                                <Input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    readOnly={!isHost}
                                    className="bg-background/50 border-white/5 h-10 rounded-xl font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground ml-1">ระดับฝีมือ</Label>
                                <div className="flex gap-2">
                                    {levels.map(l => (
                                        <button
                                            key={l.id}
                                            disabled={!isHost}
                                            onClick={() => setEditLevel(l.id)}
                                            className={cn(
                                                "flex-1 py-2 rounded-xl border text-[10px] font-bold transition-all",
                                                editLevel === l.id
                                                    ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                                                    : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10",
                                                !isHost && "cursor-default opacity-80"
                                            )}
                                        >
                                            <div className={cn("w-1.5 h-1.5 rounded-full mx-auto mb-1", l.color)} />
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {isHost && (
                                <Button
                                    onClick={() => {
                                        handleUpdatePlayerInfo(substitutionData.player.id, editName, editLevel);
                                        setSubstitutionData(null);
                                    }}
                                    className="w-full mt-2 h-10 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 font-bold"
                                >
                                    บันทึกการแก้ไข
                                </Button>
                            )}
                        </div>
                    </div>

                    {isHost && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-tighter">
                                    <span className="bg-background px-2 text-muted-foreground font-bold">สลับตัวกับผู้เล่นอื่นในคิว</span>
                                </div>
                            </div>

                            {/* Substitution List */}
                            <div className="space-y-2">
                                {queue.filter((q: any) => q.id !== substitutionData.player.id).map((qPlayer: any) => (
                                    <button
                                        key={qPlayer.id}
                                        onClick={() => handleSubstitute(qPlayer)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Image src={qPlayer.avatar_url || "/placeholder.svg"} alt="" width={36} height={36} className="rounded-full bg-muted object-cover" />
                                                <div className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#1a1b1e]", getLevelColor(qPlayer.level))} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm group-hover:text-primary transition-colors">{qPlayer.name}</span>
                                                <span className="text-[10px] text-muted-foreground">ลงเล่นไป {qPlayer.roundsPlayed} รอบ</span>
                                            </div>
                                        </div>
                                        <Icons.refresh className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all rotate-0 group-hover:rotate-180" />
                                    </button>
                                ))}
                                {queue.length <= 1 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm italic">
                                        ไม่มีผู้เล่นอื่นในคิวให้สลับ
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
