"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ScoreboardPage() {
  const router = useRouter();
  const [blueScore, setBlueScore] = useState(0);
  const [redScore, setRedScore] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalSets] = useState(3);
  const [winScore] = useState(21);
  const [deuceEnabled, setDeuceEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const handleScore = (team: "blue" | "red") => {
    if (team === "blue") {
      setBlueScore((prev) => prev + 1);
    } else {
      setRedScore((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setBlueScore(0);
    setRedScore(0);
    setCurrentSet(1);
  };

  const handleUndo = () => {
    // Simple undo - just decrement last scored
  };

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full"
              >
                <Icons.chevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">
                Scoreboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBroadcastModal(true)}
                className="rounded-full"
              >
                <Icons.broadcast className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="rounded-full"
              >
                <Icons.settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex-1 flex">
          {/* Blue Side */}
          <button
            onClick={() => handleScore("blue")}
            className="flex-1 bg-[#FF9500] flex flex-col items-center justify-center tap-highlight active:brightness-90 transition-all"
          >
            <span className="text-white/60 text-lg mb-2">BLUE</span>
            <span className="text-white text-8xl font-bold">{blueScore}</span>
          </button>

          {/* Red Side */}
          <button
            onClick={() => handleScore("red")}
            className="flex-1 bg-[#FA383E] flex flex-col items-center justify-center tap-highlight active:brightness-90 transition-all"
          >
            <span className="text-white/60 text-lg mb-2">RED</span>
            <span className="text-white text-8xl font-bold">{redScore}</span>
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="bg-background border-t border-border p-4 safe-area-bottom">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">
              Set {currentSet} of {totalSets}
            </span>
            <span className="text-muted-foreground">Win at {winScore}</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleUndo}
              className="flex-1 rounded-xl bg-transparent"
            >
              <Icons.undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 rounded-xl bg-transparent"
            >
              <Icons.refresh className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Settings Modal */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>ตั้งค่า Scoreboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground">เปิดใช้ Deuce</span>
                <Switch
                  checked={deuceEnabled}
                  onCheckedChange={setDeuceEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">เปิดเสียง</span>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Broadcast Modal */}
        <Dialog open={showBroadcastModal} onOpenChange={setShowBroadcastModal}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>เลือกโหมด Broadcast</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl py-6 bg-transparent"
              >
                <Icons.monitor className="h-5 w-5 mr-3 text-[#FF9500]" />
                <div className="text-left">
                  <p className="font-medium">จอผลลัพท์ (Display)</p>
                  <p className="text-sm text-muted-foreground">
                    แสดงคะแนนอย่างเดียว
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl py-6 bg-transparent"
              >
                <Icons.gamepad className="h-5 w-5 mr-3 text-[#FF9500]" />
                <div className="text-left">
                  <p className="font-medium">ตัวควบคุม (Controller)</p>
                  <p className="text-sm text-muted-foreground">
                    ควบคุมคะแนนจากเครื่องนี้
                  </p>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full rounded-xl"
                onClick={() => setShowBroadcastModal(false)}
              >
                ยกเลิก
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
