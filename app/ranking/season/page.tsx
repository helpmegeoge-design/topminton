"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const seasons = [
  { id: "2025-1", name: "Season 1/2025", status: "active", startDate: "1 ม.ค.", endDate: "31 มี.ค." },
  { id: "2024-4", name: "Season 4/2024", status: "ended", startDate: "1 ต.ค.", endDate: "31 ธ.ค." },
  { id: "2024-3", name: "Season 3/2024", status: "ended", startDate: "1 ก.ค.", endDate: "30 ก.ย." },
];

const currentSeasonLeaders = [
  { rank: 1, name: "แชมป์ ณรงค์", avatar: "/images/avatars/avatar-1.jpg", points: 2450, change: "+120" },
  { rank: 2, name: "นัท สุวรรณ", avatar: "/images/avatars/avatar-2.jpg", points: 2280, change: "+85" },
  { rank: 3, name: "กิม จิตรา", avatar: "/images/avatars/avatar-3.jpg", points: 2150, change: "+95" },
  { rank: 4, name: "สมชาย ใจดี", avatar: "/images/avatars/avatar-4.jpg", points: 1980, change: "+45" },
  { rank: 5, name: "วิชัย รักแบด", avatar: "/images/avatars/avatar-1.jpg", points: 1850, change: "-20" },
];

const rewards = [
  { rank: "1st", reward: "500 TB + Gold Frame + Trophy Badge", color: "from-[#F7B928] to-[#FCD34D]" },
  { rank: "2nd", reward: "300 TB + Silver Frame", color: "from-[#9CA3AF] to-[#D1D5DB]" },
  { rank: "3rd", reward: "150 TB + Bronze Frame", color: "from-[#D97706] to-[#F59E0B]" },
  { rank: "4-10", reward: "50 TB + Exclusive Badge", color: "from-primary to-primary/70" },
];

const myProgress = {
  rank: 12,
  points: 1250,
  toNextRank: 150,
  nextRankPoints: 1400,
};

export default function SeasonLeaderPage() {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);

  const daysRemaining = 62; // Mock
  const totalDays = 90;
  const progressPercent = ((totalDays - daysRemaining) / totalDays) * 100;

  return (
    <AppShell hideBottomNav>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Link href="/ranking" className="p-2 -ml-2 rounded-full hover:bg-muted tap-highlight">
                <Icons.chevronLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-semibold">Season Leader</h1>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              <Icons.info className="w-4 h-4 mr-1" />
              กติกา
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Season Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {seasons.map((season) => (
              <button
                key={season.id}
                type="button"
                onClick={() => setSelectedSeason(season)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedSeason.id === season.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {season.name}
                {season.status === "active" && (
                  <span className="ml-2 w-2 h-2 bg-[#31A24C] rounded-full inline-block animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Season Progress */}
          {selectedSeason.status === "active" && (
            <GlassCard className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Season Progress</p>
                  <p className="text-2xl font-bold">{daysRemaining} วัน</p>
                  <p className="text-xs text-muted-foreground">เหลืออีก {daysRemaining} วันจะสิ้นสุด Season</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{selectedSeason.startDate} - {selectedSeason.endDate}</p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-[#31A24C] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </GlassCard>
          )}

          {/* My Progress */}
          <GlassCard className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">อันดับของคุณ</p>
                <p className="text-3xl font-bold">#{myProgress.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">คะแนน</p>
                <p className="text-2xl font-bold text-primary">{myProgress.points.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ไปสู่อันดับ #{myProgress.rank - 1}</span>
                <span className="font-medium">{myProgress.toNextRank} คะแนน</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(myProgress.points / myProgress.nextRankPoints) * 100}%` }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Rewards */}
          <div>
            <h2 className="text-lg font-semibold mb-3">รางวัลประจำ Season</h2>
            <div className="grid grid-cols-2 gap-3">
              {rewards.map((reward) => (
                <GlassCard key={reward.rank} className="p-3 relative overflow-hidden">
                  <div className={cn(
                    "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
                    reward.color
                  )} />
                  <p className="font-bold text-lg">{reward.rank}</p>
                  <p className="text-xs text-muted-foreground">{reward.reward}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Top Leaders */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Top Leaders</h2>
            
            {/* Podium */}
            <div className="flex items-end justify-center gap-2 mb-6 h-40">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <img 
                    src={currentSeasonLeaders[1].avatar || "/placeholder.svg"} 
                    alt={currentSeasonLeaders[1].name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#9CA3AF]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#9CA3AF] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                </div>
                <p className="text-xs font-medium text-center line-clamp-1 w-16">{currentSeasonLeaders[1].name}</p>
                <p className="text-xs text-muted-foreground">{currentSeasonLeaders[1].points.toLocaleString()}</p>
                <div className="w-16 h-20 bg-gradient-to-t from-[#9CA3AF] to-[#D1D5DB] rounded-t-lg mt-2" />
              </div>
              
              {/* 1st Place */}
              <div className="flex flex-col items-center -mt-4">
                <Icons.crown className="w-8 h-8 text-[#F7B928] mb-1" />
                <div className="relative mb-2">
                  <img 
                    src={currentSeasonLeaders[0].avatar || "/placeholder.svg"} 
                    alt={currentSeasonLeaders[0].name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#F7B928] ring-4 ring-[#F7B928]/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#F7B928] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                </div>
                <p className="text-sm font-semibold text-center line-clamp-1 w-20">{currentSeasonLeaders[0].name}</p>
                <p className="text-xs text-primary font-medium">{currentSeasonLeaders[0].points.toLocaleString()}</p>
                <div className="w-20 h-28 bg-gradient-to-t from-[#F7B928] to-[#FCD34D] rounded-t-lg mt-2" />
              </div>
              
              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <img 
                    src={currentSeasonLeaders[2].avatar || "/placeholder.svg"} 
                    alt={currentSeasonLeaders[2].name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#D97706]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D97706] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                </div>
                <p className="text-xs font-medium text-center line-clamp-1 w-16">{currentSeasonLeaders[2].name}</p>
                <p className="text-xs text-muted-foreground">{currentSeasonLeaders[2].points.toLocaleString()}</p>
                <div className="w-16 h-16 bg-gradient-to-t from-[#D97706] to-[#F59E0B] rounded-t-lg mt-2" />
              </div>
            </div>

            {/* Remaining Leaders */}
            <div className="space-y-2">
              {currentSeasonLeaders.slice(3).map((leader) => (
                <GlassCard key={leader.rank} className="p-3 flex items-center gap-3">
                  <span className="w-8 text-center font-bold text-muted-foreground">#{leader.rank}</span>
                  <img 
                    src={leader.avatar || "/placeholder.svg"} 
                    alt={leader.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{leader.name}</p>
                    <p className="text-sm text-muted-foreground">{leader.points.toLocaleString()} pts</p>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    leader.change.startsWith("+") ? "text-[#31A24C]" : "text-[#FA383E]"
                  )}>
                    {leader.change}
                  </span>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Hall of Fame */}
          {selectedSeason.status === "ended" && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Hall of Fame</h2>
              <GlassCard className="p-4 text-center">
                <Icons.trophy className="w-12 h-12 text-[#F7B928] mx-auto mb-2" />
                <p className="font-semibold">แชมป์ Season {selectedSeason.name}</p>
                <p className="text-2xl font-bold mt-2">แชมป์ ณรงค์</p>
                <p className="text-sm text-muted-foreground">2,450 คะแนน</p>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
