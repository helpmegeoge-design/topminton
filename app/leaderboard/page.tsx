"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Image from "next/image";

const mockLeaderboard = [
  { rank: 1, name: "แชมป์ ณรงค์", avatar: "/images/avatars/avatar-1.jpg", partyCount: 89 },
  { rank: 2, name: "นัท สุวรรณ", avatar: "/images/avatars/avatar-2.jpg", partyCount: 76 },
  { rank: 3, name: "กิม จิตรา", avatar: "/images/avatars/avatar-3.jpg", partyCount: 65 },
  { rank: 4, name: "สมชาย ใจดี", avatar: "/images/avatars/avatar-4.jpg", partyCount: 41 },
  { rank: 5, name: "วิชัย รักแบด", avatar: "/images/avatars/avatar-1.jpg", partyCount: 38 },
  { rank: 6, name: "สุภาพ ดีใจ", avatar: "/images/avatars/avatar-2.jpg", partyCount: 35 },
  { rank: 7, name: "ปรีชา เก่ง", avatar: "/images/avatars/avatar-3.jpg", partyCount: 32 },
  { rank: 8, name: "อารี สวย", avatar: "/images/avatars/avatar-4.jpg", partyCount: 28 },
];

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "from-[#F7B928] to-[#F5793A]";
    case 2:
      return "from-[#C0C0C0] to-[#A0A0A0]";
    case 3:
      return "from-[#CD7F32] to-[#8B4513]";
    default:
      return "";
  }
};

export default function LeaderboardPage() {
  const router = useRouter();
  const top3 = mockLeaderboard.slice(0, 3);
  const rest = mockLeaderboard.slice(3);

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <Icons.chevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              Leaderboard
            </h1>
          </div>
        </div>

        {/* Podium */}
        <div className="px-4 py-8">
          <div className="flex items-end justify-center gap-4">
            {/* 2nd Place */}
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${getRankColor(2)} p-1 mb-2`}>
                <Image
                  src={top3[1].avatar || "/placeholder.svg"}
                  alt={top3[1].name}
                  width={64}
                  height={64}
                  className="w-full h-full rounded-full object-cover bg-background"
                />
              </div>
              <p className="text-sm font-medium text-foreground truncate max-w-16">
                {top3[1].name}
              </p>
              <p className="text-xs text-muted-foreground">
                {top3[1].partyCount} ก๊วน
              </p>
              <div className="mt-2 w-16 h-20 bg-[#C0C0C0] rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center -mt-8">
              <div className="relative">
                <Icons.crown className="h-8 w-8 text-[#F7B928] mx-auto mb-1" />
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getRankColor(1)} p-1 mb-2`}>
                  <Image
                    src={top3[0].avatar || "/placeholder.svg"}
                    alt={top3[0].name}
                    width={80}
                    height={80}
                    className="w-full h-full rounded-full object-cover bg-background"
                  />
                </div>
              </div>
              <p className="text-sm font-medium text-foreground truncate max-w-20">
                {top3[0].name}
              </p>
              <p className="text-xs text-muted-foreground">
                {top3[0].partyCount} ก๊วน
              </p>
              <div className="mt-2 w-20 h-28 bg-[#F7B928] rounded-t-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${getRankColor(3)} p-1 mb-2`}>
                <Image
                  src={top3[2].avatar || "/placeholder.svg"}
                  alt={top3[2].name}
                  width={64}
                  height={64}
                  className="w-full h-full rounded-full object-cover bg-background"
                />
              </div>
              <p className="text-sm font-medium text-foreground truncate max-w-16">
                {top3[2].name}
              </p>
              <p className="text-xs text-muted-foreground">
                {top3[2].partyCount} ก๊วน
              </p>
              <div className="mt-2 w-16 h-16 bg-[#CD7F32] rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of Leaderboard */}
        <div className="px-4 pb-8 space-y-2">
          {rest.map((user) => (
            <GlassCard key={user.rank} className="p-4 flex items-center gap-3">
              <span className="w-8 text-lg font-bold text-muted-foreground">
                #{user.rank}
              </span>
              <Image
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {user.name}
                </p>
              </div>
              <span className="text-[#FF9500] font-medium">
                {user.partyCount} ก๊วน
              </span>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
