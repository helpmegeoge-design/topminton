"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  type: "daily" | "weekly" | "achievement";
  status: "active" | "completed" | "claimed";
  icon: string;
}

const mockQuests: Quest[] = [
  {
    id: "1",
    title: "เข้าแอปประจำวัน",
    description: "เข้าใช้งานแอป Topminton",
    reward: 5,
    progress: 1,
    target: 1,
    type: "daily",
    status: "completed",
    icon: "home",
  },
  {
    id: "2",
    title: "เข้าร่วมก๊วน",
    description: "เข้าร่วมก๊วนแบดมินตัน 1 ครั้ง",
    reward: 10,
    progress: 0,
    target: 1,
    type: "daily",
    status: "active",
    icon: "party",
  },
  {
    id: "3",
    title: "โพสต์ในชุมชน",
    description: "สร้างโพสต์ 1 โพสต์",
    reward: 10,
    progress: 0,
    target: 1,
    type: "daily",
    status: "active",
    icon: "blog",
  },
  {
    id: "4",
    title: "นักตีประจำ",
    description: "ตีแบดมินตัน 3 ครั้งในสัปดาห์นี้",
    reward: 30,
    progress: 2,
    target: 3,
    type: "weekly",
    status: "active",
    icon: "shuttlecock",
  },
  {
    id: "5",
    title: "นักรีวิว",
    description: "รีวิวสนามแบดมินตัน 2 แห่ง",
    reward: 25,
    progress: 1,
    target: 2,
    type: "weekly",
    status: "active",
    icon: "star",
  },
  {
    id: "6",
    title: "ชักชวนเพื่อน",
    description: "เชิญเพื่อนเข้าร่วมแอป 3 คน",
    reward: 50,
    progress: 1,
    target: 3,
    type: "weekly",
    status: "active",
    icon: "users",
  },
];

const achievements = [
  {
    id: "a1",
    title: "ก๊วน Master",
    description: "เข้าร่วมก๊วน 50 ครั้ง",
    reward: 100,
    progress: 23,
    target: 50,
    icon: "trophy",
    unlocked: false,
  },
  {
    id: "a2",
    title: "นักเขียนยอดเยี่ยม",
    description: "โพสต์ได้รับ 100 ไลค์",
    reward: 150,
    progress: 67,
    target: 100,
    icon: "heart",
    unlocked: false,
  },
  {
    id: "a3",
    title: "First Blood",
    description: "ชนะแมตช์แรก",
    reward: 20,
    progress: 1,
    target: 1,
    icon: "check",
    unlocked: true,
  },
];

