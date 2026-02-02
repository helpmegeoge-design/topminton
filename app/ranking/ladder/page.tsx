"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

type Tab = "ladder" | "history" | "rules";

const ladderPlayers = [
  { rank: 1, name: "แชมป์ ณรงค์", avatar: "/images/avatars/avatar-1.jpg", level: "pro", wins: 45, losses: 5, canChallenge: false },
  { rank: 2, name: "นัท สุวรรณ", avatar: "/images/avatars/avatar-2.jpg", level: "pro", wins: 38, losses: 12, canChallenge: false },
  { rank: 3, name: "กิม จิตรา", avatar: "/images/avatars/avatar-3.jpg", level: "strong", wins: 32, losses: 18, canChallenge: false },
  { rank: 4, name: "สมชาย ใจดี", avatar: "/images/avatars/avatar-4.jpg", level: "strong", wins: 28, losses: 22, canChallenge: true },
  { rank: 5, name: "วิชัย รักแบด", avatar: "/images/avatars/avatar-1.jpg", level: "normal", wins: 25, losses: 25, canChallenge: true },
  { rank: 6, name: "คุณ (You)", avatar: "/images/avatars/avatar-2.jpg", level: "normal", wins: 20, losses: 20, isMe: true, canChallenge: false },
  { rank: 7, name: "สุภาพ ดีใจ", avatar: "/images/avatars/avatar-3.jpg", level: "normal", wins: 18, losses: 22, canChallenge: false },
  { rank: 8, name: "ปรีชา เก่ง", avatar: "/images/avatars/avatar-4.jpg", level: "bg", wins: 15, losses: 25, canChallenge: false },
];

const challengeHistory = [
  { id: "1", opponent: "วิชัย รักแบด", opponentAvatar: "/images/avatars/avatar-1.jpg", result: "win", score: "21-18, 21-15", date: "25 ม.ค. 2568", rankChange: "+1" },
  { id: "2", opponent: "กิม จิตรา", opponentAvatar: "/images/avatars/avatar-3.jpg", result: "loss", score: "18-21, 21-19, 15-21", date: "20 ม.ค. 2568", rankChange: "0" },
  { id: "3", opponent: "สุภาพ ดีใจ", opponentAvatar: "/images/avatars/avatar-3.jpg", result: "win", score: "21-12, 21-16", date: "15 ม.ค. 2568", rankChange: "+1" },
];

const levelColors: Record<string, string> = {
  pro: "bg-[#FA383E] text-white",
  strong: "bg-[#F7B928] text-white",
  normal: "bg-[#31A24C] text-white",
  bg: "bg-[#FF9500] text-white",
  beginner: "bg-[#65676B] text-white",
};

