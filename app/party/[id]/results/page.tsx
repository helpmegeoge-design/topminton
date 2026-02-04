"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Player {
    id: string;
    display_name: string;
    avatar_url: string;
}

interface Match {
    id: string;
    match_number: number;
    room_name: string;
    teamA: Player[];
    teamB: Player[];
    scoreA: number;
    scoreB: number;
    status: "pending" | "in_progress" | "completed";
    winner_team: string | null;
}

export default function PartyResultsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: partyId } = use(params);
    const router = useRouter();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [playerStats, setPlayerStats] = useState<any[]>([]);
    const [partyTitle, setPartyTitle] = useState("");

    const fetchData = async () => {
        const supabase = createClient();
        if (!supabase) return;

        // 1. Fetch Party Title
        const { data: party } = await supabase
            .from("parties")
            .select("title")
            .eq("id", partyId)
            .single();
        if (party) setPartyTitle(party.title);

        // 2. Fetch Match Rooms and Pairings
        const { data: rooms, error } = await supabase
            .from("match_rooms")
            .select(`
        id,
        name,
        pairings:match_pairings(
          id,
          match_number,
          team_a_score,
          team_b_score,
          status,
          winner_team,
          team_a_player1:profiles!match_pairings_team_a_player1_id_fkey(id, display_name, avatar_url),
          team_a_player2:profiles!match_pairings_team_a_player2_id_fkey(id, display_name, avatar_url),
          team_b_player1:profiles!match_pairings_team_b_player1_id_fkey(id, display_name, avatar_url),
          team_b_player2:profiles!match_pairings_team_b_player2_id_fkey(id, display_name, avatar_url)
        )
      `)
            .eq("party_id", partyId);

        if (error) {
            console.error("Error fetching results:", error);
            setLoading(false);
            return;
        }

        const allMatches: Match[] = [];
        const statsMap: Record<string, { id: string, name: string, avatar: string, matches: number, wins: number }> = {};

        rooms?.forEach(room => {
            room.pairings?.forEach((p: any) => {
                const teamA = [p.team_a_player1, p.team_a_player2].filter(Boolean);
                const teamB = [p.team_b_player1, p.team_b_player2].filter(Boolean);

                allMatches.push({
                    id: p.id,
                    match_number: p.match_number,
                    room_name: room.name,
                    teamA,
                    teamB,
                    scoreA: p.team_a_score || 0,
                    scoreB: p.team_b_score || 0,
                    status: p.status,
                    winner_team: p.winner_team
                });

                // Update Stats if completed
                if (p.status === 'completed') {
                    const processPlayer = (player: any, isWinner: boolean) => {
                        if (!player) return;
                        if (!statsMap[player.id]) {
                            statsMap[player.id] = { id: player.id, name: player.display_name, avatar: player.avatar_url, matches: 0, wins: 0 };
                        }
                        statsMap[player.id].matches += 1;
                        if (isWinner) statsMap[player.id].wins += 1;
                    };

                    const winner = p.winner_team;
                    teamA.forEach(player => processPlayer(player, winner === 'A'));
                    teamB.forEach(player => processPlayer(player, winner === 'B'));
                }
            });
        });

        setMatches(allMatches.sort((a, b) => b.match_number - a.match_number));
        setPlayerStats(Object.values(statsMap).sort((a, b) => b.wins - a.wins || b.matches - a.matches));
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [partyId]);

    if (loading) {
        return (
            <AppShell hideNav>
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingShuttlecock />
                </div>
            </AppShell>
        );
    }

    const completedMatches = matches.filter(m => m.status === 'completed');
    const playingMatches = matches.filter(m => m.status === 'in_progress');

    return (
        <AppShell hideNav>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="flex items-center justify-between px-4 h-14">
                    <button onClick={() => router.back()} className="p-2 -ml-2 tap-highlight">
                        <Icons.chevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="font-semibold text-lg">ผลการจับคู่</h1>
                    <button className="p-2 -mr-2 tap-highlight">
                        <Icons.share className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-4 pb-24 space-y-4">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-primary">{partyTitle}</h2>
                    <p className="text-sm text-muted-foreground">สรุปผลการแข่งขันและอันดับผู้เล่น</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <GlassCard className="p-3 text-center">
                        <p className="text-2xl font-bold text-primary">{matches.length}</p>
                        <p className="text-xs text-muted-foreground">เกมทั้งหมด</p>
                    </GlassCard>
                    <GlassCard className="p-3 text-center">
                        <p className="text-2xl font-bold text-[#31A24C]">{completedMatches.length}</p>
                        <p className="text-xs text-muted-foreground">เสร็จสิ้น</p>
                    </GlassCard>
                    <GlassCard className="p-3 text-center">
                        <p className="text-2xl font-bold text-[#F7B928]">{playingMatches.length}</p>
                        <p className="text-xs text-muted-foreground">กำลังเล่น</p>
                    </GlassCard>
                </div>

                {/* Current Match */}
                {playingMatches.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#31A24C] animate-pulse" />
                            กำลังแข่ง
                        </h3>
                        {playingMatches.map((match) => (
                            <GlassCard key={match.id} className="p-4 ring-2 ring-[#31A24C] mb-3">
                                <div className="flex items-center justify-between mb-3">
                                    <Badge variant="outline">{match.room_name}</Badge>
                                    <Badge className="bg-[#31A24C]">แมตช์ที่ {match.match_number}</Badge>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 text-center">
                                        <div className="flex justify-center -space-x-2 mb-2">
                                            {match.teamA.map((p) => (
                                                <div key={p.id} className="relative w-10 h-10 ring-2 ring-background rounded-full overflow-hidden">
                                                    <Image src={p.avatar_url || "/placeholder.svg"} alt={p.display_name} fill className="object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-sm font-medium">{match.teamA.map(p => p.display_name).join(" &")}</p>
                                    </div>
                                    <div className="text-xl font-bold text-muted-foreground">VS</div>
                                    <div className="flex-1 text-center">
                                        <div className="flex justify-center -space-x-2 mb-2">
                                            {match.teamB.map((p) => (
                                                <div key={p.id} className="relative w-10 h-10 ring-2 ring-background rounded-full overflow-hidden">
                                                    <Image src={p.avatar_url || "/placeholder.svg"} alt={p.display_name} fill className="object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-sm font-medium">{match.teamB.map(p => p.display_name).join(" &")}</p>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-3xl font-black text-primary">{match.scoreA} - {match.scoreB}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}

                {/* Leaderboard */}
                {playerStats.length > 0 && (
                    <GlassCard className="p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Icons.trophy className="w-5 h-5 text-[#F7B928]" />
                            อันดับผู้เล่น (Most Wins)
                        </h3>
                        <div className="space-y-2">
                            {playerStats.map((player, index) => (
                                <div key={player.id} className="flex items-center gap-3 p-2 rounded-xl bg-muted/30">
                                    <span className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                        index === 0 && "bg-[#F7B928] text-white",
                                        index === 1 && "bg-[#C0C0C0] text-white",
                                        index === 2 && "bg-[#CD7F32] text-white",
                                        index > 2 && "bg-muted text-muted-foreground"
                                    )}>
                                        {index + 1}
                                    </span>
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
                                        <Image src={player.avatar || "/placeholder.svg"} alt={player.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{player.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-[#31A24C]">{player.wins} ชนะ</p>
                                        <p className="text-xs text-muted-foreground">{player.matches} เกม</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}

                {/* Recent Matches */}
                {completedMatches.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-3">ประวัติการแข่ง</h3>
                        <div className="space-y-3">
                            {completedMatches.map((match) => (
                                <GlassCard key={match.id} className="p-4">
                                    <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                                        <span>{match.room_name}</span>
                                        <span>แมตช์ที่ {match.match_number}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("flex-1 text-center p-2 rounded-xl", match.winner_team === 'A' && "bg-[#31A24C]/10")}>
                                            <p className="text-xs mb-1 truncate">{match.teamA.map(p => p.display_name).join(" &")}</p>
                                            <p className={cn("text-2xl font-bold", match.winner_team === 'A' ? "text-[#31A24C]" : "text-muted-foreground")}>
                                                {match.scoreA}
                                            </p>
                                        </div>
                                        <div className="text-xs font-medium text-muted-foreground">VS</div>
                                        <div className={cn("flex-1 text-center p-2 rounded-xl", match.winner_team === 'B' && "bg-[#31A24C]/10")}>
                                            <p className="text-xs mb-1 truncate">{match.teamB.map(p => p.display_name).join(" &")}</p>
                                            <p className={cn("text-2xl font-bold", match.winner_team === 'B' ? "text-[#31A24C]" : "text-muted-foreground")}>
                                                {match.scoreB}
                                            </p>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}

                {matches.length === 0 && (
                    <div className="text-center py-20">
                        <Icons.trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">ยังไม่มีข้อมูลการจับคู่แข่งขัน</p>
                        <p className="text-xs text-muted-foreground mt-1">เริ่มจับคู่ในหน้า ห้องจับคู่ เพื่อดูผลที่นี่</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