export default function QuestsPage() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "achievement">("daily");
  const [quests, setQuests] = useState(mockQuests);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const dailyQuests = quests.filter((q) => q.type === "daily");
  const weeklyQuests = quests.filter((q) => q.type === "weekly");

  const claimReward = (questId: string) => {
    setClaimingId(questId);
    setTimeout(() => {
      setQuests(
        quests.map((q) =>
          q.id === questId ? { ...q, status: "claimed" as const } : q
        )
      );
      setClaimingId(null);
    }, 800);
  };

  const totalTBEarned = quests
    .filter((q) => q.status === "claimed")
    .reduce((sum, q) => sum + q.reward, 0);

  const QuestCard = ({ quest }: { quest: Quest }) => {
    const isCompleted = quest.progress >= quest.target;
    const isClaimed = quest.status === "claimed";
    const isClaiming = claimingId === quest.id;

    return (
      <GlassCard
        className={cn(
          "p-4 transition-all duration-300",
          isClaimed && "opacity-60",
          isClaiming && "scale-105 ring-2 ring-primary"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isCompleted ? "bg-[#31A24C]/10" : "bg-primary/10"
            )}
          >
            {quest.icon === "home" && <Icons.home className={cn("w-6 h-6", isCompleted ? "text-[#31A24C]" : "text-primary")} />}
            {quest.icon === "party" && <Icons.party className={cn("w-6 h-6", isCompleted ? "text-[#31A24C]" : "text-primary")} />}
            {quest.icon === "blog" && <Icons.blog className={cn("w-6 h-6", isCompleted ? "text-[#31A24C]" : "text-primary")} />}
            {quest.icon === "shuttlecock" && <Icons.shuttlecock className={cn("w-6 h-6", isCompleted ? "text-[#31A24C]" : "text-primary")} />}
            {quest.icon === "star" && <Icons.star className={cn("w-6 h-6", isCompleted ? "text-[#31A24C]" : "text-primary")} />}
            {quest.icon === "users" && <Icons.users className={cn("w-6 h-6", isCompleted ? "text-[#31A24C]" : "text-primary")} />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{quest.title}</h3>
            <p className="text-xs text-muted-foreground">{quest.description}</p>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  {quest.progress}/{quest.target}
                </span>
                <span className="font-semibold text-primary">+{quest.reward} TB</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isCompleted ? "bg-[#31A24C]" : "bg-primary"
                  )}
                  style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            {isClaimed ? (
              <Badge variant="secondary" className="text-xs">
                <Icons.check className="w-3 h-3 mr-1" />
                รับแล้ว
              </Badge>
            ) : isCompleted ? (
              <Button
                size="sm"
                onClick={() => claimReward(quest.id)}
                disabled={isClaiming}
                className={cn(
                  "bg-[#31A24C] hover:bg-[#31A24C]/90",
                  isClaiming && "animate-pulse"
                )}
              >
                {isClaiming ? "..." : "รับ"}
              </Button>
            ) : (
              <div className="w-16" />
            )}
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14 safe-area-top">
          <h1 className="text-xl font-bold text-foreground">ภารกิจ</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
            <Icons.coins className="w-4 h-4 text-primary" />
            <span className="font-semibold text-primary">156 TB</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4">
          {[
            { id: "daily", label: "รายวัน" },
            { id: "weekly", label: "รายสัปดาห์" },
            { id: "achievement", label: "Achievement" },
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
        {/* Streak Card */}
        <GlassCard className="p-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">สตรีคปัจจุบัน</p>
              <p className="text-3xl font-bold">7 วัน</p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    day <= 7 ? "bg-white/30" : "bg-white/10"
                  )}
                >
                  {day <= 7 && <Icons.check className="w-4 h-4" />}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs mt-2 opacity-80">
            เข้าแอปต่อเนื่อง 30 วัน รับโบนัส 100 TB!
          </p>
        </GlassCard>

        {/* Daily Quests */}
        {activeTab === "daily" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">ภารกิจรายวัน</h2>
              <span className="text-xs text-muted-foreground">รีเซ็ตใน 8:32:15</span>
            </div>
            {dailyQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        )}

        {/* Weekly Quests */}
        {activeTab === "weekly" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">ภารกิจรายสัปดาห์</h2>
              <span className="text-xs text-muted-foreground">รีเซ็ตใน 3 วัน</span>
            </div>
            {weeklyQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        )}

        {/* Achievements */}
        {activeTab === "achievement" && (
          <div className="space-y-3">
            <h2 className="font-semibold">Achievement</h2>
            {achievements.map((ach) => (
              <GlassCard
                key={ach.id}
                className={cn("p-4", ach.unlocked && "ring-2 ring-[#F7B928]")}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      ach.unlocked ? "bg-[#F7B928]/20" : "bg-muted"
                    )}
                  >
                    {ach.icon === "trophy" && (
                      <Icons.trophy className={cn("w-6 h-6", ach.unlocked ? "text-[#F7B928]" : "text-muted-foreground")} />
                    )}
                    {ach.icon === "heart" && (
                      <Icons.heart className={cn("w-6 h-6", ach.unlocked ? "text-[#F7B928]" : "text-muted-foreground")} />
                    )}
                    {ach.icon === "check" && (
                      <Icons.check className={cn("w-6 h-6", ach.unlocked ? "text-[#F7B928]" : "text-muted-foreground")} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{ach.title}</h3>
                      {ach.unlocked && (
                        <Badge className="bg-[#F7B928] text-black text-xs">ปลดล็อค</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{ach.description}</p>

                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {ach.progress}/{ach.target}
                        </span>
                        <span className="font-semibold text-[#F7B928]">+{ach.reward} TB</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#F7B928] transition-all duration-500"
                          style={{ width: `${(ach.progress / ach.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
