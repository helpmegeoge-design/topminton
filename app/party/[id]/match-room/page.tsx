"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  Users,
  Shuffle,
  Play,
  CheckCircle,
  Plus,
  Trophy,
  ArrowLeftRight,
  Trash2,
} from "lucide-react";

interface Player {
  id: string;
  display_name: string;
  avatar_url: string;
  skill_level: string;
}

interface MatchPairing {
  id: string;
  match_number: number;
  team_a_player1: Player | null;
  team_a_player2: Player | null;
  team_b_player1: Player | null;
  team_b_player2: Player | null;
  team_a_score: number;
  team_b_score: number;
  status: string;
  winner_team: string | null;
}

interface MatchRoom {
  id: string;
  name: string;
  room_type: string;
  court_number: number;
  status: string;
  pairings: MatchPairing[];
}

export default function MatchRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: partyId } = use(params);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchRooms, setMatchRooms] = useState<MatchRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [partyInfo, setPartyInfo] = useState<any>(null);

  const fetchData = async () => {
    const supabase = createClient();

    // Fetch party info
    const { data: party } = await supabase
      .from("parties")
      .select("*, court:courts(name)")
      .eq("id", partyId)
      .single();

    setPartyInfo(party);

    // Fetch party members (players)
    const { data: members } = await supabase
      .from("party_members")
      .select("user:profiles(*)")
      .eq("party_id", partyId)
      .eq("status", "joined");

    if (members) {
      setPlayers(members.map((m: any) => m.user).filter(Boolean));
    }

    // Fetch match rooms with pairings
    const { data: rooms } = await supabase
      .from("match_rooms")
      .select(
        `
        *,
        pairings:match_pairings(
          *,
          team_a_player1:profiles!match_pairings_team_a_player1_id_fkey(*),
          team_a_player2:profiles!match_pairings_team_a_player2_id_fkey(*),
          team_b_player1:profiles!match_pairings_team_b_player1_id_fkey(*),
          team_b_player2:profiles!match_pairings_team_b_player2_id_fkey(*)
        )
      `
      )
      .eq("party_id", partyId)
      .order("created_at", { ascending: true });

    if (rooms) {
      setMatchRooms(rooms);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [partyId]);

  const shufflePlayers = (arr: Player[]): Player[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generatePairings = async () => {
    if (players.length < 4) {
      alert("ต้องมีผู้เล่นอย่างน้อย 4 คน");
      return;
    }

    setGenerating(true);
    const supabase = createClient();

    // Shuffle players
    const shuffled = shufflePlayers(players);

    // Create a new match room
    const { data: room, error: roomError } = await supabase
      .from("match_rooms")
      .insert({
        party_id: partyId,
        name: `รอบที่ ${matchRooms.length + 1}`,
        room_type: "doubles",
        court_number: 1,
        status: "waiting",
      })
      .select()
      .single();

    if (roomError || !room) {
      console.error("Error creating room:", roomError);
      setGenerating(false);
      return;
    }

    // Create pairings (4 players per match)
    const pairings = [];
    let matchNumber = 1;

    for (let i = 0; i < shuffled.length; i += 4) {
      if (i + 3 < shuffled.length) {
        pairings.push({
          match_room_id: room.id,
          match_number: matchNumber++,
          team_a_player1_id: shuffled[i].id,
          team_a_player2_id: shuffled[i + 1].id,
          team_b_player1_id: shuffled[i + 2].id,
          team_b_player2_id: shuffled[i + 3].id,
          status: "pending",
        });
      }
    }

    if (pairings.length > 0) {
      const { error: pairingError } = await supabase
        .from("match_pairings")
        .insert(pairings);

      if (pairingError) {
        console.error("Error creating pairings:", pairingError);
      }
    }

    await fetchData();
    setGenerating(false);
  };

  const updateScore = async (
    pairingId: string,
    team: "A" | "B",
    increment: number
  ) => {
    const supabase = createClient();
    const pairing = matchRooms
      .flatMap((r) => r.pairings)
      .find((p) => p.id === pairingId);

    if (!pairing) return;

    const field = team === "A" ? "team_a_score" : "team_b_score";
    const currentScore = team === "A" ? pairing.team_a_score : pairing.team_b_score;
    const newScore = Math.max(0, currentScore + increment);

    await supabase
      .from("match_pairings")
      .update({ [field]: newScore })
      .eq("id", pairingId);

    await fetchData();
  };

  const finishMatch = async (pairingId: string) => {
    const supabase = createClient();
    const pairing = matchRooms
      .flatMap((r) => r.pairings)
      .find((p) => p.id === pairingId);

    if (!pairing) return;

    const winner =
      pairing.team_a_score > pairing.team_b_score
        ? "A"
        : pairing.team_b_score > pairing.team_a_score
          ? "B"
          : null;

    await supabase
      .from("match_pairings")
      .update({
        status: "completed",
        winner_team: winner,
        completed_at: new Date().toISOString(),
      })
      .eq("id", pairingId);

    await fetchData();
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
            <h1 className="font-semibold text-foreground">ห้องจับคู่แข่งขัน</h1>
            <p className="text-xs text-muted-foreground">
              {partyInfo?.title || "Loading..."}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Players Overview */}
        <Card className="puffy-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              ผู้เล่นวันนี้ ({players.length} คน)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={player.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {player.display_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {player.display_name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {player.skill_level || "N/A"}
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              onClick={generatePairings}
              disabled={generating || players.length < 4}
              className="w-full mt-4 puffy-button text-white"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              {generating ? "กำลังจับคู่..." : "สุ่มจับคู่ใหม่"}
            </Button>
          </CardContent>
        </Card>

        {/* Match Rooms */}
        {matchRooms.map((room) => (
          <Card key={room.id} className="puffy-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{room.name}</CardTitle>
                <Badge
                  variant={room.status === "completed" ? "secondary" : "default"}
                >
                  {room.status === "waiting"
                    ? "รอเริ่ม"
                    : room.status === "in_progress"
                      ? "กำลังแข่ง"
                      : "จบแล้ว"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {room.pairings?.map((pairing) => (
                <div
                  key={pairing.id}
                  className="p-4 rounded-xl border border-border bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      แมตช์ {pairing.match_number}
                    </span>
                    {pairing.status === "completed" && pairing.winner_team && (
                      <Badge className="bg-green-500 text-white">
                        <Trophy className="h-3 w-3 mr-1" />
                        ทีม {pairing.winner_team} ชนะ
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Team A */}
                    <div
                      className={`flex-1 p-3 rounded-lg ${pairing.winner_team === "A" ? "bg-green-100 border-green-300" : "bg-card"} border`}
                    >
                      <div className="text-center mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          ทีม A
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        {[pairing.team_a_player1, pairing.team_a_player2].map(
                          (player, idx) =>
                            player && (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={player.avatar_url || undefined}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {player.display_name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate max-w-20">
                                  {player.display_name}
                                </span>
                              </div>
                            )
                        )}
                      </div>
                      {pairing.status !== "completed" && (
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateScore(pairing.id, "A", -1)}
                          >
                            -
                          </Button>
                          <span className="text-2xl font-bold w-10 text-center">
                            {pairing.team_a_score}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateScore(pairing.id, "A", 1)}
                          >
                            +
                          </Button>
                        </div>
                      )}
                      {pairing.status === "completed" && (
                        <div className="text-center mt-3">
                          <span className="text-3xl font-bold">
                            {pairing.team_a_score}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center">
                      <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">VS</span>
                    </div>

                    {/* Team B */}
                    <div
                      className={`flex-1 p-3 rounded-lg ${pairing.winner_team === "B" ? "bg-green-100 border-green-300" : "bg-card"} border`}
                    >
                      <div className="text-center mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          ทีม B
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        {[pairing.team_b_player1, pairing.team_b_player2].map(
                          (player, idx) =>
                            player && (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={player.avatar_url || undefined}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {player.display_name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate max-w-20">
                                  {player.display_name}
                                </span>
                              </div>
                            )
                        )}
                      </div>
                      {pairing.status !== "completed" && (
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateScore(pairing.id, "B", -1)}
                          >
                            -
                          </Button>
                          <span className="text-2xl font-bold w-10 text-center">
                            {pairing.team_b_score}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateScore(pairing.id, "B", 1)}
                          >
                            +
                          </Button>
                        </div>
                      )}
                      {pairing.status === "completed" && (
                        <div className="text-center mt-3">
                          <span className="text-3xl font-bold">
                            {pairing.team_b_score}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {pairing.status !== "completed" && (
                    <Button
                      onClick={() => finishMatch(pairing.id)}
                      className="w-full mt-4"
                      variant="secondary"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      จบแมตช์
                    </Button>
                  )}
                </div>
              ))}

              {(!room.pairings || room.pairings.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  ยังไม่มีการจับคู่
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {matchRooms.length === 0 && (
          <Card className="puffy-card">
            <CardContent className="p-8 text-center">
              <Shuffle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                ยังไม่มีการจับคู่แข่งขัน
              </p>
              <p className="text-sm text-muted-foreground">
                กดปุ่ม "สุ่มจับคู่ใหม่" เพื่อเริ่มต้น
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
