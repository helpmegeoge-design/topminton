"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Player {
  id: string;
  name: string;
}

interface Match {
  id: string;
  court: number;
  teamA: Player[];
  teamB: Player[];
  scoreA?: number;
  scoreB?: number;
  status: "playing" | "completed";
  startedAt?: number;
  duration?: number;
  isInitialGame: boolean;
  round?: number; // Only for Full Rotation mode
}

interface PlayerQueueItem {
  players: Player[];
}

interface PlayerStat {
  id: string;
  name: string;
  matches: number;
  wins: number;
  totalScore: number;
}

export default function TeamGeneratorResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [winnerStaysMode, setWinnerStaysMode] = useState(true);

  // Dynamic State
  const [playerQueue, setPlayerQueue] = useState<PlayerQueueItem[]>([]);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [history, setHistory] = useState<Match[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);

  // UI State
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [now, setNow] = useState(Date.now());
  const [activeTab, setActiveTab] = useState("matches");
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const settingsStr = sessionStorage.getItem("teamGeneratorSettings");
    if (!settingsStr) {
      router.push("/tools/team-generator");
      return;
    }

    const settings = JSON.parse(settingsStr);
    const mode = settings.winnerStaysMode !== undefined ? settings.winnerStaysMode : true;
    setWinnerStaysMode(mode);

    const playerNames: string[] = settings.players || [];
    const courtCount: number = settings.courts || 1;

    // Create Players
    const players: Player[] = playerNames.map((name, i) => ({
      id: `p-${i}`,
      name,
    }));

    const stats = players.map(p => ({ id: p.id, name: p.name, matches: 0, wins: 0, totalScore: 0 }));
    setPlayerStats(stats);

    if (mode) {
      // WINNER STAYS MODE INITIALIZATION
      const initialQueue: PlayerQueueItem[] = [];
      for (let i = 0; i < players.length; i += 2) {
        if (i + 1 < players.length) {
          initialQueue.push({ players: [players[i], players[i + 1]] });
        }
      }
      const shuffledQueue = [...initialQueue].sort(() => Math.random() - 0.5);
      const matches: Match[] = [];
      const currentQueue = [...shuffledQueue];

      for (let c = 1; c <= courtCount; c++) {
        if (currentQueue.length >= 2) {
          const teamA = currentQueue.shift()!;
          const teamB = currentQueue.shift()!;
          matches.push({
            id: `match-c${c}-initial`,
            court: c,
            teamA: teamA.players,
            teamB: teamB.players,
            status: "playing",
            isInitialGame: true,
          });
        }
      }
      setPlayerQueue(currentQueue);
      setActiveMatches(matches);
    } else {
      // FULL ROTATION MODE (4 OUT) INITIALIZATION
      // Simply treat everyone as individual queue or pre-generate rounds
      // For dynamic "Full Rotation", we pool players and take 4 for each court.
      const individualQueue = [...players].sort(() => Math.random() - 0.5);
      const matches: Match[] = [];
      const pool = [...individualQueue];

      for (let c = 1; c <= courtCount; c++) {
        if (pool.length >= 4) {
          matches.push({
            id: `match-c${c}-r1`,
            court: c,
            teamA: [pool.shift()!, pool.shift()!],
            teamB: [pool.shift()!, pool.shift()!],
            status: "playing",
            isInitialGame: false,
            round: 1
          });
        }
      }
      // PlayerQueue in this mode will store individual players for flexibility
      setPlayerQueue(pool.map(p => ({ players: [p] })));
      setActiveMatches(matches);
    }

    setLoading(false);
  }, [router]);

  const handleStartMatch = (matchId: string) => {
    setActiveMatches(prev => prev.map(m => {
      if (m.id === matchId) return { ...m, startedAt: Date.now() };
      return m;
    }));
  };

  const handleFinishMatch = (match: Match) => {
    setSelectedMatch(match);
    setScoreA("");
    setScoreB("");
    setShowScoreModal(true);
  };

  const confirmFinish = (withScore: boolean) => {
    if (!selectedMatch) return;

    const sA = withScore ? parseInt(scoreA) || 0 : 0;
    const sB = withScore ? parseInt(scoreB) || 0 : 0;
    const duration = selectedMatch.startedAt ? Math.floor((Date.now() - selectedMatch.startedAt) / 1000) : 0;

    const completedMatch: Match = { ...selectedMatch, status: "completed", scoreA: sA, scoreB: sB, duration };
    setHistory(prev => [completedMatch, ...prev]);

    // Update Stats
    setPlayerStats(prev => {
      const stats = [...prev];
      const winA = withScore ? sA > sB : false;
      const winB = withScore ? sB > sA : false;

      const update = (p: Player, score: number, win: boolean) => {
        const idx = stats.findIndex(s => s.id === p.id);
        if (idx !== -1) {
          stats[idx].matches += 1; // Always increment games played
          if (withScore) {
            stats[idx].totalScore += score;
            if (win) stats[idx].wins += 1;
          }
        }
      };

      selectedMatch.teamA.forEach(p => update(p, sA, winA));
      selectedMatch.teamB.forEach(p => update(p, sB, winB));
      return stats;
    });

    // Logic Switch
    if (winnerStaysMode) {
      // WINNER STAYS LOGIC (Same as before)
      let nextTeamA: Player[] = [];
      let nextTeamB: Player[] = [];
      let updatedQueue = [...playerQueue];

      if (selectedMatch.isInitialGame) {
        const winner = sA > sB ? selectedMatch.teamA : selectedMatch.teamB;
        const loser = sA > sB ? selectedMatch.teamB : selectedMatch.teamA;
        nextTeamA = winner;
        if (updatedQueue.length > 0) nextTeamB = updatedQueue.shift()!.players;
        updatedQueue.push({ players: loser });
      } else {
        const finishedChamp = selectedMatch.teamA;
        const finishedNewcomer = selectedMatch.teamB;
        nextTeamA = finishedNewcomer;
        if (updatedQueue.length > 0) nextTeamB = updatedQueue.shift()!.players;
        updatedQueue.push({ players: finishedChamp });
      }

      const nextMatch: Match = {
        id: `match-c${selectedMatch.court}-${Date.now()}`,
        court: selectedMatch.court,
        teamA: nextTeamA,
        teamB: nextTeamB,
        status: "playing",
        isInitialGame: false,
        startedAt: Date.now(),
      };

      setActiveMatches(prev => {
        const others = prev.filter(m => m.court !== selectedMatch.court);
        return [...others, nextMatch].sort((a, b) => a.court - b.court);
      });
      setPlayerQueue(updatedQueue);
    } else {
      // FULL ROTATION LOGIC (4 OUT)
      // Everyone in current match goes back to individual queue
      const allFinished = [...selectedMatch.teamA, ...selectedMatch.teamB];
      let updatedQueue = [...playerQueue];

      // Add all 4 back to bottom of queue
      allFinished.forEach(p => updatedQueue.push({ players: [p] }));

      // Take 4 from top of individual queue for next match
      let nextMatch: Match | null = null;
      if (updatedQueue.length >= 4) {
        nextMatch = {
          id: `match-c${selectedMatch.court}-${Date.now()}`,
          court: selectedMatch.court,
          teamA: [updatedQueue.shift()!.players[0], updatedQueue.shift()!.players[0]],
          teamB: [updatedQueue.shift()!.players[0], updatedQueue.shift()!.players[0]],
          status: "playing",
          isInitialGame: false,
          startedAt: Date.now(),
        };
      }

      setActiveMatches(prev => {
        const others = prev.filter(m => m.court !== selectedMatch.court);
        return nextMatch ? [...others, nextMatch].sort((a, b) => a.court - b.court) : others;
      });
      setPlayerQueue(updatedQueue);
    }

    setShowScoreModal(false);
    setSelectedMatch(null);
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) return null;

  return (
    <AppShell hideNav>
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/tools/team-generator" className="p-2 -ml-2">
            <Icons.chevronLeft className="w-6 h-6" />
          </Link>
          <div className="text-center flex-1">
            <h1 className="font-black text-sm uppercase tracking-tighter">Badminton Manager</h1>
            <p className="text-[9px] font-bold text-primary uppercase">{winnerStaysMode ? "Winner Stays (ชนะวนต่อ)" : "Full Rotation (ออกแบบยกชุด)"}</p>
          </div>
          <div className="flex items-center gap-1 -mr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullScreen}
              className="text-primary hover:bg-primary/10 hover:text-primary"
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullScreen ? <Icons.close className="w-5 h-5" /> : <Icons.maximize className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Icons.share className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-12 rounded-none bg-transparent border-b border-border/50 grid grid-cols-2">
            <TabsTrigger value="matches" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black text-xs uppercase">
              สนามแข่งขัน
            </TabsTrigger>
            <TabsTrigger value="members" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black text-xs uppercase">
              คิว & สถิติ
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 pb-32">
        {activeTab === "matches" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {activeMatches.map((match) => {
                const elapsed = match.startedAt ? Math.floor((now - match.startedAt) / 1000) : 0;
                return (
                  <GlassCard key={match.id} className={cn(
                    "p-0 border-2 overflow-hidden transition-all duration-300 shadow-xl",
                    !match.startedAt ? "border-primary/40" : "border-[#31A24C]"
                  )}>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-white", match.startedAt ? "bg-[#31A24C]" : "bg-primary")}>
                            {match.court}
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase">Court Status</span>
                        </div>
                        <div className="font-mono font-black text-lg text-[#31A24C] bg-[#31A24C]/10 px-3 py-1 rounded-lg flex items-center gap-2">
                          <Icons.clock className="w-4 h-4" />
                          {formatDuration(elapsed)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-4 text-center">
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-muted-foreground mb-1">TEAM A</p>
                          <p className="font-black text-base">{match.teamA.map(p => p.name).join(" & ")}</p>
                        </div>
                        <div className="px-4 text-xl font-black italic text-muted-foreground/20">VS</div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-muted-foreground mb-1">TEAM B</p>
                          <p className="font-black text-base">{match.teamB.map(p => p.name).join(" & ")}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      className={cn("w-full h-14 rounded-none font-black text-lg", match.startedAt ? "bg-[#31A24C] hover:bg-[#31A24C]/90" : "bg-primary")}
                      onClick={() => !match.startedAt ? handleStartMatch(match.id) : handleFinishMatch(match)}
                    >
                      {match.startedAt ? (
                        <><Icons.check className="w-6 h-6 mr-2" /> จบเกม & รันคิวถัดไป</>
                      ) : (
                        <><Icons.play className="w-6 h-6 mr-2 fill-current" /> เริ่มการแข่ง</>
                      )}
                    </Button>
                  </GlassCard>
                );
              })}
            </div>

            {history.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Match History</h3>
                {history.slice(0, 3).map(m => (
                  <GlassCard key={m.id} className="p-3 text-xs flex items-center justify-between bg-muted/20">
                    <span className="font-black">C{m.court}</span>
                    <span className="font-bold">{m.teamA.map(p => p.name).join("&")} ({m.scoreA}) - ({m.scoreB}) {m.teamB.map(p => p.name).join("&")}</span>
                    <span className="text-[10px] opacity-40">{formatDuration(m.duration || 0)}</span>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Player Queue ({playerQueue.length} items)</h3>
              <div className="space-y-2">
                {playerQueue.map((item, i) => (
                  <div key={i} className="p-3 bg-secondary/50 rounded-xl border border-dashed text-xs font-bold flex gap-3 items-center">
                    <span className="w-5 h-5 rounded-full bg-background flex items-center justify-center text-[10px]">{i + 1}</span>
                    {item.players.map(p => p.name).join(" & ")}
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Leaderboard</h3>
              <div className="space-y-2">
                {playerStats.sort((a, b) => b.wins - a.wins).map((s, i) => (
                  <GlassCard key={s.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-primary">#{i + 1}</span>
                      <span className="font-bold">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-[#31A24C]">{s.wins} W </span>
                      <span className="text-[10px] font-bold opacity-30">/ {s.matches} G</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-bottom">
        <Button onClick={() => router.push("/tools/team-generator")} variant="outline" className="w-full h-14 border-2 border-primary text-primary font-black rounded-2xl shadow-xl">
          <Icons.shuffle className="w-5 h-5 mr-3" /> ย้อนกลับ / ตั้งค่าใหม่
        </Button>
      </div>

      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="rounded-[40px] max-w-[95vw] w-[380px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-7 text-white text-center">
            <h2 className="text-2xl font-black italic tracking-tighter">จบเกมการแข่งขัน</h2>
            <p className="text-primary-foreground/70 text-xs font-bold mt-1 uppercase italic">บันทึกผลเพื่อจัดลำดับคิว {winnerStaysMode ? "แบบชนะวน" : "แบบออกยกชุด"}</p>
          </div>
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center flex-1 space-y-3">
                <Input type="number" placeholder="0" className="text-center text-4xl h-20 font-black rounded-3xl border-2 shadow-inner bg-secondary/30" value={scoreA} onChange={(e) => setScoreA(e.target.value)} />
              </div>
              <div className="text-5xl font-black text-muted-foreground/10 pt-8 italic">:</div>
              <div className="text-center flex-1 space-y-3">
                <Input type="number" placeholder="0" className="text-center text-4xl h-20 font-black rounded-3xl border-2 shadow-inner bg-secondary/30" value={scoreB} onChange={(e) => setScoreB(e.target.value)} />
              </div>
            </div>
            <Button className="w-full h-16 bg-[#31A24C] hover:bg-[#31A24C]/90 text-white font-black text-xl rounded-[24px]" onClick={() => confirmFinish(true)}>บันทึกและจัดคิวใหม่</Button>
            <Button variant="ghost" className="w-full h-10 text-muted-foreground font-black text-[10px] uppercase opacity-40" onClick={() => confirmFinish(false)}>ข้ามการบันทึก</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