export default function LadderPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ladder");
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<typeof ladderPlayers[0] | null>(null);

  const handleChallenge = (player: typeof ladderPlayers[0]) => {
    setSelectedPlayer(player);
    setShowChallengeModal(true);
  };

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
              <h1 className="text-lg font-semibold">Ladder Board</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              { id: "ladder" as Tab, label: "บันได" },
              { id: "history" as Tab, label: "ประวัติ" },
              { id: "rules" as Tab, label: "กติกา" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors relative",
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {/* Ladder Tab */}
          {activeTab === "ladder" && (
            <div className="space-y-3">
              {/* My Position */}
              <GlassCard className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">#6</p>
                    <p className="text-xs text-muted-foreground">อันดับของคุณ</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-sm text-muted-foreground">สถิติ</p>
                    <p className="font-semibold">20W - 20L</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="font-semibold text-primary">50%</p>
                  </div>
                </div>
              </GlassCard>

              {/* Ladder List */}
              {ladderPlayers.map((player, index) => (
                <GlassCard 
                  key={player.rank} 
                  className={cn(
                    "p-3 flex items-center gap-3 transition-all",
                    player.isMe && "ring-2 ring-primary bg-primary/5"
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                    player.rank === 1 ? "bg-[#F7B928] text-white" :
                    player.rank === 2 ? "bg-[#9CA3AF] text-white" :
                    player.rank === 3 ? "bg-[#D97706] text-white" :
                    "bg-muted text-foreground"
                  )}>
                    {player.rank}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <img 
                      src={player.avatar || "/placeholder.svg"} 
                      alt={player.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className={cn(
                      "absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase",
                      levelColors[player.level]
                    )}>
                      {player.level}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {player.name}
                      {player.isMe && <span className="text-primary ml-1">(คุณ)</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {player.wins}W - {player.losses}L
                    </p>
                  </div>

                  {/* Challenge Button */}
                  {player.canChallenge && (
                    <Button 
                      size="sm" 
                      onClick={() => handleChallenge(player)}
                      className="bg-[#FA383E] hover:bg-[#FA383E]/90"
                    >
                      ท้าแข่ง
                    </Button>
                  )}

                  {/* Connection Line */}
                  {index < ladderPlayers.length - 1 && (
                    <div className="absolute left-7 top-full w-0.5 h-3 bg-border" />
                  )}
                </GlassCard>
              ))}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {challengeHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Icons.trophy className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">ยังไม่มีประวัติการท้าแข่ง</p>
                </div>
              ) : (
                challengeHistory.map((match) => (
                  <GlassCard key={match.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={match.opponentAvatar || "/placeholder.svg"} 
                        alt={match.opponent}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{match.opponent}</p>
                        <p className="text-sm text-muted-foreground">{match.date}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          match.result === "win" 
                            ? "bg-[#31A24C]/10 text-[#31A24C]" 
                            : "bg-[#FA383E]/10 text-[#FA383E]"
                        )}>
                          {match.result === "win" ? "ชนะ" : "แพ้"}
                        </span>
                        <p className="text-xs mt-1 text-muted-foreground">{match.score}</p>
                        {match.rankChange !== "0" && (
                          <p className={cn(
                            "text-xs font-medium",
                            match.rankChange.startsWith("+") ? "text-[#31A24C]" : "text-[#FA383E]"
                          )}>
                            อันดับ {match.rankChange}
                          </p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === "rules" && (
            <div className="space-y-4">
              <GlassCard className="p-4">
                <h3 className="font-semibold mb-3">กติกา Ladder Board</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>ท้าแข่งได้เฉพาะคนที่อันดับสูงกว่าไม่เกิน 3 ขั้น</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>หากชนะ จะสลับอันดับกับผู้แพ้</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>หากแพ้ อันดับคงเดิม</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <span>ต้องตอบรับการท้าแข่งภายใน 7 วัน</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">5.</span>
                    <span>แข่ง Best of 3 เกม (21 แต้ม)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">6.</span>
                    <span>หากไม่ตอบรับภายใน 7 วัน ถือว่ายอมแพ้</span>
                  </li>
                </ul>
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="font-semibold mb-3">ข้อควรรู้</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Icons.info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Ladder จะ Reset ทุกต้น Season ใหม่</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>ท้าแข่งได้ไม่จำกัดจำนวนครั้งต่อเดือน</span>
                  </li>
                </ul>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Challenge Modal */}
        {showChallengeModal && selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <GlassCard className="w-full max-w-sm p-6 animate-in zoom-in-95">
              <div className="text-center mb-6">
                <img 
                  src={selectedPlayer.avatar || "/placeholder.svg"} 
                  alt={selectedPlayer.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3 ring-4 ring-[#FA383E]/20"
                />
                <h3 className="text-lg font-semibold">{selectedPlayer.name}</h3>
                <p className="text-sm text-muted-foreground">อันดับ #{selectedPlayer.rank}</p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-center">
                  คุณต้องการท้าแข่ง <span className="font-semibold">{selectedPlayer.name}</span>
                  <br />
                  หากชนะ คุณจะขึ้นไปอันดับ #{selectedPlayer.rank}
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-transparent"
                  onClick={() => setShowChallengeModal(false)}
                >
                  ยกเลิก
                </Button>
                <Button 
                  className="flex-1 bg-[#FA383E] hover:bg-[#FA383E]/90"
                  onClick={() => {
                    setShowChallengeModal(false);
                    // TODO: Send challenge request
                  }}
                >
                  ยืนยันท้าแข่ง
                </Button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </AppShell>
  );
}
