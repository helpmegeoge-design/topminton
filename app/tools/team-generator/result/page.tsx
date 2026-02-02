"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  avatar: string;
}

interface Match {
  id: string;
  round: number;
  court: number;
  teamA: Player[];
  teamB: Player[];
  scoreA?: number;
  scoreB?: number;
  status: "pending" | "playing" | "completed";
}

const mockPlayers: Player[] = [
  { id: "1", name: "สมชาย", avatar: "/images/avatars/avatar-1.jpg" },
  { id: "2", name: "วิชัย", avatar: "/images/avatars/avatar-2.jpg" },
  { id: "3", name: "สุภาพ", avatar: "/images/avatars/avatar-3.jpg" },
  { id: "4", name: "ปรีชา", avatar: "/images/avatars/avatar-4.jpg" },
  { id: "5", name: "อารี", avatar: "/images/avatars/avatar-1.jpg" },
  { id: "6", name: "นิดา", avatar: "/images/avatars/avatar-2.jpg" },
  { id: "7", name: "กิม", avatar: "/images/avatars/avatar-3.jpg" },
  { id: "8", name: "นัท", avatar: "/images/avatars/avatar-4.jpg" },
];

const generateMatches = (): Match[] => {
  return [
    {
      id: "1",
      round: 1,
      court: 1,
      teamA: [mockPlayers[0], mockPlayers[1]],
      teamB: [mockPlayers[2], mockPlayers[3]],
      scoreA: 21,
      scoreB: 18,
      status: "completed",
    },
    {
      id: "2",
      round: 1,
      court: 2,
      teamA: [mockPlayers[4], mockPlayers[5]],
      teamB: [mockPlayers[6], mockPlayers[7]],
      scoreA: 15,
      scoreB: 21,
      status: "completed",
    },
    {
      id: "3",
      round: 2,
      court: 1,
      teamA: [mockPlayers[0], mockPlayers[2]],
      teamB: [mockPlayers[4], mockPlayers[6]],
      status: "playing",
    },
    {
      id: "4",
      round: 2,
      court: 2,
      teamA: [mockPlayers[1], mockPlayers[3]],
      teamB: [mockPlayers[5], mockPlayers[7]],
      status: "pending",
    },
  ];
};

