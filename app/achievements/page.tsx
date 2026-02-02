"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icons, ChevronLeftIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type AchievementCategory = "play" | "social" | "ranking" | "special";
type AchievementRarity = "common" | "rare" | "epic" | "legendary";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  reward: number;
}

const mockAchievements: Achievement[] = [
  {
    id: "1",
    name: "นักแบดหน้าใหม่",
    description: "เข้าร่วมก๊วนครั้งแรก",
    icon: "star",
    category: "play",
    rarity: "common",
    progress: 1,
    target: 1,
    unlocked: true,
    unlockedAt: "15 ม.ค. 2569",
    reward: 50,
  },
  {
    id: "2",
    name: "นักสะสม",
    description: "ตีแบดครบ 10 ครั้ง",
    icon: "trophy",
    category: "play",
    rarity: "common",
    progress: 8,
    target: 10,
    unlocked: false,
    reward: 100,
  },
  {
    id: "3",
    name: "ผู้นำก๊วน",
    description: "สร้างก๊วนครบ 5 ครั้ง",
    icon: "crown",
    category: "social",
    rarity: "rare",
    progress: 3,
    target: 5,
    unlocked: false,
    reward: 200,
  },
  {
    id: "4",
    name: "นักรีวิว",
    description: "รีวิวคอร์ทครบ 10 คอร์ท",
    icon: "message",
    category: "social",
    rarity: "rare",
    progress: 5,
    target: 10,
    unlocked: false,
    reward: 150,
  },
  {
    id: "5",
    name: "แชมป์ Ladder",
    description: "ขึ้นอันดับ 1 ใน Ladder",
    icon: "medal",
    category: "ranking",
    rarity: "epic",
    progress: 0,
    target: 1,
    unlocked: false,
    reward: 500,
  },
  {
    id: "6",
    name: "นักสู้ไม่ยอมแพ้",
    description: "ชนะ 10 แมตช์ติดต่อกัน",
    icon: "fire",
    category: "ranking",
    rarity: "epic",
    progress: 4,
    target: 10,
    unlocked: false,
    reward: 300,
  },
  {
    id: "7",
    name: "ตำนานนักแบด",
    description: "ตีแบดครบ 100 ครั้ง",
    icon: "gem",
    category: "special",
    rarity: "legendary",
    progress: 25,
    target: 100,
    unlocked: false,
    reward: 1000,
  },
];

const categoryConfig: Record<AchievementCategory, { label: string; icon: typeof Icons.star }> = {
  play: { label: "การเล่น", icon: Icons.shuttlecock },
  social: { label: "สังคม", icon: Icons.users },
  ranking: { label: "อันดับ", icon: Icons.ranking },
  special: { label: "พิเศษ", icon: Icons.star },
};

const rarityConfig: Record<AchievementRarity, { label: string; color: string; bgColor: string }> = {
  common: { label: "ทั่วไป", color: "text-gray-500", bgColor: "bg-gray-500/10" },
  rare: { label: "หายาก", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  epic: { label: "ยอดเยี่ยม", color: "text-purple-500", bgColor: "bg-purple-500/10" },
  legendary: { label: "ตำนาน", color: "text-amber-500", bgColor: "bg-amber-500/10" },
};

export default function AchievementsPage() {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | "all">("all");

  const filteredAchievements = activeCategory === "all"
    ? mockAchievements
    : mockAchievements.filter(a => a.category === activeCategory);

  const unlockedCount = mockAchievements.filter(a => a.unlocked).length;
  const totalReward = mockAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0);

  return (
    <AppShell hideBottomNav>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/profile" className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </Link>
          <h1 className="text-lg font-semibold">ความสำเร็จ</h1>
        </div>
      </header>

      {/* Summary */}
      <div className="p-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {unlockedCount}/{mockAchievements.length}
              </p>
              <p className="text-sm text-muted-foreground">ปลดล็อคแล้ว</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                +{totalReward}
              </p>
              <p className="text-sm text-muted-foreground">TB Points ได้รับ</p>
            </div>
          </div>
          <Progress value={(unlockedCount / mockAchievements.length) * 100} className="mt-4 h-2" />
        </GlassCard>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            activeCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          ทั้งหมด
        </button>
        {(Object.keys(categoryConfig) as AchievementCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1",
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {categoryConfig[cat].label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="px-4 pb-4 grid grid-cols-1 gap-3">
        {filteredAchievements.map((achievement) => (
          <GlassCard 
            key={achievement.id} 
            className={cn(
              "p-4 transition-all",
              !achievement.unlocked && "opacity-70"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                achievement.unlocked 
                  ? rarityConfig[achievement.rarity].bgColor
                  : "bg-muted"
              )}>
                <Icons.trophy 
                  size={28} 
                  className={achievement.unlocked 
                    ? rarityConfig[achievement.rarity].color 
                    : "text-muted-foreground"
                  } 
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="font-semibold text-foreground">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge className={cn(
                    "text-[10px]",
                    rarityConfig[achievement.rarity].color,
                    rarityConfig[achievement.rarity].bgColor
                  )}>
                    {rarityConfig[achievement.rarity].label}
                  </Badge>
                </div>

                {/* Progress */}
                {!achievement.unlocked && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {achievement.progress}/{achievement.target}
                      </span>
                      <span className="text-primary font-medium">+{achievement.reward} TB</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.target) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                )}

                {/* Unlocked */}
                {achievement.unlocked && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-green-500 text-sm">
                      <Icons.check size={14} />
                      <span>ปลดล็อคเมื่อ {achievement.unlockedAt}</span>
                    </div>
                    <span className="text-primary font-medium text-sm">+{achievement.reward} TB</span>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
}
