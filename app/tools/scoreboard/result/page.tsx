"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock match data
const mockMatchData = {
  date: "29 ม.ค. 2569",
  time: "18:30",
  duration: "45 นาที",
  court: "สนามแบดมินตัน S.T. คอร์ท 3",
  teamA: {
    name: "ทีม A",
    color: "blue",
    players: [
      { name: "สมชาย", avatar: "/images/avatars/avatar-1.jpg" },
      { name: "วิชัย", avatar: "/images/avatars/avatar-3.jpg" },
    ],
  },
  teamB: {
    name: "ทีม B",
    color: "red",
    players: [
      { name: "สุภาพ", avatar: "/images/avatars/avatar-2.jpg" },
      { name: "ปรีชา", avatar: "/images/avatars/avatar-4.jpg" },
    ],
  },
  sets: [
    { teamA: 21, teamB: 18 },
    { teamA: 19, teamB: 21 },
    { teamA: 21, teamB: 15 },
  ],
  winner: "A",
  stats: {
    teamA: {
      smashes: 24,
      drops: 18,
      clears: 32,
      errors: 12,
      aces: 5,
    },
    teamB: {
      smashes: 20,
      drops: 22,
      clears: 28,
      errors: 15,
      aces: 3,
    },
  },
};

export default function ScoreboardResultPage() {
  const router = useRouter();
  const [showAnimation, setShowAnimation] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "stats" | "sets">(
    "summary"
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const totalSetsA = mockMatchData.sets.filter(
    (s) => s.teamA > s.teamB
  ).length;
  const totalSetsB = mockMatchData.sets.filter(
    (s) => s.teamB > s.teamA
  ).length;

  // Winner Animation Overlay
  if (showAnimation) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-primary/90 to-primary flex items-center justify-center z-50">
        <div className="text-center animate-in zoom-in-50 duration-500">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
            <TrophyIcon size={64} className="text-yellow-300" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ชนะ!</h1>
          <p className="text-xl text-white/80">
            {mockMatchData.winner === "A"
              ? mockMatchData.teamA.name
              : mockMatchData.teamB.name}
          </p>
          <p className="text-lg text-white/60 mt-2">
            {totalSetsA} - {totalSetsB}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Header */}
        <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/tools/scoreboard")}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight"
            >
              <ArrowLeftIcon size={20} className="text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">ผลการแข่ง</h1>
            <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight">
              <ShareIcon size={20} className="text-foreground" />
            </button>
          </div>
        </header>

        {/* Score Header */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent p-6">
          <div className="flex items-center justify-between">
            {/* Team A */}
            <div className="flex-1 text-center">
              <div className="flex justify-center -space-x-2 mb-2">
                {mockMatchData.teamA.players.map((player, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-blue-100 border-2 border-white overflow-hidden"
                  >
                    <img
                      src={player.avatar || "/images/avatars/default-avatar.jpg"}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="font-semibold text-foreground">
                {mockMatchData.teamA.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {mockMatchData.teamA.players.map((p) => p.name).join(", ")}
              </p>
            </div>

            {/* Score */}
            <div className="px-6">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-5xl font-bold",
                    mockMatchData.winner === "A"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {totalSetsA}
                </span>
                <span className="text-2xl text-muted-foreground">-</span>
                <span
                  className={cn(
                    "text-5xl font-bold",
                    mockMatchData.winner === "B"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  )}
                >
                  {totalSetsB}
                </span>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-1">
                Final
              </p>
            </div>

            {/* Team B */}
            <div className="flex-1 text-center">
              <div className="flex justify-center -space-x-2 mb-2">
                {mockMatchData.teamB.players.map((player, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-red-100 border-2 border-white overflow-hidden"
                  >
                    <img
                      src={player.avatar || "/images/avatars/default-avatar.jpg"}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="font-semibold text-foreground">
                {mockMatchData.teamB.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {mockMatchData.teamB.players.map((p) => p.name).join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 py-2 border-b border-border/50">
          <div className="flex gap-2">
            {[
              { key: "summary", label: "สรุป" },
              { key: "sets", label: "รายเซต" },
              { key: "stats", label: "สถิติ" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 pb-24">
          {activeTab === "summary" && (
            <>
              {/* Match Info */}
              <GlassCard className="p-4">
                <h3 className="font-semibold text-foreground mb-3">
                  ข้อมูลการแข่ง
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">วันที่</span>
                    <span className="text-foreground">{mockMatchData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">เวลาเริ่ม</span>
                    <span className="text-foreground">{mockMatchData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ระยะเวลา</span>
                    <span className="text-foreground">
                      {mockMatchData.duration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">สนาม</span>
                    <span className="text-foreground">{mockMatchData.court}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Winner Card */}
              <GlassCard className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <TrophyIcon size={24} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-yellow-700">ผู้ชนะ</p>
                    <p className="text-lg font-bold text-yellow-900">
                      {mockMatchData.winner === "A"
                        ? mockMatchData.teamA.name
                        : mockMatchData.teamB.name}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {mockMatchData.stats.teamA.smashes +
                      mockMatchData.stats.teamB.smashes}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Smashes</p>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {mockMatchData.stats.teamA.aces +
                      mockMatchData.stats.teamB.aces}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Aces</p>
                </GlassCard>
              </div>
            </>
          )}

          {activeTab === "sets" && (
            <div className="space-y-3">
              {mockMatchData.sets.map((set, index) => (
                <GlassCard key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      เซตที่ {index + 1}
                    </span>
                    {set.teamA > set.teamB ? (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {mockMatchData.teamA.name} ชนะ
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        {mockMatchData.teamB.name} ชนะ
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-muted-foreground">
                        {mockMatchData.teamA.name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        set.teamA > set.teamB
                          ? "text-blue-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {set.teamA}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm text-muted-foreground">
                        {mockMatchData.teamB.name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        set.teamB > set.teamA
                          ? "text-red-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {set.teamB}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {activeTab === "stats" && (
            <GlassCard className="p-4">
              <div className="space-y-4">
                {[
                  { label: "Smashes", keyA: "smashes", keyB: "smashes" },
                  { label: "Drop Shots", keyA: "drops", keyB: "drops" },
                  { label: "Clears", keyA: "clears", keyB: "clears" },
                  { label: "Errors", keyA: "errors", keyB: "errors" },
                  { label: "Aces", keyA: "aces", keyB: "aces" },
                ].map((stat) => {
                  const valueA =
                    mockMatchData.stats.teamA[
                      stat.keyA as keyof typeof mockMatchData.stats.teamA
                    ];
                  const valueB =
                    mockMatchData.stats.teamB[
                      stat.keyB as keyof typeof mockMatchData.stats.teamB
                    ];
                  const total = valueA + valueB;
                  const percentA = total > 0 ? (valueA / total) * 100 : 50;

                  return (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-blue-600 font-medium">
                          {valueA}
                        </span>
                        <span className="text-muted-foreground">
                          {stat.label}
                        </span>
                        <span className="text-red-600 font-medium">{valueB}</span>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                        <div
                          className="bg-blue-500 transition-all duration-500"
                          style={{ width: `${percentA}%` }}
                        />
                        <div
                          className="bg-red-500 transition-all duration-500"
                          style={{ width: `${100 - percentA}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button className="w-full h-12">แชร์ผลการแข่ง</Button>
            <Button
              variant="outline"
              className="w-full h-12 bg-transparent"
              onClick={() => router.push("/tools/scoreboard")}
            >
              เริ่มเกมใหม่
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TrophyIcon({
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
        d="M8 21H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 17V21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 4H17V8C17 12.4183 14.7614 17 12 17C9.23858 17 7 12.4183 7 8V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M17 8H19C20.1046 8 21 7.10457 21 6V5C21 4.44772 20.5523 4 20 4H17"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 8H5C3.89543 8 3 7.10457 3 6V5C3 4.44772 3.44772 4 4 4H7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ArrowLeftIcon({
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
        d="M15 19L8 12L15 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon({
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
        d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
