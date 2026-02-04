"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/ui/level-badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Types matching our DB + UI needs
type RankingProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  skill_level: string;
  wins: number;
  losses: number;
  total_games: number;
  // Computed
  rank: number;
  isMe: boolean;
  canChallenge: boolean;
};

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"global" | "ladder" | "season">("global");
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<RankingProfile | null>(null);

  const [rankingData, setRankingData] = useState<RankingProfile[]>([]);
  const [myRanking, setMyRanking] = useState<RankingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Ranking Data
  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch profiles. 
        // We still grab by points to likely get relevant players if points exist,
        // but we will mainly re-sort by Skill Level as requested.
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(100); // Fetch a bit more to ensure we cover high skills if points are 0

        if (error) {
          console.error("Error fetching ranking:", error);
          return;
        }

        if (profiles) {
          // 1. Helper for Skill Weight
          const getLevelWeight = (level: string) => {
            const l = (level || '').toLowerCase();
            if (l === 'a') return 13;
            if (l === 'b') return 12;
            if (l === 'p+') return 11;
            if (l === 'p') return 10;
            if (l === 'p-') return 9;
            if (l === 's') return 8;
            if (l === 'n+') return 7;
            if (l === 'n') return 6;
            if (l === 'n-') return 5;
            if (l === 'bg+') return 4;
            if (l === 'bg') return 3;
            if (l === 'bg-') return 2;
            if (l === 'beginner') return 1;
            return 0;
          };

          // 2. Sort Logic: Skill Level > Points > Win Rate
          const sortedProfiles = profiles.sort((a, b) => {
            const weightA = getLevelWeight(a.skill_level);
            const weightB = getLevelWeight(b.skill_level);

            // Primary: Skill Level (High to Low)
            if (weightA !== weightB) {
              return weightB - weightA;
            }

            // Secondary: Points
            const pointsA = a.points || 0;
            const pointsB = b.points || 0;
            if (pointsA !== pointsB) {
              return pointsB - pointsA;
            }

            // Tertiary: Win Rate (Wins / Total) logic or just Wins
            return (b.wins || 0) - (a.wins || 0);
          });

          // Take top 50 after sorting
          const finalSlice = sortedProfiles.slice(0, 50);

          // 3. Map to View Model
          let myRankInfo = null;

          const formatted: RankingProfile[] = finalSlice.map((p, index) => {
            const rank = index + 1;
            const isMe = user ? p.id === user.id : false;

            const profileData = {
              id: p.id,
              display_name: p.display_name || "Unknown Player",
              avatar_url: p.avatar_url,
              points: p.points || 0,
              skill_level: p.skill_level || "beginner",
              wins: p.wins || 0,
              losses: p.losses || 0,
              total_games: p.total_games || 0,
              rank,
              isMe,
              canChallenge: false
            };

            if (isMe) {
              myRankInfo = profileData;
            }

            return profileData;
          });

          // Challenge Logic
          if (myRankInfo) {
            const myRank = (myRankInfo as RankingProfile).rank;
            formatted.forEach(p => {
              if (p.rank < myRank && p.rank >= myRank - 3) {
                p.canChallenge = true;
              }
            });
            setMyRanking(myRankInfo);
          } else {
            // If I'm not in top 50, fetch my specific data separately?
            // For now, let's leave it null or maybe we should handle it.
            // But UI handles null myRanking roughly.
          }

          setRankingData(formatted);
        }

      } catch (err) {
        console.error("Ranking fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const handleChallenge = (player: RankingProfile) => {
    setSelectedPlayer(player);
    setShowChallengeModal(true);
  };

  const topPlayers = rankingData.slice(0, 3);
  const restPlayers = rankingData.slice(3);

  // Fallback if empty
  if (!loading && rankingData.length === 0) {
    return (
      <AppShell>
        <div className="p-10 text-center">
          <p>ไม่พบข้อมูลการจัดอันดับ</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14 safe-area-top">
          <h1 className="text-xl font-bold text-foreground">อันดับ</h1>
          <Link href="/ranking/history" className="text-sm text-primary">
            ประวัติ
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex px-4">
          {[
            { id: "global", label: "Global Ranking" },
            { id: "ladder", label: "Ladder" },
            { id: "season", label: "Season" },
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

      {loading ? (
        <div className="p-8 text-center animate-pulse">
          <div className="h-40 bg-muted/20 rounded-xl mb-4"></div>
          <div className="h-8 bg-muted/20 rounded-full w-1/2 mx-auto mb-2"></div>
          <p className="text-muted-foreground">กำลังโหลดอันดับเหล่านักแบด...</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* My Stats Card */}
          {myRanking && (
            <GlassCard className="p-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image
                    src={myRanking.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"}
                    alt="Me"
                    width={64}
                    height={64}
                    className="rounded-full ring-2 ring-white/30 object-cover bg-white/10"
                  />
                  <div className="absolute -bottom-1 -right-1">
                    <LevelBadge level={myRanking.skill_level} size="sm" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm opacity-80">อันดับของคุณ</p>
                  <p className="text-3xl font-bold">#{myRanking.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-80">Points</p>
                  <p className="text-2xl font-bold">{myRanking.points}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <p className="text-lg font-bold">{myRanking.wins}</p>
                  <p className="text-xs opacity-80">ชนะ</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{myRanking.losses}</p>
                  <p className="text-xs opacity-80">แพ้</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {myRanking.total_games > 0
                      ? Math.round((myRanking.wins / myRanking.total_games) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs opacity-80">อัตราชนะ</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Global Ranking Tab */}
          {activeTab === "global" && (
            <>
              {/* Top 3 Podium */}
              {topPlayers.length > 0 && (
                <div className="flex items-end justify-center gap-2 py-4">
                  {/* 2nd Place */}
                  {topPlayers[1] && (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 relative rounded-full ring-2 ring-[#C0C0C0] overflow-hidden">
                        <Image
                          src={topPlayers[1].avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                          alt={topPlayers[1].display_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="w-16 h-20 mt-2 rounded-t-lg bg-gradient-to-t from-[#C0C0C0] to-[#E8E8E8] flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">2</span>
                      </div>
                      <p className="text-xs font-medium mt-1 text-center line-clamp-1 w-16">{topPlayers[1].display_name}</p>
                      <p className="text-xs text-muted-foreground">{topPlayers[1].points}</p>
                    </div>
                  )}

                  {/* 1st Place */}
                  {topPlayers[0] && (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <Icons.crown className="w-6 h-6 text-[#F7B928] absolute -top-6 left-1/2 -translate-x-1/2" />
                        <div className="w-20 h-20 relative rounded-full ring-4 ring-[#F7B928] overflow-hidden">
                          <Image
                            src={topPlayers[0].avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200"}
                            alt={topPlayers[0].display_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="w-20 h-28 mt-2 rounded-t-lg bg-gradient-to-t from-[#F7B928] to-[#FFD700] flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">1</span>
                      </div>
                      <p className="text-xs font-medium mt-1 text-center line-clamp-1 w-20">{topPlayers[0].display_name}</p>
                      <p className="text-xs text-muted-foreground">{topPlayers[0].points}</p>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topPlayers[2] && (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 relative rounded-full ring-2 ring-[#CD7F32] overflow-hidden">
                        <Image
                          src={topPlayers[2].avatar_url || "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200"}
                          alt={topPlayers[2].display_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="w-14 h-16 mt-2 rounded-t-lg bg-gradient-to-t from-[#CD7F32] to-[#E8A858] flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-white">3</span>
                      </div>
                      <p className="text-xs font-medium mt-1 text-center line-clamp-1 w-14">{topPlayers[2].display_name}</p>
                      <p className="text-xs text-muted-foreground">{topPlayers[2].points}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Full Ranking List */}
              <GlassCard className="p-4">
                <h3 className="font-semibold mb-3">อันดับทั้งหมด</h3>
                <div className="space-y-2">
                  {restPlayers.map((player) => (
                    <div
                      key={player.rank}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl",
                        player.isMe ? "bg-primary/10 ring-1 ring-primary" : "bg-muted/50"
                      )}
                    >
                      <span className="w-8 text-center font-bold text-muted-foreground">
                        {player.rank}
                      </span>
                      <div className="w-10 h-10 relative rounded-full overflow-hidden flex-shrink-0 bg-muted">
                        <Image
                          src={player.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                          alt={player.display_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium text-sm truncate", player.isMe && "text-primary")}>
                          {player.display_name}
                        </p>
                        <LevelBadge level={player.skill_level} size="sm" className="scale-75 origin-left" />
                      </div>
                      <span className="font-semibold text-primary">{player.points}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          )}

          {/* Ladder Tab */}
          {activeTab === "ladder" && (
            <>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Icons.info className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">กติกา Ladder</p>
                    <p className="text-xs text-muted-foreground">
                      ท้าได้เฉพาะผู้เล่นที่อันดับสูงกว่าไม่เกิน 3 อันดับ หากชนะจะสลับอันดับกัน
                    </p>
                  </div>
                </div>
              </div>

              <GlassCard className="p-4">
                <h3 className="font-semibold mb-3">บันไดอันดับ</h3>
                <div className="space-y-2">
                  {rankingData.map((player) => (
                    <div
                      key={player.rank}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all",
                        player.isMe ? "bg-primary/10 ring-1 ring-primary" : "bg-muted/50",
                        player.canChallenge && "hover:ring-1 hover:ring-[#31A24C]"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                        player.rank <= 3 && "bg-[#F7B928]/20 text-[#F7B928]",
                        player.rank > 3 && "bg-muted text-muted-foreground"
                      )}>
                        {player.rank}
                      </div>
                      <div className="w-10 h-10 relative rounded-full overflow-hidden flex-shrink-0 bg-muted">
                        <Image
                          src={player.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                          alt={player.display_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium text-sm truncate", player.isMe && "text-primary")}>
                          {player.display_name} {player.isMe && "(คุณ)"}
                        </p>
                        <p className="text-xs text-muted-foreground">{player.points} pts</p>
                      </div>
                      {player.canChallenge && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#31A24C] border-[#31A24C] bg-transparent"
                          onClick={() => handleChallenge(player)}
                        >
                          ท้าแข่ง
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          )}

          {/* Season Tab */}
          {activeTab === "season" && myRanking && (
            <>
              <GlassCard className="p-4 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-80">Season 1 - 2569</p>
                    <p className="text-xs opacity-60">สิ้นสุด 31 มี.ค. 2569</p>
                  </div>
                  <Badge className="bg-white/20 text-white">กำลังดำเนินการ</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm opacity-80">อันดับ Season</p>
                    <p className="text-3xl font-bold">#{myRanking.rank}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm opacity-80 mb-1">คะแนนสะสม</p>
                    <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((myRanking.points / 1000) * 100, 100)}%` }} />
                    </div>
                    <p className="text-xs mt-1">{myRanking.points} / 1000 pts</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="font-semibold mb-3">รางวัล Season</h3>
                <div className="space-y-3">
                  {[
                    { rank: "Top 1", reward: "กรอบ Champion + 500 TB", color: "#F7B928" },
                    { rank: "Top 2-3", reward: "กรอบ Elite + 300 TB", color: "#C0C0C0" },
                    { rank: "Top 4-10", reward: "กรอบ Pro + 100 TB", color: "#CD7F32" },
                    { rank: "Top 11-50", reward: "50 TB", color: "#FF9500" },
                  ].map((tier) => (
                    <div key={tier.rank} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${tier.color}20` }}
                      >
                        <span style={{ color: tier.color }}>
                          <Icons.trophy className="w-5 h-5" />
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{tier.rank}</p>
                        <p className="text-xs text-muted-foreground">{tier.reward}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          )}
        </div>
      )}

      {/* Challenge Modal */}
      {showChallengeModal && selectedPlayer && myRanking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm p-6 bg-card">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-4">ท้าแข่ง</h3>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center flex flex-col items-center">
                  <div className="w-14 h-14 relative rounded-full overflow-hidden">
                    <Image
                      src={myRanking.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200"}
                      alt="Me"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">คุณ</p>
                  <p className="text-xs text-muted-foreground">#{myRanking.rank}</p>
                </div>

                <div className="text-2xl font-bold text-primary">VS</div>

                <div className="text-center flex flex-col items-center">
                  <div className="w-14 h-14 relative rounded-full overflow-hidden">
                    <Image
                      src={selectedPlayer.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                      alt={selectedPlayer.display_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">{selectedPlayer.display_name}</p>
                  <p className="text-xs text-muted-foreground">#{selectedPlayer.rank}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                หากชนะ คุณจะขยับขึ้นมาอันดับ #{selectedPlayer.rank}
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowChallengeModal(false)}
                >
                  ยกเลิก
                </Button>
                <Button className="flex-1">
                  ส่งคำท้า
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </AppShell>
  );
}
