"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";

interface Player {
  name: string;
  avatar?: string;
  country?: string;
}

interface MatchData {
  tournamentName: string;
  tournamentLogo?: string;
  roundName: string;
  duration?: string;
  player1: Player;
  player2: Player;
  scores: {
    set1: [number, number];
    set2: [number, number];
    set3?: [number, number];
  };
  winner: 1 | 2;
}

interface MatchSummaryCardProps {
  match: MatchData;
  backgroundImage?: string;
}

export function MatchSummaryCard({
  match,
  backgroundImage = "/images/thailand-temple-bg.jpg",
}: MatchSummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadImage = async () => {
    if (!cardRef.current) return;

    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const link = document.createElement("a");
      link.download = `match-${match.player1.name}-vs-${match.player2.name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
    setDownloading(false);
  };

  const shareImage = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], "match-result.png", {
            type: "image/png",
          });
          await navigator.share({
            files: [file],
            title: `${match.player1.name} vs ${match.player2.name}`,
          });
        }
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const getWinnerBorderColor = (playerNum: 1 | 2) => {
    return match.winner === playerNum
      ? "ring-4 ring-blue-500"
      : "ring-4 ring-orange-400";
  };

  const getScoreStyle = (setScores: [number, number], playerIndex: 0 | 1) => {
    const isWinner = setScores[playerIndex] > setScores[1 - playerIndex];
    return isWinner
      ? "bg-blue-500 text-white font-bold"
      : "bg-gray-300 text-gray-600";
  };

  return (
    <div className="space-y-4">
      {/* Match Card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-md mx-auto aspect-square overflow-hidden rounded-2xl"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Content */}
        <div className="relative h-full flex flex-col p-6">
          {/* Tournament Header */}
          <div className="flex items-center gap-3 mb-6">
            {match.tournamentLogo && (
              <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
                <img
                  src={match.tournamentLogo || "/placeholder.svg"}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                {match.tournamentName}
              </h2>
            </div>
          </div>

          {/* Round & Duration */}
          <div className="text-center mb-6">
            <h3 className="text-white font-bold text-xl">{match.roundName}</h3>
            {match.duration && (
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm mt-1">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  ⏱
                </span>
                {match.duration}
              </div>
            )}
          </div>

          {/* Players & Scores */}
          <div className="flex-1 flex items-center justify-between gap-4">
            {/* Player 1 */}
            <div className="flex flex-col items-center gap-3">
              <div className={`relative rounded-full ${getWinnerBorderColor(1)}`}>
                <Avatar className="w-20 h-20">
                  <AvatarImage src={match.player1.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl bg-gray-800 text-white">
                    {match.player1.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {match.player1.country && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-4 rounded overflow-hidden bg-white shadow">
                    <span className="text-xs">{match.player1.country}</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-sm">
                  {match.player1.name.split(" ")[0]}
                </p>
                <p className="text-white font-bold text-sm uppercase">
                  {match.player1.name.split(" ").slice(1).join(" ")}
                </p>
              </div>
            </div>

            {/* Scores */}
            <div className="flex flex-col gap-2">
              {/* Shuttlecock icon */}
              <div className="flex justify-center mb-2">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L8 6v4l4-4 4 4V6l-4-4zm-2 9l-4 4h4v4l4-4-4-4v4l-4-4h4z" />
                </svg>
              </div>

              {/* Set Scores */}
              <div className="flex gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getScoreStyle(match.scores.set1, 0)}`}
                >
                  {match.scores.set1[0]}
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getScoreStyle(match.scores.set1, 1)}`}
                >
                  {match.scores.set1[1]}
                </div>
              </div>
              <div className="flex gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getScoreStyle(match.scores.set2, 0)}`}
                >
                  {match.scores.set2[0]}
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getScoreStyle(match.scores.set2, 1)}`}
                >
                  {match.scores.set2[1]}
                </div>
              </div>
              {match.scores.set3 && (
                <div className="flex gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getScoreStyle(match.scores.set3, 0)}`}
                  >
                    {match.scores.set3[0]}
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getScoreStyle(match.scores.set3, 1)}`}
                  >
                    {match.scores.set3[1]}
                  </div>
                </div>
              )}
            </div>

            {/* Player 2 */}
            <div className="flex flex-col items-center gap-3">
              <div className={`relative rounded-full ${getWinnerBorderColor(2)}`}>
                <Avatar className="w-20 h-20">
                  <AvatarImage src={match.player2.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl bg-gray-800 text-white">
                    {match.player2.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {match.player2.country && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-4 rounded overflow-hidden bg-white shadow">
                    <span className="text-xs">{match.player2.country}</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-sm">
                  {match.player2.name.split(" ")[0]}
                </p>
                <p className="text-white font-bold text-sm uppercase">
                  {match.player2.name.split(" ").slice(1).join(" ")}
                </p>
              </div>
            </div>
          </div>

          {/* H2H Button */}
          <div className="flex justify-center mt-4">
            <div className="bg-red-500 text-white px-6 py-2 rounded-full font-bold text-sm">
              H2H
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={downloadImage}
          disabled={downloading}
          className="puffy-button text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          {downloading ? "กำลังสร้าง..." : "ดาวน์โหลด"}
        </Button>
        <Button onClick={shareImage} variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          แชร์
        </Button>
      </div>
    </div>
  );
}
