"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type MatchStatus = "upcoming" | "live" | "completed";

interface Player {
  id: string;
  name: string;
  avatar: string;
  seed?: number;
}

interface Match {
  id: string;
  round: number;
  position: number;
  player1: Player | null;
  player2: Player | null;
  score1?: number;
  score2?: number;
  winner?: string;
  status: MatchStatus;
  court?: string;
  time?: string;
}

// Mock bracket data - Single Elimination 8 players
const mockBracket: Match[] = [
  // Round 1 (Quarter Finals)
  {
    id: "qf1",
    round: 1,
    position: 1,
    player1: { id: "1", name: "แชมป์ ณรงค์", avatar: "/images/avatars/avatar-1.jpg", seed: 1 },
    player2: { id: "8", name: "อารี สวย", avatar: "/images/avatars/avatar-4.jpg", seed: 8 },
    score1: 21,
    score2: 15,
    winner: "1",
    status: "completed",
  },
  {
    id: "qf2",
    round: 1,
    position: 2,
    player1: { id: "4", name: "สมชาย ใจดี", avatar: "/images/avatars/avatar-1.jpg", seed: 4 },
    player2: { id: "5", name: "วิชัย รักแบด", avatar: "/images/avatars/avatar-3.jpg", seed: 5 },
    score1: 21,
    score2: 18,
    winner: "4",
    status: "completed",
  },
  {
    id: "qf3",
    round: 1,
    position: 3,
    player1: { id: "3", name: "กิม จิตรา", avatar: "/images/avatars/avatar-2.jpg", seed: 3 },
    player2: { id: "6", name: "สุภาพ ดีใจ", avatar: "/images/avatars/avatar-2.jpg", seed: 6 },
    score1: 18,
    score2: 21,
    winner: "6",
    status: "completed",
  },
  {
    id: "qf4",
    round: 1,
    position: 4,
    player1: { id: "2", name: "นัท สุวรรณ", avatar: "/images/avatars/avatar-3.jpg", seed: 2 },
    player2: { id: "7", name: "ปรีชา เก่ง", avatar: "/images/avatars/avatar-1.jpg", seed: 7 },
    status: "live",
    score1: 15,
    score2: 12,
    court: "Court 1",
    time: "กำลังแข่ง",
  },
  // Round 2 (Semi Finals)
  {
    id: "sf1",
    round: 2,
    position: 1,
    player1: { id: "1", name: "แชมป์ ณรงค์", avatar: "/images/avatars/avatar-1.jpg" },
    player2: { id: "4", name: "สมชาย ใจดี", avatar: "/images/avatars/avatar-1.jpg" },
    status: "upcoming",
    time: "14:00",
    court: "Court 1",
  },
  {
    id: "sf2",
    round: 2,
    position: 2,
    player1: { id: "6", name: "สุภาพ ดีใจ", avatar: "/images/avatars/avatar-2.jpg" },
    player2: null,
    status: "upcoming",
    time: "14:30",
    court: "Court 2",
  },
  // Round 3 (Final)
  {
    id: "f1",
    round: 3,
    position: 1,
    player1: null,
    player2: null,
    status: "upcoming",
    time: "16:00",
    court: "Court 1",
  },
];

const roundNames: Record<number, string> = {
  1: "รอบ 8 คน",
  2: "รอบรองชนะเลิศ",
  3: "รอบชิงชนะเลิศ",
};