export default function TeamGeneratorResultPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [showCutscene, setShowCutscene] = useState(false);
  const [cutsceneMatch, setCutsceneMatch] = useState<Match | null>(null);
  const [cutscenePhase, setCutscenePhase] = useState<"vs" | "result">("vs");

  useEffect(() => {
    setMatches(generateMatches());
  }, []);

  const openCutscene = (match: Match) => {
    setCutsceneMatch(match);
    setCutscenePhase("vs");
    setShowCutscene(true);

    // Auto transition to result after 2 seconds
    setTimeout(() => {
      setCutscenePhase("result");
    }, 2000);
  };

  const completedMatches = matches.filter((m) => m.status === "completed");
  const playingMatches = matches.filter((m) => m.status === "playing");
  const pendingMatches = matches.filter((m) => m.status === "pending");

  // Calculate stats
  const playerStats = mockPlayers.map((player) => {
    const playerMatches = completedMatches.filter(
      (m) =>
        m.teamA.some((p) => p.id === player.id) ||
        m.teamB.some((p) => p.id === player.id)
    );
    const wins = playerMatches.filter((m) => {
      const isTeamA = m.teamA.some((p) => p.id === player.id);
      return isTeamA ? (m.scoreA || 0) > (m.scoreB || 0) : (m.scoreB || 0) > (m.scoreA || 0);
    }).length;
    return { ...player, matches: playerMatches.length, wins };
  });

  return (
    <AppShell hideNav>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/tools/team-generator" className="p-2 -ml-2 tap-highlight">
            <Icons.chevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-semibold text-lg">ผลการจับคู่</h1>
          <button className="p-2 -mr-2 tap-highlight">
            <Icons.share className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-4">
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
              กำลังเล่น
            </h3>
            {playingMatches.map((match) => (
              <GlassCard
                key={match.id}
                className="p-4 ring-2 ring-[#31A24C] cursor-pointer tap-highlight"
                onClick={() => openCutscene(match)}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">รอบ {match.round}</Badge>
                  <Badge className="bg-[#31A24C]">คอร์ท {match.court}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  {/* Team A */}
                  <div className="flex-1 text-center">
                    <div className="flex justify-center -space-x-2 mb-2">
                      {match.teamA.map((p) => (
                        <Image
                          key={p.id}
                          src={p.avatar || "/placeholder.svg"}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-background"
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium">
                      {match.teamA.map((p) => p.name).join(" & ")}
                    </p>
                  </div>

                  <div className="text-xl font-bold text-muted-foreground">VS</div>

                  {/* Team B */}
                  <div className="flex-1 text-center">
                    <div className="flex justify-center -space-x-2 mb-2">
                      {match.teamB.map((p) => (
                        <Image
                          key={p.id}
                          src={p.avatar || "/placeholder.svg"}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-background"
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium">
                      {match.teamB.map((p) => p.name).join(" & ")}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Completed Matches */}
        {completedMatches.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">เกมที่เสร็จแล้ว</h3>
            <div className="space-y-3">
              {completedMatches.map((match) => (
                <GlassCard
                  key={match.id}
                  className="p-4 cursor-pointer tap-highlight"
                  onClick={() => openCutscene(match)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">รอบ {match.round}</Badge>
                    <span className="text-xs text-muted-foreground">คอร์ท {match.court}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Team A */}
                    <div className={cn(
                      "flex-1 text-center p-2 rounded-xl",
                      (match.scoreA || 0) > (match.scoreB || 0) && "bg-[#31A24C]/10"
                    )}>
                      <div className="flex justify-center -space-x-2 mb-2">
                        {match.teamA.map((p) => (
                          <Image
                            key={p.id}
                            src={p.avatar || "/placeholder.svg"}
                            alt={p.name}
                            width={32}
                            height={32}
                            className="rounded-full ring-2 ring-background"
                          />
                        ))}
                      </div>
                      <p className="text-xs">{match.teamA.map((p) => p.name).join(" & ")}</p>
                      <p className={cn(
                        "text-2xl font-bold mt-1",
                        (match.scoreA || 0) > (match.scoreB || 0) ? "text-[#31A24C]" : "text-muted-foreground"
                      )}>
                        {match.scoreA}
                      </p>
                    </div>

                    <div className="text-sm font-medium text-muted-foreground">-</div>

                    {/* Team B */}
                    <div className={cn(
                      "flex-1 text-center p-2 rounded-xl",
                      (match.scoreB || 0) > (match.scoreA || 0) && "bg-[#31A24C]/10"
                    )}>
                      <div className="flex justify-center -space-x-2 mb-2">
                        {match.teamB.map((p) => (
                          <Image
                            key={p.id}
                            src={p.avatar || "/placeholder.svg"}
                            alt={p.name}
                            width={32}
                            height={32}
                            className="rounded-full ring-2 ring-background"
                          />
                        ))}
                      </div>
                      <p className="text-xs">{match.teamB.map((p) => p.name).join(" & ")}</p>
                      <p className={cn(
                        "text-2xl font-bold mt-1",
                        (match.scoreB || 0) > (match.scoreA || 0) ? "text-[#31A24C]" : "text-muted-foreground"
                      )}>
                        {match.scoreB}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Player Stats */}
        <GlassCard className="p-4">
          <h3 className="font-semibold mb-3">สถิติผู้เล่น</h3>
          <div className="space-y-2">
            {playerStats
              .sort((a, b) => b.wins - a.wins)
              .map((player, index) => (
                <div key={player.id} className="flex items-center gap-3 p-2 rounded-xl bg-muted/50">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 && "bg-[#F7B928] text-white",
                    index === 1 && "bg-[#C0C0C0] text-white",
                    index === 2 && "bg-[#CD7F32] text-white",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                  <Image
                    src={player.avatar || "/placeholder.svg"}
                    alt={player.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{player.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#31A24C]">{player.wins} ชนะ</p>
                    <p className="text-xs text-muted-foreground">{player.matches} เกม</p>
                  </div>
                </div>
              ))}
          </div>
        </GlassCard>

        {/* Pending Matches */}
        {pendingMatches.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-muted-foreground">เกมถัดไป</h3>
            <div className="space-y-3 opacity-60">
              {pendingMatches.map((match) => (
                <GlassCard key={match.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">รอบ {match.round}</Badge>
                    <span className="text-xs text-muted-foreground">คอร์ท {match.court}</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span>{match.teamA.map((p) => p.name).join(" & ")}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span>{match.teamB.map((p) => p.name).join(" & ")}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="flex-1 bg-transparent">
            <Icons.shuffle className="w-5 h-5 mr-2" />
            สุ่มใหม่
          </Button>
          <Button size="lg" className="flex-1">
            <Icons.share className="w-5 h-5 mr-2" />
            แชร์ผล
          </Button>
        </div>
      </div>

      {/* Cutscene Modal */}
      {showCutscene && cutsceneMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowCutscene(false)}
        >
          {/* VS Phase */}
          {cutscenePhase === "vs" && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF9500] to-[#D35400] flex items-center justify-center">
              <div className="text-center animate-in zoom-in duration-500">
                <div className="flex items-center gap-8">
                  {/* Team A */}
                  <div className="text-center animate-in slide-in-from-left duration-700">
                    <div className="flex -space-x-4 justify-center mb-4">
                      {cutsceneMatch.teamA.map((p) => (
                        <Image
                          key={p.id}
                          src={p.avatar || "/placeholder.svg"}
                          alt={p.name}
                          width={80}
                          height={80}
                          className="rounded-full ring-4 ring-white/30"
                        />
                      ))}
                    </div>
                    <p className="text-white font-bold text-lg">
                      {cutsceneMatch.teamA.map((p) => p.name).join(" & ")}
                    </p>
                  </div>

                  {/* VS */}
                  <div className="animate-in zoom-in delay-300 duration-500">
                    <span className="text-6xl font-black text-white drop-shadow-lg">VS</span>
                  </div>

                  {/* Team B */}
                  <div className="text-center animate-in slide-in-from-right duration-700">
                    <div className="flex -space-x-4 justify-center mb-4">
                      {cutsceneMatch.teamB.map((p) => (
                        <Image
                          key={p.id}
                          src={p.avatar || "/placeholder.svg"}
                          alt={p.name}
                          width={80}
                          height={80}
                          className="rounded-full ring-4 ring-white/30"
                        />
                      ))}
                    </div>
                    <p className="text-white font-bold text-lg">
                      {cutsceneMatch.teamB.map((p) => p.name).join(" & ")}
                    </p>
                  </div>
                </div>

                <p className="text-white/60 mt-8 text-sm">แตะเพื่อปิด</p>
              </div>
            </div>
          )}

          {/* Result Phase */}
          {cutscenePhase === "result" && cutsceneMatch.status === "completed" && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] flex items-center justify-center">
              <div className="text-center animate-in zoom-in duration-500">
                <p className="text-white/60 text-sm mb-2">รอบ {cutsceneMatch.round} - คอร์ท {cutsceneMatch.court}</p>
                
                <div className="flex items-center gap-8 mb-8">
                  {/* Team A */}
                  <div className={cn(
                    "text-center p-6 rounded-2xl transition-all",
                    (cutsceneMatch.scoreA || 0) > (cutsceneMatch.scoreB || 0) && "bg-[#31A24C]/20 ring-2 ring-[#31A24C]"
                  )}>
                    <div className="flex -space-x-4 justify-center mb-4">
                      {cutsceneMatch.teamA.map((p) => (
                        <Image
                          key={p.id}
                          src={p.avatar || "/placeholder.svg"}
                          alt={p.name}
                          width={64}
                          height={64}
                          className="rounded-full ring-2 ring-white/30"
                        />
                      ))}
                    </div>
                    <p className="text-white font-medium mb-2">
                      {cutsceneMatch.teamA.map((p) => p.name).join(" & ")}
                    </p>
                    <p className={cn(
                      "text-5xl font-black",
                      (cutsceneMatch.scoreA || 0) > (cutsceneMatch.scoreB || 0) ? "text-[#31A24C]" : "text-white/60"
                    )}>
                      {cutsceneMatch.scoreA}
                    </p>
                    {(cutsceneMatch.scoreA || 0) > (cutsceneMatch.scoreB || 0) && (
                      <Badge className="mt-2 bg-[#31A24C]">WINNER</Badge>
                    )}
                  </div>

                  <span className="text-3xl font-bold text-white/40">-</span>

                  {/* Team B */}
                  <div className={cn(
                    "text-center p-6 rounded-2xl transition-all",
                    (cutsceneMatch.scoreB || 0) > (cutsceneMatch.scoreA || 0) && "bg-[#31A24C]/20 ring-2 ring-[#31A24C]"
                  )}>
                    <div className="flex -space-x-4 justify-center mb-4">
                      {cutsceneMatch.teamB.map((p) => (
                        <Image
                          key={p.id}
                          src={p.avatar || "/placeholder.svg"}
                          alt={p.name}
                          width={64}
                          height={64}
                          className="rounded-full ring-2 ring-white/30"
                        />
                      ))}
                    </div>
                    <p className="text-white font-medium mb-2">
                      {cutsceneMatch.teamB.map((p) => p.name).join(" & ")}
                    </p>
                    <p className={cn(
                      "text-5xl font-black",
                      (cutsceneMatch.scoreB || 0) > (cutsceneMatch.scoreA || 0) ? "text-[#31A24C]" : "text-white/60"
                    )}>
                      {cutsceneMatch.scoreB}
                    </p>
                    {(cutsceneMatch.scoreB || 0) > (cutsceneMatch.scoreA || 0) && (
                      <Badge className="mt-2 bg-[#31A24C]">WINNER</Badge>
                    )}
                  </div>
                </div>

                <p className="text-white/60 text-sm">แตะเพื่อปิด</p>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
