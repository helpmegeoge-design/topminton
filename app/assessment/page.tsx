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
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function AssessmentPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('skill_level')
            .eq('id', user.id)
            .single();

          if (data?.skill_level) {
            // Map DB value if needed, but LevelBadge likely handles specific strings
            // Our DB values: beginner, intermediate, advanced, strong, pro
            // LevelBadge expects: beginner, bg, normal, strong, pro, champion

            // Mapper:
            // intermediate -> bg
            // advanced -> normal
            let mappedLevel = data.skill_level;
            if (mappedLevel === 'intermediate') mappedLevel = 'bg';
            if (mappedLevel === 'advanced') mappedLevel = 'normal';

            setCurrentLevel(mappedLevel);
          }
        }
      } catch (e) {
        console.error("Error fetching level", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLevel();
  }, []);

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
          {/* Current Level Certificate Card */}
          {/* Current Level Certificate Card - Cyber Edition */}
          <div className="relative group overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl">
            {currentLevel ? (
              <>
                {/* Cyber Glow Background */}
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-600/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-purple-600/10 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                {/* Neon Border Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                <div className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <TrophyIcon size={16} className="text-cyan-400" />
                      <h2 className="text-sm font-semibold text-white/80">
                        สถานะปัจจุบัน
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-medium text-green-400">ใช้งาน</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center mb-6 scale-110 transform transition-transform group-hover:scale-115 duration-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                      <LevelBadge level={currentLevel} size="lg" className="shadow-2xl text-lg px-6 py-2 relative z-10 ring-1 ring-white/20 backdrop-blur-md" />
                    </div>
                    <div className="mt-3 text-xs font-medium text-white/50 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
                      ตรวจสอบโดย AI
                    </div>
                  </div>

                  {/* Tech Divider - Simplified */}
                  <div className="w-full h-px bg-white/10 my-4"></div>

                  <div className="flex flex-col gap-1 text-center mb-5">
                    <p className="text-xs text-white/60">ผู้รับรองโดย</p>
                    <p className="text-sm font-bold text-white tracking-wide">TOP BADMINTON AI</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button size="sm" variant="outline" className="h-9 text-xs font-medium bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-white/30 transition-all gap-2" onClick={() => router.push('/assessment/quiz')}>
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                      ประเมินใหม่
                    </Button>
                    <Button size="sm" className="h-9 text-xs font-bold bg-white text-black hover:bg-cyan-50 border-0 shadow-[0_0_15px_rgba(255,255,255,0.15)] gap-2" onClick={() => router.push(`/assessment/completed?level=${encodeURIComponent(currentLevel)}`)}>
                      <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full"></span>
                      ดูใบรับรอง
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center bg-black/40 backdrop-blur-sm">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-white/10">
                  <TrophyIcon size={24} className="text-white/40" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">
                  ยังไม่มีระดับฝีมือ
                </h2>
                <p className="text-sm text-white/60 mb-6 font-normal">
                  เริ่มการประเมินเพื่อปลดล็อกระดับของคุณ
                </p>
                <Button onClick={() => router.push("/assessment/quiz")} className="w-full bg-white text-black font-bold hover:bg-zinc-200">
                  เริ่มทำแบบทดสอบ
                </Button>
              </div>
            )}
          </div>

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
                    level: "BG-",
                    name: "BG-",
                    desc: "พอตีโดน เริ่มนับแต้มถูก",
                    points: "300-399",
                  },
                  {
                    level: "BG",
                    name: "BG",
                    desc: "เล่นได้ รู้กติกา",
                    points: "400-499",
                  },
                  {
                    level: "BG+",
                    name: "BG+",
                    desc: "เล่นต่อเนื่องได้ ตบได้บ้าง",
                    points: "500-599",
                  },
                  {
                    level: "N-",
                    name: "N-",
                    desc: "วางลูกได้ เริ่มมีกลยุทธ์",
                    points: "600-799",
                  },
                  {
                    level: "N",
                    name: "N",
                    desc: "เล่นเป็น มีเทคนิค",
                    points: "800-999",
                  },
                  {
                    level: "N+",
                    name: "N+",
                    desc: "คุมเกมได้ เทคนิคแพรวพราว",
                    points: "1000-1199",
                  },
                  {
                    level: "P-",
                    name: "P-",
                    desc: "เริ่มแข่งขันระดับรายการ",
                    points: "1200-1499",
                  },
                  {
                    level: "P",
                    name: "P",
                    desc: "ระดับสูง แข่งประจำ",
                    points: "1500-1999",
                  },
                  {
                    level: "P+",
                    name: "P+",
                    desc: "ระดับล่ารางวัล เก่งมาก",
                    points: "2000-2499",
                  },
                  {
                    level: "B",
                    name: "B",
                    desc: "กึ่งอาชีพ / นักกีฬา",
                    points: "2500-2999",
                  },
                  {
                    level: "A",
                    name: "A",
                    desc: "ระดับประเทศ / มืออาชีพ",
                    points: "3000+",
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
