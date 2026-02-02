"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { MatchSummaryCard } from "@/components/match-summary-card";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, ImageIcon, Users, Download } from "lucide-react";

interface TournamentMatch {
  id: string;
  round_name: string;
  team_a: {
    player1: { display_name: string; avatar_url: string };
    player2?: { display_name: string; avatar_url: string };
  };
  team_b: {
    player1: { display_name: string; avatar_url: string };
    player2?: { display_name: string; avatar_url: string };
  };
  team_a_score_set1: number;
  team_b_score_set1: number;
  team_a_score_set2: number;
  team_b_score_set2: number;
  team_a_score_set3?: number;
  team_b_score_set3?: number;
  winner_id: string;
}

export default function TournamentSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tournamentId } = use(params);
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom match data for preview
  const [customMatch, setCustomMatch] = useState({
    tournamentName: "Topminton Tournament 2026",
    roundName: "รอบชิงชนะเลิศ",
    duration: "0:45",
    player1Name: "Player 1",
    player1Avatar: "",
    player2Name: "Player 2",
    player2Avatar: "",
    set1: [21, 19] as [number, number],
    set2: [21, 18] as [number, number],
    set3: [0, 0] as [number, number],
    winner: 1 as 1 | 2,
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch tournament
      const { data: tournamentData } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();

      if (tournamentData) {
        setTournament(tournamentData);
        setCustomMatch((prev) => ({
          ...prev,
          tournamentName: tournamentData.name,
        }));
      }

      // Fetch completed matches
      const { data: matchesData } = await supabase
        .from("tournament_matches")
        .select(
          `
          *,
          team_a:tournament_registrations!tournament_matches_team_a_id_fkey(
            player1:profiles!tournament_registrations_player1_id_fkey(display_name, avatar_url),
            player2:profiles!tournament_registrations_player2_id_fkey(display_name, avatar_url)
          ),
          team_b:tournament_registrations!tournament_matches_team_b_id_fkey(
            player1:profiles!tournament_registrations_player1_id_fkey(display_name, avatar_url),
            player2:profiles!tournament_registrations_player2_id_fkey(display_name, avatar_url)
          )
        `
        )
        .eq("tournament_id", tournamentId)
        .eq("status", "completed")
        .order("round_number", { ascending: false });

      if (matchesData) {
        setMatches(matchesData);
      }

      setLoading(false);
    };

    fetchData();
  }, [tournamentId]);

  const getMatchDataForCard = (match: TournamentMatch | null) => {
    if (!match) {
      return {
        tournamentName: customMatch.tournamentName,
        roundName: customMatch.roundName,
        duration: customMatch.duration,
        player1: {
          name: customMatch.player1Name,
          avatar: customMatch.player1Avatar,
        },
        player2: {
          name: customMatch.player2Name,
          avatar: customMatch.player2Avatar,
        },
        scores: {
          set1: customMatch.set1,
          set2: customMatch.set2,
          set3:
            customMatch.set3[0] > 0 || customMatch.set3[1] > 0
              ? customMatch.set3
              : undefined,
        },
        winner: customMatch.winner,
      };
    }

    const teamAPlayer = match.team_a?.player1?.display_name || "Team A";
    const teamBPlayer = match.team_b?.player1?.display_name || "Team B";

    const teamAWins =
      (match.team_a_score_set1 > match.team_b_score_set1 ? 1 : 0) +
      (match.team_a_score_set2 > match.team_b_score_set2 ? 1 : 0) +
      ((match.team_a_score_set3 || 0) > (match.team_b_score_set3 || 0) ? 1 : 0);

    return {
      tournamentName: tournament?.name || "Tournament",
      roundName: match.round_name || "Match",
      player1: {
        name: teamAPlayer,
        avatar: match.team_a?.player1?.avatar_url,
      },
      player2: {
        name: teamBPlayer,
        avatar: match.team_b?.player1?.avatar_url,
      },
      scores: {
        set1: [match.team_a_score_set1, match.team_b_score_set1] as [
          number,
          number,
        ],
        set2: [match.team_a_score_set2, match.team_b_score_set2] as [
          number,
          number,
        ],
        set3:
          match.team_a_score_set3 || match.team_b_score_set3
            ? ([match.team_a_score_set3 || 0, match.team_b_score_set3 || 0] as [
                number,
                number,
              ])
            : undefined,
      },
      winner: (teamAWins >= 2 ? 1 : 2) as 1 | 2,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <BackButton />
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">สร้างภาพสรุปผล</h1>
            <p className="text-xs text-muted-foreground">
              {tournament?.name || "Tournament"}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="custom" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom">สร้างเอง</TabsTrigger>
            <TabsTrigger value="matches">จากแมตช์</TabsTrigger>
          </TabsList>

          {/* Custom Creator */}
          <TabsContent value="custom" className="space-y-6">
            <Card className="puffy-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  กำหนดข้อมูลเอง
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label>ชื่อทัวร์นาเมนต์</Label>
                    <Input
                      value={customMatch.tournamentName}
                      onChange={(e) =>
                        setCustomMatch((prev) => ({
                          ...prev,
                          tournamentName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>รอบ</Label>
                      <Input
                        value={customMatch.roundName}
                        onChange={(e) =>
                          setCustomMatch((prev) => ({
                            ...prev,
                            roundName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>เวลาแข่ง</Label>
                      <Input
                        value={customMatch.duration}
                        onChange={(e) =>
                          setCustomMatch((prev) => ({
                            ...prev,
                            duration: e.target.value,
                          }))
                        }
                        placeholder="0:45"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ผู้เล่น 1</Label>
                      <Input
                        value={customMatch.player1Name}
                        onChange={(e) =>
                          setCustomMatch((prev) => ({
                            ...prev,
                            player1Name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>ผู้เล่น 2</Label>
                      <Input
                        value={customMatch.player2Name}
                        onChange={(e) =>
                          setCustomMatch((prev) => ({
                            ...prev,
                            player2Name: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>คะแนน (เซ็ต 1)</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        value={customMatch.set1[0]}
                        onChange={(e) =>
                          setCustomMatch((prev) => ({
                            ...prev,
                            set1: [parseInt(e.target.value) || 0, prev.set1[1]],
                          }))
                        }
                        className="w-20"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        value={customMatch.set1[1]}
                        onChange={(e) =>
                          setCustomMatch((prev) => ({
                            ...prev,
                            set1: [prev.set1[0], parseInt(e.target.value) || 0],
                          }))
                        }
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>คะแนน (เซ็ต 2)</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        value={customMatch.set2[0]}
                        onChange={(e) =>
                          setCustomMatch((prev) => ({
                            ...prev,
                            set2: [parseInt(e.target.value) || 0, prev.set2[1]],
                          }))
                        }
                        className="w-20"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        value={customMatch.set2[1]}
                        onChange={(e) =>
                          setCustomMatch((prev) => ({
                            ...prev,
                            set2: [prev.set2[0], parseInt(e.target.value) || 0],
                          }))
                        }
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>คะแนน (เซ็ต 3 - ถ้ามี)</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        value={customMatch.set3[0]}
                        onChange={(e) =>
                          setCustomMatch((prev) => ({
                            ...prev,
                            set3: [parseInt(e.target.value) || 0, prev.set3[1]],
                          }))
                        }
                        className="w-20"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        value={customMatch.set3[1]}
                        onChange={(e) =>
                          setCustomMatch((prev) => ({
                            ...prev,
                            set3: [prev.set3[0], parseInt(e.target.value) || 0],
                          }))
                        }
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>ผู้ชนะ</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        type="button"
                        variant={customMatch.winner === 1 ? "default" : "outline"}
                        onClick={() =>
                          setCustomMatch((prev) => ({ ...prev, winner: 1 }))
                        }
                        className="flex-1"
                      >
                        ผู้เล่น 1
                      </Button>
                      <Button
                        type="button"
                        variant={customMatch.winner === 2 ? "default" : "outline"}
                        onClick={() =>
                          setCustomMatch((prev) => ({ ...prev, winner: 2 }))
                        }
                        className="flex-1"
                      >
                        ผู้เล่น 2
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <div>
              <h3 className="font-semibold mb-4">ตัวอย่าง</h3>
              <MatchSummaryCard match={getMatchDataForCard(null)} />
            </div>
          </TabsContent>

          {/* From Matches */}
          <TabsContent value="matches" className="space-y-6">
            <Card className="puffy-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  เลือกแมตช์
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length > 0 ? (
                  <div className="space-y-2">
                    {matches.map((match) => (
                      <button
                        key={match.id}
                        onClick={() => setSelectedMatch(match.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-colors ${
                          selectedMatch === match.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {match.round_name || `Round ${match.id}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {match.team_a_score_set1}-{match.team_b_score_set1},{" "}
                            {match.team_a_score_set2}-{match.team_b_score_set2}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {match.team_a?.player1?.display_name || "Team A"} vs{" "}
                          {match.team_b?.player1?.display_name || "Team B"}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    ยังไม่มีแมตช์ที่จบแล้ว
                  </p>
                )}
              </CardContent>
            </Card>

            {selectedMatch && (
              <div>
                <h3 className="font-semibold mb-4">ตัวอย่าง</h3>
                <MatchSummaryCard
                  match={getMatchDataForCard(
                    matches.find((m) => m.id === selectedMatch) || null
                  )}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
