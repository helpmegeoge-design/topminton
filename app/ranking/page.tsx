"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/ui/level-badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const mockMyRanking = {
  rank: 42,
  rating: 1250,
  level: "strong" as const,
  wins: 28,
  losses: 12,
  winRate: 70,
  seasonPoints: 450,
  seasonRank: 15,
};

const mockTopPlayers = [
  { rank: 1, name: "แชมป์ ณรงค์", avatar: "/images/avatars/avatar-1.jpg", rating: 2450, level: "champion" as const },
  { rank: 2, name: "นัท สุวรรณ", avatar: "/images/avatars/avatar-2.jpg", rating: 2380, level: "champion" as const },
  { rank: 3, name: "กิม จิตรา", avatar: "/images/avatars/avatar-3.jpg", rating: 2290, level: "pro" as const },
];

const mockLadder = [
  { rank: 1, name: "แชมป์ ณรงค์", avatar: "/images/avatars/avatar-1.jpg", rating: 2450, canChallenge: false },
  { rank: 2, name: "นัท สุวรรณ", avatar: "/images/avatars/avatar-2.jpg", rating: 2380, canChallenge: false },
  { rank: 3, name: "กิม จิตรา", avatar: "/images/avatars/avatar-3.jpg", rating: 2290, canChallenge: false },
  { rank: 39, name: "วิชัย รักแบด", avatar: "/images/avatars/avatar-4.jpg", rating: 1290, canChallenge: true },
  { rank: 40, name: "สุภาพ ดีใจ", avatar: "/images/avatars/avatar-1.jpg", rating: 1275, canChallenge: true },
  { rank: 41, name: "ปรีชา เก่ง", avatar: "/images/avatars/avatar-2.jpg", rating: 1260, canChallenge: true },
  { rank: 42, name: "คุณ", avatar: "/images/avatars/avatar-1.jpg", rating: 1250, canChallenge: false, isMe: true },
  { rank: 43, name: "อารี สวย", avatar: "/images/avatars/avatar-3.jpg", rating: 1240, canChallenge: false },
  { rank: 44, name: "นิดา เก่ง", avatar: "/images/avatars/avatar-4.jpg", rating: 1230, canChallenge: false },
];

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"global" | "ladder" | "season">("global");
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<typeof mockLadder[0] | null>(null);

  const handleChallenge = (player: typeof mockLadder[0]) => {
    setSelectedPlayer(player);
    setShowChallengeModal(true);
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14 safe-area-top">
          <h1 className="text-xl font-bold text-foreground">อันดับ</h1>
          <Link href="/ranking/history" className="text-sm text-primary">
            ประวัติ
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex px-4">
          {[
            { id: "global", label: "Global Ranking" },
            { id: "ladder", label: "Ladder" },
            { id: "season", label: "Season" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all tap-highlight",
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* My Stats Card */}
        <GlassCard className="p-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src="/images/avatars/avatar-1.jpg"
                alt="Me"
                width={64}
                height={64}
                className="rounded-full ring-2 ring-white/30"
              />
              <div className="absolute -bottom-1 -right-1">
                <LevelBadge level={mockMyRanking.level} size="sm" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm opacity-80">อันดับของคุณ</p>
              <p className="text-3xl font-bold">#{mockMyRanking.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Rating</p>
              <p className="text-2xl font-bold">{mockMyRanking.rating}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-lg font-bold">{mockMyRanking.wins}</p>
              <p className="text-xs opacity-80">ชนะ</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{mockMyRanking.losses}</p>
              <p className="text-xs opacity-80">แพ้</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{mockMyRanking.winRate}%</p>
              <p className="text-xs opacity-80">อัตราชนะ</p>
            </div>
          </div>
        </GlassCard>

        {/* Global Ranking Tab */}
        {activeTab === "global" && (
          <>
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-2 py-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <Image
                  src={mockTopPlayers[1].avatar || "/placeholder.svg"}
                  alt={mockTopPlayers[1].name}
                  width={56}
                  height={56}
                  className="rounded-full ring-2 ring-[#C0C0C0]"
                />
                <div className="w-16 h-20 mt-2 rounded-t-lg bg-gradient-to-t from-[#C0C0C0] to-[#E8E8E8] flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <p className="text-xs font-medium mt-1 text-center line-clamp-1 w-16">{mockTopPlayers[1].name}</p>
                <p className="text-xs text-muted-foreground">{mockTopPlayers[1].rating}</p>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Icons.crown className="w-6 h-6 text-[#F7B928] absolute -top-6 left-1/2 -translate-x-1/2" />
                  <Image
                    src={mockTopPlayers[0].avatar || "/placeholder.svg"}
                    alt={mockTopPlayers[0].name}
                    width={72}
                    height={72}
                    className="rounded-full ring-4 ring-[#F7B928]"
                  />
                </div>
                <div className="w-20 h-28 mt-2 rounded-t-lg bg-gradient-to-t from-[#F7B928] to-[#FFD700] flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <p className="text-xs font-medium mt-1 text-center line-clamp-1 w-20">{mockTopPlayers[0].name}</p>
                <p className="text-xs text-muted-foreground">{mockTopPlayers[0].rating}</p>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <Image
                  src={mockTopPlayers[2].avatar || "/placeholder.svg"}
                  alt={mockTopPlayers[2].name}
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-[#CD7F32]"
                />
                <div className="w-14 h-16 mt-2 rounded-t-lg bg-gradient-to-t from-[#CD7F32] to-[#E8A858] flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
                <p className="text-xs font-medium mt-1 text-center line-clamp-1 w-14">{mockTopPlayers[2].name}</p>
                <p className="text-xs text-muted-foreground">{mockTopPlayers[2].rating}</p>
              </div>
            </div>

            {/* Full Ranking List */}
            <GlassCard className="p-4">
              <h3 className="font-semibold mb-3">อันดับทั้งหมด</h3>
              <div className="space-y-2">
                {mockLadder.slice(3).map((player) => (
                  <div
                    key={player.rank}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl",
                      player.isMe ? "bg-primary/10 ring-1 ring-primary" : "bg-muted/50"
                    )}
                  >
                    <span className="w-8 text-center font-bold text-muted-foreground">
                      {player.rank}
                    </span>
                    <Image
                      src={player.avatar || "/placeholder.svg"}
                      alt={player.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <p className={cn("font-medium text-sm", player.isMe && "text-primary")}>
                        {player.name}
                      </p>
                    </div>
                    <span className="font-semibold">{player.rating}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        )}

        {/* Ladder Tab */}
        {activeTab === "ladder" && (
          <>
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Icons.info className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">กติกา Ladder</p>
                  <p className="text-xs text-muted-foreground">
                    ท้าได้เฉพาะผู้เล่นที่อันดับสูงกว่าไม่เกิน 3 อันดับ หากชนะจะสลับอันดับกัน
                  </p>
                </div>
              </div>
            </div>

            <GlassCard className="p-4">
              <h3 className="font-semibold mb-3">บันไดอันดับ</h3>
              <div className="space-y-2">
                {mockLadder.map((player, index) => (
                  <div
                    key={player.rank}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all",
                      player.isMe ? "bg-primary/10 ring-1 ring-primary" : "bg-muted/50",
                      player.canChallenge && "hover:ring-1 hover:ring-[#31A24C]"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                      player.rank <= 3 && "bg-[#F7B928]/20 text-[#F7B928]",
                      player.rank > 3 && "bg-muted text-muted-foreground"
                    )}>
                      {player.rank}
                    </div>
                    <Image
                      src={player.avatar || "/placeholder.svg"}
                      alt={player.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <p className={cn("font-medium text-sm", player.isMe && "text-primary")}>
                        {player.name} {player.isMe && "(คุณ)"}
                      </p>
                      <p className="text-xs text-muted-foreground">{player.rating} pts</p>
                    </div>
                    {player.canChallenge && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#31A24C] border-[#31A24C] bg-transparent"
                        onClick={() => handleChallenge(player)}
                      >
                        ท้าแข่ง
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        )}

        {/* Season Tab */}
        {activeTab === "season" && (
          <>
            <GlassCard className="p-4 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-80">Season 1 - 2569</p>
                  <p className="text-xs opacity-60">สิ้นสุด 31 มี.ค. 2569</p>
                </div>
                <Badge className="bg-white/20 text-white">กำลังดำเนินการ</Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm opacity-80">อันดับ Season</p>
                  <p className="text-3xl font-bold">#{mockMyRanking.seasonRank}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm opacity-80 mb-1">คะแนนสะสม</p>
                  <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: "45%" }} />
                  </div>
                  <p className="text-xs mt-1">{mockMyRanking.seasonPoints} / 1000 pts</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <h3 className="font-semibold mb-3">รางวัล Season</h3>
              <div className="space-y-3">
                {[
                  { rank: "Top 1", reward: "กรอบ Champion + 500 TB", color: "#F7B928" },
                  { rank: "Top 2-3", reward: "กรอบ Elite + 300 TB", color: "#C0C0C0" },
                  { rank: "Top 4-10", reward: "กรอบ Pro + 100 TB", color: "#CD7F32" },
                  { rank: "Top 11-50", reward: "50 TB", color: "#FF9500" },
                ].map((tier) => (
                  <div key={tier.rank} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${tier.color}20` }}
                    >
                      <Icons.trophy className="w-5 h-5" style={{ color: tier.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{tier.rank}</p>
                      <p className="text-xs text-muted-foreground">{tier.reward}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        )}
      </div>

      {/* Challenge Modal */}
      {showChallengeModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm p-6 bg-card">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-4">ท้าแข่ง</h3>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center">
                  <Image
                    src="/images/avatars/avatar-1.jpg"
                    alt="Me"
                    width={56}
                    height={56}
                    className="rounded-full mx-auto"
                  />
                  <p className="text-sm font-medium mt-2">คุณ</p>
                  <p className="text-xs text-muted-foreground">#{mockMyRanking.rank}</p>
                </div>
                
                <div className="text-2xl font-bold text-primary">VS</div>
                
                <div className="text-center">
                  <Image
                    src={selectedPlayer.avatar || "/placeholder.svg"}
                    alt={selectedPlayer.name}
                    width={56}
                    height={56}
                    className="rounded-full mx-auto"
                  />
                  <p className="text-sm font-medium mt-2">{selectedPlayer.name}</p>
                  <p className="text-xs text-muted-foreground">#{selectedPlayer.rank}</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                หากชนะ คุณจะขยับขึ้นมาอันดับ #{selectedPlayer.rank}
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowChallengeModal(false)}
                >
                  ยกเลิก
                </Button>
                <Button className="flex-1">
                  ส่งคำท้า
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </AppShell>
  );
}
