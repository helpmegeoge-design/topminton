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

    useEffect(() => {
        const fetchRanking = async () => {
            const supabase = createClient();
            if (!supabase) return;

            // 1. Fetch Party Members first to have a baseline of everyone in the group
            const { data: members } = await supabase
                .from('party_members')
                .select(`
                    id,
                    skill_level,
                    guest_name,
                    user:profiles!user_id(id, display_name, first_name, avatar_url, skill_level)
                `)
                .eq('party_id', id);

            // 2. Fetch the latest room state (regardless of active status)
            const { data: rooms } = await supabase
                .from('competition_rooms')
                .select('*')
                .eq('party_id', id)
                .order('created_at', { ascending: false })
                .limit(1);

            const latestRoom = rooms?.[0];

            if (members) {
                const mappedPlayers: Player[] = members.map((m: any) => {
                    let roundsPlayed = 0;
                    let wins = 0;

                    // Try to find this player's stats in the latest room state
                    if (latestRoom && latestRoom.state) {
                        const state = latestRoom.state;
                        let foundPlayer = state.queue?.find((p: any) => p.id === m.id);

                        // Also check currently playing courts
                        if (!foundPlayer && state.courts) {
                            state.courts.forEach((c: any) => {
                                if (c.currentMatch) {
                                    const p = [...c.currentMatch.team1, ...c.currentMatch.team2].find((p: any) => p.id === m.id);
                                    if (p) foundPlayer = p;
                                }
                            });
                        }

                        if (foundPlayer) {
                            roundsPlayed = foundPlayer.roundsPlayed || 0;
                            wins = foundPlayer.wins || 0;
                        }
                    }

                    return {
                        id: m.id,
                        name: m.user ? (m.user.display_name || m.user.first_name) : (m.guest_name || "Guest"),
                        avatar_url: m.user?.avatar_url || null,
                        level: m.skill_level || m.user?.skill_level || "beginner",
                        roundsPlayed,
                        wins
                    };
                });

                // Sort by wins (desc) then by roundsPlayed (desc)
                const sorted = mappedPlayers.sort((a, b) => {
                    if (b.wins !== a.wins) return b.wins - a.wins;
                    return b.roundsPlayed - a.roundsPlayed;
                });

                setPlayers(sorted);
            }
            setIsLoading(false);
        };

        if (id) fetchRanking();
    }, [id]);

    const getLevelColor = (level: string) => {
        const l = level?.toLowerCase() || '';
        if (l === 'heavy' || l === 'strong' || l === 'pro') return 'bg-red-500';
        if (l === 'medium' || l === 'normal' || l === 'intermediate') return 'bg-orange-500';
        return 'bg-green-500';
    };

    if (isLoading) {
        return (
            <AppShell hideNav>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <LoadingShuttlecock />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell hideNav>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 safe-area-top">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 tap-highlight">
                            <Icons.chevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <h1 className="font-bold text-lg text-white">อันดับการแข่งขัน</h1>
                    </div>
                    <Icons.gift className="w-5 h-5 text-primary" />
                </div>
            </div>

            <div className="p-4 space-y-6 pb-32">
                {/* Hero section */}
                <div className="text-center py-6 space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-bounce">
                        <Icons.swords className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Hall of Fame</h2>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-60">สรุปคะแนนผู้ชนะ</p>
                </div>

                {/* Top 3 Podium (Optional but cool) */}
                {players.length >= 3 && (
                    <div className="flex items-end justify-center gap-4 py-8 px-2">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                                <Image src={players[1].avatar_url || "/placeholder.svg"} alt="" width={60} height={60} className="rounded-full border-4 border-[#C0C0C0] shadow-lg" />
                                <div className="absolute -top-2 -right-2 bg-[#C0C0C0] text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">2</div>
                            </div>
                            <span className="font-bold text-xs text-white/80 truncate w-16 text-center">{players[1].name}</span>
                            <div className="h-20 w-16 bg-white/5 rounded-t-xl flex flex-col items-center justify-center border-x border-t border-white/10">
                                <span className="font-black text-white">{players[1].wins}</span>
                                <span className="text-[8px] text-muted-foreground uppercase">Wins</span>
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative mb-2">
                                <Icons.gift className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500 animate-pulse" />
                                <Image src={players[0].avatar_url || "/placeholder.svg"} alt="" width={80} height={80} className="rounded-full border-4 border-yellow-500 shadow-xl shadow-yellow-500/20" />
                                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-black w-8 h-8 rounded-full flex items-center justify-center">1</div>
                            </div>
                            <span className="font-black text-sm text-primary truncate w-24 text-center">{players[0].name}</span>
                            <div className="h-28 w-20 bg-primary/10 rounded-t-xl flex flex-col items-center justify-center border-x border-t border-primary/20">
                                <span className="font-black text-2xl text-primary">{players[0].wins}</span>
                                <span className="text-[10px] text-primary/60 uppercase font-black">Champion</span>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                                <Image src={players[2].avatar_url || "/placeholder.svg"} alt="" width={60} height={60} className="rounded-full border-4 border-[#CD7F32] shadow-lg" />
                                <div className="absolute -top-2 -right-2 bg-[#CD7F32] text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">3</div>
                            </div>
                            <span className="font-bold text-xs text-white/80 truncate w-16 text-center">{players[2].name}</span>
                            <div className="h-16 w-16 bg-white/5 rounded-t-xl flex flex-col items-center justify-center border-x border-t border-white/10">
                                <span className="font-black text-white">{players[2].wins}</span>
                                <span className="text-[8px] text-muted-foreground uppercase">Wins</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Full Ranking List */}
                <div className="space-y-2.5">
                    {players.map((p, i) => (
                        <GlassCard key={p.id} className={cn(
                            "p-3 flex items-center justify-between border-white/5",
                            i === 0 ? "bg-primary/5 border-primary/20" : ""
                        )}>
                            <div className="flex items-center gap-4">
                                <div className="w-6 text-center font-black text-muted-foreground italic">
                                    {i + 1}
                                </div>
                                <div className="relative">
                                    <Image src={p.avatar_url || "/placeholder.svg"} alt="" width={44} height={44} className="rounded-full bg-muted shadow-inner" />
                                    <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1a1b1e]", getLevelColor(p.level))} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("font-bold text-sm", i === 0 ? "text-primary" : "text-white")}>
                                        {p.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground italic uppercase">
                                        เล่นไป {p.roundsPlayed} รอบ
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-white tracking-tighter">{p.wins}</span>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">WINS</span>
                                </div>
                                <div className="text-[8px] text-muted-foreground font-bold opacity-50">
                                    WR: {p.roundsPlayed > 0 ? Math.round((p.wins / p.roundsPlayed) * 100) : 0}%
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-white/5 z-50 safe-area-bottom">
                <Button
                    onClick={() => router.push(`/party/${id}`)}
                    className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl"
                >
                    กลับไปหน้าก๊วน
                </Button>
            </div>
        </AppShell>
    );
}
