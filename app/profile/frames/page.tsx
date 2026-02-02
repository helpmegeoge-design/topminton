"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons, ChevronLeftIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type FrameCategory = "free" | "brand" | "season" | "achievement" | "premium";
type FrameRarity = "basic" | "rare" | "epic" | "legendary";

interface Frame {
  id: string;
  name: string;
  category: FrameCategory;
  rarity: FrameRarity;
  borderColor: string;
  glowColor?: string;
  owned: boolean;
  equipped: boolean;
  price?: number;
  requirement?: string;
}

const mockFrames: Frame[] = [
  {
    id: "default",
    name: "Default",
    category: "free",
    rarity: "basic",
    borderColor: "border-gray-300",
    owned: true,
    equipped: false,
  },
  {
    id: "blue-ring",
    name: "Blue Ring",
    category: "free",
    rarity: "basic",
    borderColor: "border-blue-500",
    owned: true,
    equipped: true,
  },
  {
    id: "yonex",
    name: "Yonex",
    category: "brand",
    rarity: "rare",
    borderColor: "border-red-500",
    glowColor: "shadow-red-500/50",
    owned: true,
    equipped: false,
  },
  {
    id: "victor",
    name: "Victor",
    category: "brand",
    rarity: "rare",
    borderColor: "border-yellow-500",
    glowColor: "shadow-yellow-500/50",
    owned: false,
    equipped: false,
    price: 500,
  },
  {
    id: "season-1-champion",
    name: "Season 1 Champion",
    category: "season",
    rarity: "epic",
    borderColor: "border-amber-400",
    glowColor: "shadow-amber-400/50",
    owned: false,
    equipped: false,
    requirement: "อันดับ 1-3 Season 1",
  },
  {
    id: "ladder-master",
    name: "Ladder Master",
    category: "achievement",
    rarity: "epic",
    borderColor: "border-purple-500",
    glowColor: "shadow-purple-500/50",
    owned: false,
    equipped: false,
    requirement: "ขึ้นอันดับ 1 Ladder",
  },
  {
    id: "golden-wings",
    name: "Golden Wings",
    category: "premium",
    rarity: "legendary",
    borderColor: "border-amber-500",
    glowColor: "shadow-amber-500/70",
    owned: false,
    equipped: false,
    price: 2000,
  },
  {
    id: "diamond-crown",
    name: "Diamond Crown",
    category: "premium",
    rarity: "legendary",
    borderColor: "border-cyan-400",
    glowColor: "shadow-cyan-400/70",
    owned: false,
    equipped: false,
    price: 3000,
  },
];

const categoryConfig: Record<FrameCategory, { label: string }> = {
  free: { label: "ฟรี" },
  brand: { label: "แบรนด์" },
  season: { label: "ซีซั่น" },
  achievement: { label: "ความสำเร็จ" },
  premium: { label: "พิเศษ" },
};

const rarityConfig: Record<FrameRarity, { label: string; color: string }> = {
  basic: { label: "พื้นฐาน", color: "bg-gray-500" },
  rare: { label: "หายาก", color: "bg-blue-500" },
  epic: { label: "ยอดเยี่ยม", color: "bg-purple-500" },
  legendary: { label: "ตำนาน", color: "bg-amber-500" },
};

export default function FramesPage() {
  const [activeCategory, setActiveCategory] = useState<FrameCategory | "all">("all");
  const [selectedFrame, setSelectedFrame] = useState<string>("blue-ring");

  const filteredFrames = activeCategory === "all"
    ? mockFrames
    : mockFrames.filter(f => f.category === activeCategory);

  const ownedCount = mockFrames.filter(f => f.owned).length;

  return (
    <AppShell hideBottomNav>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/profile/edit" className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">กรอบโปรไฟล์</h1>
            <p className="text-xs text-muted-foreground">{ownedCount}/{mockFrames.length} กรอบ</p>
          </div>
          <Badge variant="secondary">{selectedFrame === "blue-ring" ? "กำลังใช้" : ""}</Badge>
        </div>
      </header>

      {/* Preview */}
      <div className="p-6 flex flex-col items-center">
        <div className={cn(
          "relative w-28 h-28 rounded-full p-1 transition-all",
          mockFrames.find(f => f.id === selectedFrame)?.borderColor,
          mockFrames.find(f => f.id === selectedFrame)?.glowColor && `shadow-lg ${mockFrames.find(f => f.id === selectedFrame)?.glowColor}`
        )}>
          <div className="w-full h-full rounded-full overflow-hidden bg-muted">
            <img
              src="/placeholder.svg?height=112&width=112"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <p className="mt-3 font-medium">{mockFrames.find(f => f.id === selectedFrame)?.name}</p>
        <Badge className={cn("mt-1 text-white", rarityConfig[mockFrames.find(f => f.id === selectedFrame)?.rarity || "basic"].color)}>
          {rarityConfig[mockFrames.find(f => f.id === selectedFrame)?.rarity || "basic"].label}
        </Badge>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            activeCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          ทั้งหมด
        </button>
        {(Object.keys(categoryConfig) as FrameCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {categoryConfig[cat].label}
          </button>
        ))}
      </div>

      {/* Frames Grid */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-3">
        {filteredFrames.map((frame) => (
          <button
            key={frame.id}
            type="button"
            onClick={() => frame.owned && setSelectedFrame(frame.id)}
            className={cn(
              "relative aspect-square rounded-xl p-3 flex flex-col items-center justify-center transition-all tap-highlight",
              frame.owned ? "bg-card" : "bg-muted/50",
              selectedFrame === frame.id && "ring-2 ring-primary"
            )}
          >
            {/* Frame Preview */}
            <div className={cn(
              "w-14 h-14 rounded-full p-0.5 mb-2",
              frame.borderColor,
              frame.glowColor && frame.owned && `shadow-md ${frame.glowColor}`
            )}>
              <div className={cn(
                "w-full h-full rounded-full bg-muted",
                !frame.owned && "opacity-50"
              )} />
            </div>

            {/* Name */}
            <p className={cn(
              "text-xs font-medium truncate w-full text-center",
              !frame.owned && "text-muted-foreground"
            )}>
              {frame.name}
            </p>

            {/* Status Badge */}
            {frame.equipped && (
              <Badge className="absolute top-1 right-1 text-[8px] bg-primary">ใช้งาน</Badge>
            )}

            {/* Lock/Price */}
            {!frame.owned && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
                {frame.price ? (
                  <Badge className="bg-amber-500 text-white">{frame.price} TB</Badge>
                ) : (
                  <Icons.shield size={20} className="text-muted-foreground" />
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border safe-area-bottom">
        <Button 
          className="w-full" 
          disabled={selectedFrame === mockFrames.find(f => f.equipped)?.id}
        >
          {selectedFrame === mockFrames.find(f => f.equipped)?.id ? "กำลังใช้งานอยู่" : "ใช้กรอบนี้"}
        </Button>
      </div>
    </AppShell>
  );
}
