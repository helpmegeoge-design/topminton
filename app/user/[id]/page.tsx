"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons, ChevronLeftIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

// Mock user data
const mockUser = {
  id: "user-1",
  name: "SUN_TheSun",
  avatar: "/images/avatars/player-1.jpg",
  level: "S",
  levelName: "Strong",
  rating: 1850,
  rank: 42,
  frame: "gold",
  isVerified: true,
  bio: "แบดมินตันคือชีวิต ตีทุกวันไม่มีวันหยุด",
  location: "กรุงเทพมหานคร",
  joinedDate: "ม.ค. 2024",
  stats: {
    matches: 156,
    wins: 98,
    winRate: 62.8,
    parties: 45,
    streak: 5,
  },
  gear: {
    racket: "Yonex Astrox 99 Pro",
    shoes: "Victor A960",
    string: "BG80 Power @ 27lbs",
  },
  achievements: [
    { id: "1", name: "ตีครบ 100 แมตช์", icon: "trophy" },
    { id: "2", name: "ชนะ 5 แมตช์ติด", icon: "fire" },
    { id: "3", name: "เข้าร่วม 50 ก๊วน", icon: "users" },
  ],
  recentActivity: [
    { type: "match", result: "win", opponent: "Player_X", date: "2 ชม. ก่อน" },
    { type: "party", name: "ก๊วนพุธสุข", date: "เมื่อวาน" },
    { type: "tournament", name: "Bangkok Open", result: "รอบ 8", date: "3 วันก่อน" },
  ],
};

const levelColors: Record<string, string> = {
  "N": "bg-blue-500",
  "BG": "bg-green-500",
  "S": "bg-yellow-500",
  "P": "bg-orange-500",
  "C": "bg-red-500",
};

const frameStyles: Record<string, string> = {
  default: "ring-2 ring-muted",
  gold: "ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/30",
  silver: "ring-4 ring-gray-300 shadow-lg shadow-gray-300/30",
  bronze: "ring-4 ring-amber-600 shadow-lg shadow-amber-600/30",
  diamond: "ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/30 animate-pulse-soft",
};

export default function UserProfilePage() {
  const [isFollowing, setIsFollowing] = useState(false);
  const user = mockUser;

  return (
    <AppShell hideNav>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </Link>
          <h1 className="font-semibold">โปรไฟล์</h1>
          <button type="button" className="p-2 -mr-2 tap-highlight">
            <Icons.moreHorizontal size={24} />
          </button>
        </div>
      </header>

      <main className="pb-8">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10" />
          
          {/* Avatar & Info */}
          <div className="px-4 -mt-16">
            <div className="flex items-end gap-4">
              <div className={cn(
                "relative w-28 h-28 rounded-full overflow-hidden bg-muted",
                frameStyles[user.frame] || frameStyles.default
              )}>
                <Image
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
                {/* Level Badge */}
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-background",
                  levelColors[user.level] || "bg-gray-500"
                )}>
                  {user.level}
                </div>
              </div>
              
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  {user.isVerified && (
                    <Icons.verified size={18} className="text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.levelName} | Rating: {user.rating}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Icons.mapPin size={12} className="inline mr-1" />
                  {user.location}
                </p>
              </div>
            </div>
            
            {/* Bio */}
            {user.bio && (
              <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button 
                className={cn(
                  "flex-1",
                  isFollowing ? "bg-muted text-foreground hover:bg-muted/80" : ""
                )}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? "กำลังติดตาม" : "ติดตาม"}
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Icons.message size={18} className="mr-2" />
                ส่งข้อความ
              </Button>
              <Button variant="outline" size="icon" className="bg-transparent">
                <Icons.swords size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 px-4 mt-6">
          {[
            { label: "แมตช์", value: user.stats.matches },
            { label: "ชนะ", value: user.stats.wins },
            { label: "Win Rate", value: `${user.stats.winRate}%` },
            { label: "อันดับ", value: `#${user.rank}` },
          ].map((stat) => (
            <GlassCard key={stat.label} className="p-3 text-center">
              <div className="text-lg font-bold text-primary">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Gear Showcase */}
        <section className="px-4 mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Icons.shuttlecock size={18} />
            อุปกรณ์ที่ใช้
          </h3>
          <GlassCard className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icons.shuttlecock size={20} className="text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">แร็คเก็ต</div>
                <div className="font-medium text-sm">{user.gear.racket}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icons.star size={20} className="text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">รองเท้า</div>
                <div className="font-medium text-sm">{user.gear.shoes}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icons.trophy size={20} className="text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">เอ็น</div>
                <div className="font-medium text-sm">{user.gear.string}</div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Achievements */}
        <section className="px-4 mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Icons.star size={18} />
            ความสำเร็จ
          </h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {user.achievements.map((achievement) => (
              <GlassCard key={achievement.id} className="p-3 min-w-[120px] text-center flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                  <Icons.trophy size={20} className="text-amber-500" />
                </div>
                <div className="text-xs font-medium">{achievement.name}</div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="px-4 mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Icons.clock size={18} />
            กิจกรรมล่าสุด
          </h3>
          <div className="space-y-2">
            {user.recentActivity.map((activity, index) => (
              <GlassCard key={index} className="p-3 flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  activity.type === "match" 
                    ? activity.result === "win" ? "bg-green-500/20" : "bg-red-500/20"
                    : activity.type === "party" ? "bg-blue-500/20" : "bg-amber-500/20"
                )}>
                  {activity.type === "match" ? (
                    <Icons.swords size={18} className={activity.result === "win" ? "text-green-500" : "text-red-500"} />
                  ) : activity.type === "party" ? (
                    <Icons.users size={18} className="text-blue-500" />
                  ) : (
                    <Icons.trophy size={18} className="text-amber-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {activity.type === "match" 
                      ? `${activity.result === "win" ? "ชนะ" : "แพ้"} ${activity.opponent}`
                      : activity.type === "party"
                        ? `เข้าร่วม ${activity.name}`
                        : `${activity.name} - ${activity.result}`
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.date}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
