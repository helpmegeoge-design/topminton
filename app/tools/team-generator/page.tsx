"use client";

import { useState } from "react";
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

export default function TeamGeneratorPage() {
  const router = useRouter();
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [courts, setCourts] = useState(2);
  const [rounds, setRounds] = useState(4);
  const [restRounds, setRestRounds] = useState(0);
  const [strictMode, setStrictMode] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const parsePlayerNames = (input: string) => {
    const lines = input.split("\n");
    const names: string[] = [];

    for (const line of lines) {
      // Remove numbering like "1.", "2.", etc.
      const cleaned = line.replace(/^\d+[\.\)\-\s]+/, "").trim();
      if (cleaned) {
        names.push(cleaned);
      }
    }

    setPlayers(names);
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <Icons.chevronLeft className="h-5 w-5" />
            </Button>
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
              ใส่รายชื่อผู้เล่นคนละบรรทัด (ต้องมีอย่างน้อย 4 คน)
            </p>
            <Textarea
              placeholder={`กรอกรายชื่อผู้เล่นที่ต้องการ เช่น:\nแสตมป์\nแชมป์\nเต้\nพี่วี\nพี่กัน`}
              value={playerInput}
              onChange={(e) => handleInputChange(e.target.value)}
              rows={8}
              className="bg-secondary border-0 resize-none"
            />

            {players.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-[#FF9500] mb-2">
                  ตรวจพบผู้เล่น ({players.length} คน)
                </p>
                <div className="flex flex-wrap gap-2">
                  {players.map((player, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="pr-1 flex items-center gap-1"
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

            <Button
              variant="outline"
              className="w-full mt-4 rounded-xl border-[#FF9500] text-[#FF9500] bg-transparent"
              onClick={() => setShowTip(true)}
            >
              <Icons.lightbulb className="h-4 w-4 mr-2" />
              ตัวอย่างข้อมูล
            </Button>
          </GlassCard>

          {/* Settings */}
          <GlassCard className="p-4">
            <h3 className="font-medium text-foreground mb-4">การตั้งค่า</h3>

            {/* Courts */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground">จำนวนคอร์ท</span>
                <Badge className="bg-[#FF9500] text-white">{courts}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                จำนวนสนามแบดมินตันที่จะใช้ในการแข่งขันแต่ละรอบ
                ยิ่งมีคอร์ทเยอะ ยิ่งมีผู้เล่นได้เล่นพร้อมกันมากขึ้น
              </p>
              <Slider
                value={[courts]}
                onValueChange={(v) => setCourts(v[0])}
                min={1}
                max={4}
                step={1}
                className="[&_[role=slider]]:bg-[#FF9500]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>4</span>
              </div>
            </div>

            {/* Rounds */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground">จำนวนรอบ</span>
                <Badge className="bg-[#FF9500] text-white">{rounds}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                จำนวนรอบการแข่งขันทั้งหมด 1 รอบ = การเล่น 1 เกมส์ในแต่ละคอร์ท
              </p>
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

            {/* Rest Rounds */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground">รอบพัก</span>
                <Badge className="bg-[#FF9500] text-white">{restRounds}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                จำนวนรอบที่ผู้เล่นต้องพักก่อนจะได้เล่นอีกครั้ง
                ป้องกันการเล่นติดต่อกันหลายรอบ เพื่อความยุติธรรม
              </p>
              <Slider
                value={[restRounds]}
                onValueChange={(v) => setRestRounds(v[0])}
                min={0}
                max={2}
                step={1}
                className="[&_[role=slider]]:bg-[#FF9500]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>2</span>
              </div>
            </div>

            {/* Strict Mode */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-foreground">โหมดเข้มงวด</span>
                <p className="text-sm text-muted-foreground mt-1">
                  ปิด: อนุญาตให้มีคอร์ทว่างได้ เหมาะสำหรับผู้เล่นไม่เยอะ
                  <br />
                  เปิด: ต้องมีผู้เล่นครบทุกคอร์ทในทุกรอบ
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
            className="w-full bg-[#FF9500] hover:bg-[#FF9500]/90 text-white rounded-2xl py-6 text-lg"
          >
            <Icons.shuffle className="h-5 w-5 mr-2" />
            สร้างตารางการแข่งขัน
          </Button>
        </div>

        {/* Tip Modal */}
        <Dialog open={showTip} onOpenChange={setShowTip}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icons.lightbulb className="h-5 w-5 text-[#F7B928]" />
                เทคนิคการใส่รายชื่อ
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-secondary rounded-2xl p-4 mb-4">
                <p className="text-sm text-[#FF9500] mb-2">
                  คุณสามารถวางข้อความลงชื่อจากแอปอื่น
                  เพื่อให้ระบบคำนวณชื่อโดยอัตโนมัติ
                </p>
                <div className="bg-background rounded-xl p-3 text-sm">
                  <p className="text-muted-foreground">@All ลงชื่อ ตีแบต ครับ</p>
                  <p>1.แสตมป์</p>
                  <p>2.นัท</p>
                  <p>3.มาเบล</p>
                  <p>4.กิม</p>
                  <p>5.สมิท</p>
                  <p className="text-muted-foreground">...</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                คุณสามารถคัดลอกรายชื่อจากที่อื่น เช่น Line, Instagram, หรือ
                Facebook แล้ววางที่ช่องข้อความได้เลย
                ระบบจะพยายามแยกแยะรายชื่อออกมาให้
              </p>
            </div>
            <Button
              className="w-full bg-[#FF9500] hover:bg-[#FF9500]/90 text-white rounded-2xl"
              onClick={() => setShowTip(false)}
            >
              เข้าใจแล้ว
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
