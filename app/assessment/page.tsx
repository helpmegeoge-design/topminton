"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/ui/level-badge";
import {
  ShuttlecockIcon,
  TrophyIcon,
  ArrowLeftIcon,
  CheckIcon,
  StarIcon,
} from "@/components/icons";

export default function AssessmentPage() {
  const router = useRouter();
  const [currentLevel] = useState<string | null>("normal");

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Header */}
        <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight"
            >
              <ArrowLeftIcon size={20} className="text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              ศูนย์วัดระดับ
            </h1>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-6 pb-24">
          {/* Current Level Card */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                ระดับปัจจุบันของคุณ
              </h2>
              {currentLevel ? (
                <LevelBadge level={currentLevel as any} size="lg" />
              ) : (
                <span className="text-sm text-muted-foreground">
                  ยังไม่ได้ประเมิน
                </span>
              )}
            </div>

            {currentLevel ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckIcon size={16} className="text-green-500" />
                  <span>ผ่านการประเมินเมื่อ 15 ม.ค. 2569</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                    style={{ width: "65%" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  อีก 350 คะแนนถึงระดับ S
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                ทำแบบทดสอบเพื่อประเมินระดับฝีมือของคุณ
              </p>
            )}
          </GlassCard>

          {/* Assessment Options */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground px-1">
              เลือกวิธีการประเมิน
            </h3>

            {/* Basic Quiz */}
            <GlassCard
              className="p-5 cursor-pointer tap-highlight hover:bg-primary/5 transition-colors"
              onClick={() => router.push("/assessment/quiz")}
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShuttlecockIcon size={28} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">
                      แบบทดสอบพื้นฐาน
                    </h4>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      ฟรี
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    ตอบคำถาม 20 ข้อ เกี่ยวกับกติกา เทคนิค และกลยุทธ์
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ClockIcon size={14} />
                      10-15 นาที
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckIcon size={14} />
                      ผลทันที
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Pro Video Assessment */}
            <GlassCard
              className="p-5 cursor-pointer tap-highlight hover:bg-primary/5 transition-colors"
              onClick={() => router.push("/assessment/pro")}
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <TrophyIcon size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">
                      ประเมินระดับมืออาชีพ
                    </h4>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      Premium
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    ส่งคลิปวิดีโอการเล่น ผู้เชี่ยวชาญประเมินพร้อมออกใบรับรอง
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ClockIcon size={14} />
                      2-3 วัน
                    </span>
                    <span className="flex items-center gap-1">
                      <StarIcon size={14} />
                      ใบรับรอง PDF
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* My Certificates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-semibold text-foreground">
                ใบรับรองของฉัน
              </h3>
              <button className="text-sm text-primary font-medium">
                ดูทั้งหมด
              </button>
            </div>

            <GlassCard className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center border border-primary/20">
                  <DocumentIcon size={32} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    ใบรับรองระดับ N
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    ออกเมื่อ 15 ม.ค. 2569
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent">
                      ดาวน์โหลด PDF
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs">
                      แชร์
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Level Guide */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground px-1">
              เกณฑ์ระดับฝีมือ
            </h3>

            <GlassCard className="p-4">
              <div className="space-y-3">
                {[
                  {
                    level: "beginner",
                    name: "หน้าบ้าน",
                    desc: "เริ่มต้น เพิ่งหัดเล่น",
                    points: "0-299",
                  },
                  {
                    level: "bg",
                    name: "BG",
                    desc: "เล่นได้ รู้กติกา",
                    points: "300-599",
                  },
                  {
                    level: "normal",
                    name: "N",
                    desc: "เล่นเป็น มีเทคนิค",
                    points: "600-999",
                  },
                  {
                    level: "strong",
                    name: "S",
                    desc: "เล่นดี แข่งได้",
                    points: "1000-1499",
                  },
                  {
                    level: "pro",
                    name: "P",
                    desc: "ระดับสูง แข่งประจำ",
                    points: "1500-2499",
                  },
                  {
                    level: "champion",
                    name: "C",
                    desc: "ระดับแชมป์",
                    points: "2500+",
                  },
                ].map((item) => (
                  <div
                    key={item.level}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <LevelBadge level={item.level as any} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ClockIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7V12L15 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DocumentIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2V8H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 13H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 17H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
