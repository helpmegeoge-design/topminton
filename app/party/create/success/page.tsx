"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function PartyCreateSuccessPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const partyData = {
    id: "new-party-123",
    name: "ก๊วนใหม่ของฉัน",
    date: "29 ม.ค. 2569",
    time: "18:00 - 20:00",
    court: "สนามแบดมินตัน S.T.",
    maxParticipants: 8,
    shareUrl: "https://topminton.app/party/new-party-123",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(partyData.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: partyData.name,
        text: `มาร่วมก๊วน "${partyData.name}" กันเถอะ! ${partyData.date} ${partyData.time}`,
        url: partyData.shareUrl,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                backgroundColor: ['#FF9500', '#31A24C', '#F7B928', '#FA383E', '#E040FB'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="p-4 pt-12 space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-[#31A24C]/10 mx-auto flex items-center justify-center mb-4 animate-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-[#31A24C]/20 flex items-center justify-center">
              <Icons.check size={48} className="text-[#31A24C]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">สร้างก๊วนสำเร็จ!</h1>
          <p className="text-muted-foreground mt-2">ก๊วนของคุณพร้อมรับสมาชิกแล้ว</p>
        </div>

        {/* Party Card */}
        <GlassCard className="overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-primary to-primary/80">
            <div className="absolute inset-0 flex items-center justify-center">
              <Icons.shuttlecock size={64} className="text-white/20" />
            </div>
            <div className="absolute bottom-4 left-4">
              <h2 className="text-xl font-bold text-white">{partyData.name}</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Icons.calendar className="h-4 w-4 text-primary" />
              <span className="text-foreground">{partyData.date}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Icons.clock className="h-4 w-4 text-primary" />
              <span className="text-foreground">{partyData.time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Icons.mapPin className="h-4 w-4 text-primary" />
              <span className="text-foreground">{partyData.court}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Icons.users className="h-4 w-4 text-primary" />
              <span className="text-foreground">รับสมาชิก {partyData.maxParticipants} คน</span>
            </div>
          </div>
        </GlassCard>

        {/* Share Section */}
        <GlassCard className="p-4">
          <h3 className="font-semibold text-foreground mb-3">แชร์ให้เพื่อน</h3>
          <p className="text-sm text-muted-foreground mb-4">
            ส่งลิงก์นี้ให้เพื่อนเพื่อเชิญเข้าร่วมก๊วน
          </p>

          {/* Share Link */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-xl mb-4">
            <span className="flex-1 text-sm text-foreground truncate font-mono">
              {partyData.shareUrl}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0"
            >
              {copied ? (
                <Icons.check className="h-4 w-4 text-[#31A24C]" />
              ) : (
                <Icons.copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#06C755]/10 tap-highlight"
            >
              <div className="w-10 h-10 rounded-full bg-[#06C755] flex items-center justify-center">
                <Icons.message className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] text-foreground">LINE</span>
            </button>
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#FF9500]/10 tap-highlight"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center">
                <Icons.users className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] text-foreground">Facebook</span>
            </button>
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-[1px] tap-highlight"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
                <Icons.camera className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] text-foreground">IG</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted tap-highlight"
            >
              <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                <Icons.copy className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-[10px] text-foreground">คัดลอก</span>
            </button>
          </div>
        </GlassCard>

        {/* Tips */}
        <GlassCard className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Icons.lightbulb className="h-5 w-5 text-[#F7B928] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">เคล็ดลับ</p>
              <p className="text-xs text-muted-foreground mt-1">
                แชร์ก๊วนไปยังกลุ่ม LINE หรือ Facebook เพื่อเพิ่มโอกาสในการหาสมาชิก
                คุณสามารถจัดการก๊วนได้ที่หน้า "ก๊วนของฉัน"
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            className="w-full h-12"
            onClick={() => router.push(`/party/${partyData.id}`)}
          >
            <Icons.eye className="h-5 w-5 mr-2" />
            ดูก๊วนของฉัน
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 bg-transparent"
            onClick={() => router.push("/party")}
          >
            กลับหน้าก๊วน
          </Button>
        </div>
      </div>
    </div>
  );
}
