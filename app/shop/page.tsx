"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import Image from "next/image";

const mockFrames = [
  { id: "1", name: "Yonex", price: 3, image: "/images/frames/frame-yonex.jpg", premium: true },
  { id: "2", name: "Victor", price: 3, image: "/images/frames/frame-victor.jpg", premium: true },
  { id: "3", name: "LI-NING", price: 3, image: "/images/frames/frame-lining.jpg", premium: true },
  { id: "4", name: "Kawasaki", price: 3, image: "/images/frames/frame-kawasaki.jpg", premium: true },
];

export default function ShopPage() {
  const router = useRouter();
  const userPoints = 156;

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-br from-[#FF9500] to-[#F5A623]">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full text-white hover:bg-white/20"
            >
              <Icons.chevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white">
              ร้านค้า TB Points
            </h1>
          </div>

          {/* Wallet */}
          <div className="px-4 pb-6">
            <GlassCard className="p-4 bg-white/20 border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">TB Points คงเหลือ</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Icons.coins className="h-6 w-6 text-[#F7B928]" />
                    <span className="text-3xl font-bold text-white">
                      {userPoints}
                    </span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full bg-white text-[#FF9500]"
                >
                  วิธีรับ Points
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h2 className="font-semibold text-foreground mb-4">
            กรอบโปรไฟล์
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {mockFrames.map((frame) => (
              <GlassCard key={frame.id} className="p-4 text-center">
                <div className="relative mb-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#F7B928] to-[#F5793A] p-1">
                    <Image
                      src={frame.image || "/placeholder.svg"}
                      alt={frame.name}
                      width={80}
                      height={80}
                      className="w-full h-full rounded-full object-cover bg-background"
                    />
                  </div>
                  {frame.premium && (
                    <Badge className="absolute -top-1 -right-1 bg-[#F7B928] text-white text-xs">
                      พรีเมี่ยม
                    </Badge>
                  )}
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  {frame.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Icons.coins className="h-4 w-4 text-[#F7B928]" />
                  <span className="text-foreground font-medium">
                    {frame.price} points
                  </span>
                </div>
                <Button
                  size="sm"
                  disabled={userPoints < frame.price}
                  className="w-full rounded-xl bg-[#FF9500] hover:bg-[#FF9500]/90 text-white disabled:opacity-50"
                >
                  ซื้อ
                </Button>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