export default function TournamentBracketPage() {
  const params = useParams();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const rounds = [1, 2, 3];

  const getMatchesByRound = (round: number) => {
    return mockBracket.filter((m) => m.round === round).sort((a, b) => a.position - b.position);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link href={`/tournament/${params.id}`}>
              <Button variant="ghost" size="icon" className="tap-highlight">
                <Icons.chevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">
              สายการแข่งขัน
            </h1>
          </div>
          <Button variant="ghost" size="icon">
            <Icons.maximize className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Bracket View */}
      <main className="p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-24">
          {rounds.map((round) => (
            <div key={round} className="flex flex-col">
              {/* Round Header */}
              <div className="text-center mb-4">
                <h2 className="text-sm font-semibold text-foreground">
                  {roundNames[round]}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {getMatchesByRound(round).length} แมตช์
                </p>
              </div>

              {/* Matches */}
              <div
                className="flex flex-col gap-4"
                style={{
                  marginTop: round > 1 ? `${(round - 1) * 40}px` : 0,
                }}
              >
                {getMatchesByRound(round).map((match) => (
                  <div
                    key={match.id}
                    className={cn(
                      "relative",
                      round > 1 && `mb-${(round - 1) * 8}`
                    )}
                    style={{
                      marginBottom: round > 1 ? `${(round - 1) * 48}px` : 0,
                    }}
                  >
                    <GlassCard
                      className={cn(
                        "w-48 p-3 cursor-pointer transition-all",
                        "hover:shadow-lg active:scale-[0.98]",
                        match.status === "live" && "ring-2 ring-[#FA383E] animate-pulse"
                      )}
                      onClick={() => setSelectedMatch(match)}
                    >
                      {/* Status Badge */}
                      {match.status === "live" && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#FA383E] text-white text-[10px] font-bold rounded-full">
                          LIVE
                        </div>
                      )}

                      {/* Player 1 */}
                      <div
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg",
                          match.winner === match.player1?.id && "bg-[#31A24C]/10"
                        )}
                      >
                        {match.player1 ? (
                          <>
                            <img
                              src={match.player1.avatar || "/placeholder.svg"}
                              alt={match.player1.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {match.player1.name}
                              </p>
                              {match.player1.seed && (
                                <p className="text-[10px] text-muted-foreground">
                                  Seed #{match.player1.seed}
                                </p>
                              )}
                            </div>
                            {match.score1 !== undefined && (
                              <span
                                className={cn(
                                  "text-lg font-bold",
                                  match.winner === match.player1.id
                                    ? "text-[#31A24C]"
                                    : "text-muted-foreground"
                                )}
                              >
                                {match.score1}
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-8 h-8 rounded-full bg-muted" />
                            <span className="text-sm">TBD</span>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-border my-1" />

                      {/* Player 2 */}
                      <div
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg",
                          match.winner === match.player2?.id && "bg-[#31A24C]/10"
                        )}
                      >
                        {match.player2 ? (
                          <>
                            <img
                              src={match.player2.avatar || "/placeholder.svg"}
                              alt={match.player2.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {match.player2.name}
                              </p>
                              {match.player2.seed && (
                                <p className="text-[10px] text-muted-foreground">
                                  Seed #{match.player2.seed}
                                </p>
                              )}
                            </div>
                            {match.score2 !== undefined && (
                              <span
                                className={cn(
                                  "text-lg font-bold",
                                  match.winner === match.player2.id
                                    ? "text-[#31A24C]"
                                    : "text-muted-foreground"
                                )}
                              >
                                {match.score2}
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-8 h-8 rounded-full bg-muted" />
                            <span className="text-sm">TBD</span>
                          </div>
                        )}
                      </div>

                      {/* Match Info */}
                      {(match.court || match.time) && (
                        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                          {match.court && <span>{match.court}</span>}
                          {match.time && <span>{match.time}</span>}
                        </div>
                      )}
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="bg-background rounded-t-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-center text-foreground">
                รายละเอียดแมตช์
              </h2>
            </div>

            <div className="p-6">
              {/* VS Display */}
              <div className="flex items-center justify-between mb-6">
                {/* Player 1 */}
                <div className="flex flex-col items-center text-center">
                  {selectedMatch.player1 ? (
                    <>
                      <img
                        src={selectedMatch.player1.avatar || "/placeholder.svg"}
                        alt={selectedMatch.player1.name}
                        className={cn(
                          "w-16 h-16 rounded-full object-cover mb-2",
                          selectedMatch.winner === selectedMatch.player1.id &&
                            "ring-4 ring-[#31A24C]"
                        )}
                      />
                      <p className="font-medium text-foreground">
                        {selectedMatch.player1.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-muted mb-2" />
                      <p className="text-muted-foreground">TBD</p>
                    </>
                  )}
                </div>

                {/* Score */}
                <div className="text-center">
                  {selectedMatch.status === "completed" ||
                  selectedMatch.status === "live" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-foreground">
                        {selectedMatch.score1 ?? 0}
                      </span>
                      <span className="text-xl text-muted-foreground">-</span>
                      <span className="text-3xl font-bold text-foreground">
                        {selectedMatch.score2 ?? 0}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">
                      VS
                    </span>
                  )}
                  {selectedMatch.status === "live" && (
                    <span className="inline-block mt-2 px-2 py-1 bg-[#FA383E] text-white text-xs font-bold rounded">
                      LIVE
                    </span>
                  )}
                </div>

                {/* Player 2 */}
                <div className="flex flex-col items-center text-center">
                  {selectedMatch.player2 ? (
                    <>
                      <img
                        src={selectedMatch.player2.avatar || "/placeholder.svg"}
                        alt={selectedMatch.player2.name}
                        className={cn(
                          "w-16 h-16 rounded-full object-cover mb-2",
                          selectedMatch.winner === selectedMatch.player2.id &&
                            "ring-4 ring-[#31A24C]"
                        )}
                      />
                      <p className="font-medium text-foreground">
                        {selectedMatch.player2.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-muted mb-2" />
                      <p className="text-muted-foreground">TBD</p>
                    </>
                  )}
                </div>
              </div>

              {/* Match Info */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">สนาม</p>
                  <p className="font-medium text-foreground">
                    {selectedMatch.court || "-"}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">เวลา</p>
                  <p className="font-medium text-foreground">
                    {selectedMatch.time || "-"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {selectedMatch.status === "live" && (
                <Button className="w-full">
                  <Icons.monitor className="w-4 h-4 mr-2" />
                  ดู Live Score
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
