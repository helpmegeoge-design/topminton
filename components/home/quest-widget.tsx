"use client";

import Link from "next/link";
import { Icons } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Quest {
  id: string;
  title: string;
  progress: number;
  target: number;
  reward: number;
  type: "daily" | "weekly";
}

interface QuestWidgetProps {
  quests?: Quest[];
  streak?: number;
}

const defaultQuests: Quest[] = [
  {
    id: "1",
    title: "ตีแบด 1 ครั้ง",
    progress: 0,
    target: 1,
    reward: 10,
    type: "daily",
  },
  {
    id: "2",
    title: "เข้าร่วมก๊วน 3 ครั้ง",
    progress: 2,
    target: 3,
    reward: 50,
    type: "weekly",
  },
];

export function QuestWidget({ quests = defaultQuests, streak = 5 }: QuestWidgetProps) {
  const completedQuests = quests.filter((q) => q.progress >= q.target).length;
  const totalQuests = quests.length;
  const hasClaimable = quests.some((q) => q.progress >= q.target);

  return (
    <Link href="/quests" className="block">
      <div className="puffy-card p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD93D]/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3 relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icons.trophy className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                ภารกิจของฉัน
              </h3>
              <p className="text-xs text-muted-foreground">
                {completedQuests}/{totalQuests} สำเร็จ
              </p>
            </div>
          </div>
          
          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-[#F7B928]/10 rounded-full">
              <span className="text-[#F7B928] text-xs">🔥</span>
              <span className="text-xs font-bold text-[#F7B928]">{streak} วัน</span>
            </div>
          )}
        </div>

        {/* Quest Items */}
        <div className="space-y-2 mb-3">
          {quests.slice(0, 2).map((quest) => {
            const isCompleted = quest.progress >= quest.target;
            const progressPercent = Math.min(
              (quest.progress / quest.target) * 100,
              100
            );

            return (
              <div
                key={quest.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  isCompleted ? "bg-[#31A24C]/10" : "bg-muted/50"
                )}
              >
                {/* Status Icon */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    isCompleted ? "bg-[#31A24C]" : "bg-muted"
                  )}
                >
                  {isCompleted ? (
                    <Icons.check className="w-3 h-3 text-white" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {quest.progress}/{quest.target}
                    </span>
                  )}
                </div>

                {/* Quest Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isCompleted
                        ? "text-[#31A24C] line-through"
                        : "text-foreground"
                    )}
                  >
                    {quest.title}
                  </p>
                  {!isCompleted && (
                    <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Reward */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs font-bold text-[#F7B928]">
                    +{quest.reward}
                  </span>
                  <span className="text-[10px] text-muted-foreground">TB</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            รีเซ็ตใน 8 ชม.
          </span>
          
          {hasClaimable ? (
            <Button size="sm" className="h-7 text-xs px-3 animate-pulse">
              รับรางวัล
            </Button>
          ) : (
            <div className="flex items-center gap-1 text-primary text-xs font-medium">
              <span>ดูทั้งหมด</span>
              <Icons.chevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
