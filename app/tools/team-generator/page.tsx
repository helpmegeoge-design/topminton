"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function TeamGeneratorPage() {
  const router = useRouter();
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [courts, setCourts] = useState(2);
  const [rounds, setRounds] = useState(4);
  const [restRounds, setRestRounds] = useState(0);
  const [strictMode, setStrictMode] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // New State for Rotation Mode
  // true = Winner Stays (ออกทีละคู่), false = Full Rotation (ออก 4 คน)
  const [winnerStaysMode, setWinnerStaysMode] = useState(true);

  const parsePlayerNames = (input: string) => {
    const lines = input.split("\n").map(l => l.trim()).filter(l => l);
    const newPlayers: string[] = [];

    // Strict Numbered Mode Detection
    // Matches "1.", "1)", "1-", "1 " followed by name
    const strictPattern = /^(\d+)[\.\)\-\s]+\s*(.*)/;
    const numberedLines = lines.filter(l => strictPattern.test(l));
    const useStrictMode = numberedLines.length > 0;

    const addPlayer = (name: string) => {
      // Avoid duplicates in the same batch
      const cleanedName = name.trim();
      if (cleanedName && !newPlayers.includes(cleanedName)) {
        newPlayers.push(cleanedName);
      }
    };

    if (useStrictMode) {
      for (const line of lines) {
        const match = line.match(strictPattern);
        if (match) {
          // match[2] is the name part after the number
          const name = match[2].trim();
          if (name && name.length > 0) addPlayer(name);
        }
      }
    } else {
      const excludePatterns = [
        /^[🧡📍🏸❌]/, /[🧡📍🏸❌]$/, /^https?:\/\//,
        /^(ปิด|คอร์ท|สนาม|เวลา|วันที่|ลงชื่อ|@)/,
        /(กติก|พรุ่งนี้|วันนี้|พบกัน|นัด|คอนเท้น|แรง|จบบ่แฮง)/,
      ];
      for (const line of lines) {
        const isHeaderFooter = excludePatterns.some(pattern => pattern.test(line));
        // Basic length check to avoid long sentences/paragraphs
        if (!isHeaderFooter && line.length < 50) addPlayer(line);
      }
    }

    setPlayers(newPlayers);
  };

  const handleInputChange = (value: string) => {
    setPlayerInput(value);
    parsePlayerNames(value);
  };

  const removePlayer = (index: number) => {
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
  };

  const handleGenerate = () => {
    // Store settings in sessionStorage for result page
    const settings = {
      players,
      courts,
      rounds,
      restRounds,
      strictMode,
      winnerStaysMode, // Pass the mode to the result page
    };
    sessionStorage.setItem("teamGeneratorSettings", JSON.stringify(settings));
    router.push("/tools/team-generator/result");
  };

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3 flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                asChild
              >
                <span>
                  <Icons.chevronLeft className="h-5 w-5" />
                </span>
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">
              ระบบสุ่มจับคู่
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Player Input */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">รายชื่อผู้เล่น</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Icons.trash className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Icons.copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setShowTip(true)}
                >
                  <Icons.info className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              วางรายชื่อก๊วนลงที่นี่ ระบบจะดึงชื่อให้อัตโนมัติ
            </p>
            <Textarea
              placeholder={`วางข้อความรายชื่อจาก LINE ได้เลย ระบบจะตัดส่วนที่ไม่ใช่ออกให้ครับ...`}
              value={playerInput}
              onChange={(e) => handleInputChange(e.target.value)}
              rows={8}
              className="bg-secondary border-0 resize-none font-medium"
            />

            {players.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-[#FF9500] font-bold mb-2 uppercase tracking-tight">
                  PLAYER LIST ({players.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {players.map((player, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="pr-1 flex items-center gap-1 bg-muted/50 border-none"
                    >
                      {player}
                      <button
                        onClick={() => removePlayer(index)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <Icons.close className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Mode Selection */}
          <GlassCard className="p-4">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Icons.shuffle className="w-4 h-4 text-primary" />
              รูปแบบการรันคิว
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWinnerStaysMode(true)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                  winnerStaysMode ? "border-[#FF9500] bg-[#FF9500]/5" : "border-border bg-transparent opacity-60"
                )}
              >
                <Icons.star className={cn("w-6 h-6", winnerStaysMode ? "text-[#FF9500]" : "text-muted-foreground")} />
                <div className="text-center">
                  <p className="text-sm font-black leading-tight">ชนะวนต่อ</p>
                  <p className="text-[10px] text-muted-foreground font-medium">ออกทีละคู่</p>
                </div>
              </button>
              <button
                onClick={() => setWinnerStaysMode(false)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                  !winnerStaysMode ? "border-[#FF9500] bg-[#FF9500]/5" : "border-border bg-transparent opacity-60"
                )}
              >
                <Icons.users className={cn("w-6 h-6", !winnerStaysMode ? "text-[#FF9500]" : "text-muted-foreground")} />
                <div className="text-center">
                  <p className="text-sm font-black leading-tight">ออกแบบคู่</p>
                  <p className="text-[10px] text-muted-foreground font-medium">ออก 4 คนยกสนาม</p>
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-dashed border-border">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {winnerStaysMode
                  ? "• รอบแรกคัดผู้ชนะอยู่ต่อ พอก้าวเข้าสู่เกมที่ 2 จะต้องสลับคิวออกเพื่อให้คู่ใหม่ได้เล่น (จำกัดคู่ละ 2 เกมต่อเนื่อง)"
                  : "• เมื่อจบแมตช์ ทั้ง 4 คนในสนามต้องออกจากสนามทั้งหมด และนำคู่ใหม่ 2 คู่จากคิวเข้าไปเล่นแทน"}
              </p>
            </div>
          </GlassCard>

          {/* Settings */}
          <GlassCard className="p-4">
            <h3 className="font-medium text-foreground mb-4">การตั้งค่าทั่วไป</h3>

            {/* Courts */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground font-bold">จำนวนคอร์ท</span>
                <Badge className="bg-[#FF9500] text-white font-black">{courts}</Badge>
              </div>
              <Slider
                value={[courts]}
                onValueChange={(v) => setCourts(v[0])}
                min={1}
                max={10}
                step={1}
                className="[&_[role=slider]]:bg-[#FF9500]"
              />
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                <span>1 Court</span>
                <span>10 Courts</span>
              </div>
            </div>

            {/* Rounds - Hidden for Winner Stays mode as it's infinite queue */}
            {winnerStaysMode ? null : (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground">จำนวนรอบ</span>
                  <Badge className="bg-[#FF9500] text-white">{rounds}</Badge>
                </div>
                <Slider
                  value={[rounds]}
                  onValueChange={(v) => setRounds(v[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="[&_[role=slider]]:bg-[#FF9500]"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            )}

            {/* Strict Mode */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-foreground font-bold text-sm">โหมดเติมคนอัตโนมัติ</span>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">
                  จัดคนให้เต็มทุกคอร์ทโดยการสุ่มจากคนที่พักอยู่
                </p>
              </div>
              <Switch checked={strictMode} onCheckedChange={setStrictMode} />
            </div>
          </GlassCard>
        </div>

        {/* Fixed Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-bottom">
          <Button
            onClick={handleGenerate}
            disabled={players.length < 4}
            className="w-full bg-[#FF9500] hover:bg-[#FF9500]/90 text-white rounded-2xl h-14 text-lg font-black shadow-lg shadow-[#FF9500]/20"
          >
            <Icons.shuffle className="h-5 w-5 mr-3" />
            เริ่มต้นจัดคิว {winnerStaysMode ? "แบบคัดคนออก" : "แบบออก 4 คน"}
          </Button>
        </div>

        {/* Tip Modal */}
        <Dialog open={showTip} onOpenChange={setShowTip}>
          <DialogContent className="rounded-3xl border-none p-0 overflow-hidden">
            <div className="bg-[#FF9500] p-6 text-white">
              <DialogTitle className="flex items-center gap-3 text-xl font-black italic uppercase">
                <Icons.lightbulb className="h-6 w-6" />
                TIPS & TRICKS
              </DialogTitle>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-secondary rounded-2xl p-5 shadow-inner">
                <p className="text-xs font-bold text-[#FF9500] mb-3 uppercase tracking-tighter">
                  ตัวอย่างการลงชื่อที่ระบบรองรับ:
                </p>
                <div className="bg-background/80 rounded-xl p-4 text-xs font-medium space-y-1.5 border border-border/50">
                  <p className="text-muted-foreground italic mb-1">// ก๊อปจาก LINE ได้เลย</p>
                  <p>1. แสตมป์</p>
                  <p>2. พี่นัท (หน้าเดิม)</p>
                  <p>3. กิมจิเองจ้า</p>
                  <p>4. Teเต้</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                ระบบถูกออกแบบมาให้ฉลาดพอที่จะแยกแยะรายชื่อแม้จะมีเลขลำดับ หรือข้อความอื่นปนมา คุณแค่คัดลอกรายชื่อทั้งหมดแล้ววางลงในช่องได้ทันทีครับ
              </p>
              <Button
                className="w-full bg-[#FF9500] hover:bg-[#FF9500]/90 text-white rounded-2xl h-12 font-bold"
                onClick={() => setShowTip(false)}
              >
                เข้าใจแล้ว
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
