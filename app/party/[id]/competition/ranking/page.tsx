"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";

type Player = {
    id: string;
    name: string;
    avatar_url: string | null;
    level: string;
    roundsPlayed: number;
    wins: number;
};

export default function CompetitionRankingPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [players, setPlayers] = useState<Player[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchRanking = async () => {
            setIsLoading(true);
            setError(null);

            const supabase = createClient();
            if (!supabase) {
                setError("Supabase client failed");
                setIsLoading(false);
                return;
            }

            try {
                // 1. Fetch Party & Current User (to check host status)
                const { data: { user } } = await supabase.auth.getUser();
                const { data: party } = await supabase.from('parties').select('host_id').eq('id', id).single();

                if (party && user) {
                    setIsHost(party.host_id === user.id);
                }

                // 2. Fetch Party Members
                const { data: members, error: memError } = await supabase
                    .from('party_members')
                    .select(`
                        id,
                        skill_level,
                        guest_name,
                        user:profiles!user_id(id, display_name, first_name, avatar_url, skill_level)
                    `)
                    .eq('party_id', id);

                if (memError) {
                    console.error("Member fetch error:", memError);
                    setError("ดึงข้อมูลสมาชิกไม่สำเร็จ: " + memError.message);
                    setIsLoading(false);
                    return;
                }

                if (!members || members.length === 0) {
                    setError("ไม่พบสมาชิกในก๊วนนี้");
                    setIsLoading(false);
                    return;
                }

                // 3. Fetch recent room state
                const { data: rooms } = await supabase
                    .from('competition_rooms')
                    .select('*')
                    .eq('party_id', id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                const latestRoom = rooms?.[0];

                const mappedPlayers: Player[] = members.map((m: any) => {
                    let totalRounds = 0;
                    let totalWins = 0;

                    if (latestRoom && latestRoom.state) {
                        const state = latestRoom.state;

                        const inQueue = state.queue?.find((p: any) => p.id === m.id);
                        if (inQueue) {
                            totalRounds = Math.max(totalRounds, inQueue.roundsPlayed || 0);
                            totalWins = Math.max(totalWins, inQueue.wins || 0);
                        }

                        if (state.courts) {
                            state.courts.forEach((c: any) => {
                                if (c.currentMatch) {
                                    const inMatch = [...c.currentMatch.team1, ...c.currentMatch.team2].find((p: any) => p.id === m.id);
                                    if (inMatch) {
                                        totalRounds = Math.max(totalRounds, inMatch.roundsPlayed || 0);
                                        totalWins = Math.max(totalWins, inMatch.wins || 0);
                                    }
                                }
                            });
                        }
                    }

                    return {
                        id: m.id,
                        name: m.user ? (m.user.display_name || m.user.first_name) : (m.guest_name || "Guest"),
                        avatar_url: m.user?.avatar_url || null,
                        level: m.skill_level || m.user?.skill_level || "beginner",
                        roundsPlayed: totalRounds,
                        wins: totalWins
                    };
                });

                const sorted = mappedPlayers.sort((a, b) => {
                    if (b.wins !== a.wins) return b.wins - a.wins;
                    return b.roundsPlayed - a.roundsPlayed;
                });

                setPlayers(sorted);
            } catch (err: any) {
                console.error("Ranking fetch caught error:", err);
                setError("เกิดข้อผิดพลาดไม่คาดคิด: " + err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRanking();
    }, [id]);

    const handleFinishCompetition = async () => {
        if (!confirm("คุณต้องการสิ้นสุดการแข่งขันนี้ใช่หรือไม่? ข้อมูลการจัดทีมในสนามจะถูกรีเซ็ต")) return;

        setIsFinishing(true);
        const supabase = createClient();
        if (!supabase) return;

        try {
            // Update all active competition rooms to finished
            await supabase
                .from('competition_rooms')
                .update({ status: 'finished' })
                .eq('party_id', id)
                .eq('status', 'active');

            router.push(`/party/${id}`);
        } catch (err) {
            console.error("Error finishing competition:", err);
            alert("ไม่สามารถสิ้นสุดการแข่งขันได้");
        } finally {
            setIsFinishing(false);
        }
    };

    const handleGoToBill = () => {
        // Use all players from the list
        const allPlayerNames = players.map(p => p.name);

        const query = new URLSearchParams({
            players: allPlayerNames.join(','),
            fromParty: id
        });
        router.push(`/tools/cost-calculator?${query.toString()}`);
    };

    const getLevelColor = (level: string) => {
        const l = level?.toLowerCase() || '';
        if (l === 'heavy' || l === 'strong' || l === 'pro') return 'bg-red-500';
        if (l === 'medium' || l === 'normal' || l === 'intermediate') return 'bg-orange-500';
        return 'bg-green-500';
    };

    if (isLoading) {
        return (
            <AppShell hideNav>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <LoadingShuttlecock />
                    <p className="text-white/40 text-sm animate-pulse">กำลังประมวลผลอันดับ...</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell hideNav>
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 safe-area-top">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 tap-highlight">
                            <Icons.chevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <h1 className="font-bold text-lg text-white">อันดับการแข่งขัน</h1>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6 pb-48">
                <div className="text-center py-6 space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-bounce">
                        <Icons.swords className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Hall of Fame</h2>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-60">สรุปคะแนนผู้ชนะ</p>
                </div>

                {error && (
                    <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 text-red-500 text-center space-y-4">
                        <Icons.alertCircle className="w-12 h-12 mx-auto opacity-50" />
                        <p className="text-sm font-medium">{error}</p>
                        <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                            ลองใหม่อีกครั้ง
                        </Button>
                    </div>
                )}

                {players.length > 0 && (
                    <>
                        <div className="flex items-end justify-center gap-4 py-8 px-2">
                            {players.length >= 2 && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="relative">
                                        <Image src={players[1].avatar_url || "/placeholder.svg"} alt="" width={60} height={60} className="rounded-full border-4 border-[#C0C0C0] shadow-lg" />
                                        <div className="absolute -top-2 -right-2 bg-[#C0C0C0] text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">2</div>
                                    </div>
                                    <span className="font-bold text-xs text-white/80 truncate w-16 text-center">{players[1].name}</span>
                                    <div className="h-20 w-16 bg-white/5 rounded-t-xl flex flex-col items-center justify-center border-x border-t border-white/10">
                                        <span className="font-black text-white text-lg">{players[1].wins}</span>
                                        <span className="text-[8px] text-muted-foreground uppercase font-black">Wins</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-2">
                                <div className="relative mb-2">
                                    <Icons.gift className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500 animate-pulse" />
                                    <Image src={players[0].avatar_url || "/placeholder.svg"} alt="" width={80} height={80} className="rounded-full border-4 border-yellow-500 shadow-xl shadow-yellow-500/20" />
                                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-black w-8 h-8 rounded-full flex items-center justify-center">1</div>
                                </div>
                                <span className="font-black text-sm text-primary truncate w-24 text-center">{players[0].name}</span>
                                <div className="h-28 w-20 bg-primary/10 rounded-t-xl flex flex-col items-center justify-center border-x border-t border-primary/20">
                                    <span className="font-black text-3xl text-primary">{players[0].wins}</span>
                                    <span className="text-[10px] text-primary/60 uppercase font-black">Champion</span>
                                </div>
                            </div>

                            {players.length >= 3 && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="relative">
                                        <Image src={players[2].avatar_url || "/placeholder.svg"} alt="" width={60} height={60} className="rounded-full border-4 border-[#CD7F32] shadow-lg" />
                                        <div className="absolute -top-2 -right-2 bg-[#CD7F32] text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">3</div>
                                    </div>
                                    <span className="font-bold text-xs text-white/80 truncate w-16 text-center">{players[2].name}</span>
                                    <div className="h-16 w-16 bg-white/5 rounded-t-xl flex flex-col items-center justify-center border-x border-t border-white/10">
                                        <span className="font-black text-white text-lg">{players[2].wins}</span>
                                        <span className="text-[8px] text-muted-foreground uppercase font-black">Wins</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {players.map((p, i) => (
                                <GlassCard key={p.id} className={cn(
                                    "p-4 flex items-center justify-between border-white/5",
                                    i === 0 ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5" : "bg-white/5"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 text-center font-black text-muted-foreground italic text-lg pr-1">
                                            {i + 1}
                                        </div>
                                        <div className="relative">
                                            <Image src={p.avatar_url || "/placeholder.svg"} alt="" width={48} height={48} className="rounded-full bg-muted shadow-inner" />
                                            <div className={cn("absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#1a1b1e]", getLevelColor(p.level))} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn("font-bold text-base", i === 0 ? "text-primary" : "text-white")}>
                                                {p.name}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">
                                                เล่นรวม {p.roundsPlayed} รอบ
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-white tracking-tighter">{p.wins}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">WINS</span>
                                        </div>
                                        <div className="text-[10px] font-black text-primary/60 px-1.5 py-0.5 rounded-full bg-primary/5 border border-primary/10 mt-1">
                                            WR: {p.roundsPlayed > 0 ? Math.round((p.wins / p.roundsPlayed) * 100) : 0}%
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Panel */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-white/5 z-50 safe-area-bottom">
                <div className="flex flex-col gap-3">
                    {isHost && (
                        <div className="flex gap-3">
                            <Button
                                onClick={handleGoToBill}
                                className="flex-1 h-14 bg-primary text-black font-black uppercase italic tracking-tighter rounded-2xl shadow-xl shadow-primary/10 transition-all active:scale-[0.98]"
                            >
                                <Icons.coins className="w-5 h-5 mr-2" />
                                คิดเงิน (Settlement)
                            </Button>
                            <Button
                                onClick={handleFinishCompetition}
                                disabled={isFinishing}
                                className="flex-1 h-14 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase italic tracking-tighter rounded-2xl transition-all active:scale-[0.98]"
                            >
                                {isFinishing ? (
                                    <Icons.spinner className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Icons.power className="w-5 h-5 mr-2" />
                                        จบก๊วน
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                    <Button
                        onClick={() => router.push(`/party/${id}`)}
                        variant="ghost"
                        className="w-full h-10 text-white/40 hover:text-white font-bold rounded-xl"
                    >
                        กลับไปหน้าก๊วน
                    </Button>
                </div>
            </div>
        </AppShell>
    );
}
