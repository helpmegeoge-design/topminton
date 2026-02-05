"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Icons, ChevronLeftIcon, ShuttlecockIcon } from "@/components/icons";

const appInfo = {
  version: "1.0.0",
  build: "2569.01.30",
  environment: "Production",
};

const features = [
  { icon: Icons.mapPin, title: "ตีเกม", description: "ค้นหาสนามแบดมินตันใกล้คุณ" },
  { icon: Icons.users, title: "หาก๊วน", description: "เข้าร่วมก๊วนตีแบดกับคนอื่น" },
  { icon: Icons.trophy, title: "แข่งขัน", description: "สมัครแข่งขันและดูผลลัพธ์" },
  { icon: Icons.ranking, title: "Ranking", description: "จัดอันดับและ Ladder System" },
  { icon: Icons.scoreboard, title: "Scoreboard", description: "บันทึกคะแนนการเล่น" },
  { icon: Icons.shuffle, title: "สุ่มจับคู่", description: "สร้างตารางการแข่งขัน" },
];

const socialLinks = [
  { icon: Icons.share, label: "Website", href: "https://topminton.app" },
  { icon: Icons.message, label: "Facebook", href: "https://facebook.com/topminton" },
  { icon: Icons.message, label: "LINE Official", href: "https://line.me/ti/p/@topminton" },
];

export default function AboutPage() {
  return (
    <AppShell hideNav>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/more" className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </Link>
          <h1 className="text-lg font-semibold">เกี่ยวกับแอป</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* App Logo & Info */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <ShuttlecockIcon size={40} className="text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Topminton</h2>
          <p className="text-muted-foreground">แอปนักแบดมินตันไทย</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Version {appInfo.version}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">Build {appInfo.build}</span>
          </div>
        </div>

        {/* Features */}
        <GlassCard className="p-4">
          <h3 className="font-semibold text-foreground mb-4">ฟีเจอร์หลัก</h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Social Links */}
        <GlassCard className="p-4">
          <h3 className="font-semibold text-foreground mb-4">ติดตามเรา</h3>
          <div className="space-y-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 tap-highlight"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <link.icon size={20} className="text-primary" />
                </div>
                <span className="flex-1 font-medium text-foreground">{link.label}</span>
                <Icons.chevronRight size={20} className="text-muted-foreground" />
              </a>
            ))}
          </div>
        </GlassCard>

        {/* Legal Links */}
        <GlassCard className="p-4">
          <h3 className="font-semibold text-foreground mb-4">ข้อมูลทางกฎหมาย</h3>
          <div className="space-y-2">
            <Link href="/terms" className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 tap-highlight">
              <Icons.document size={20} className="text-muted-foreground" />
              <span className="flex-1 text-foreground">เงื่อนไขการใช้งาน</span>
              <Icons.chevronRight size={20} className="text-muted-foreground" />
            </Link>
            <Link href="/privacy" className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 tap-highlight">
              <Icons.shield size={20} className="text-muted-foreground" />
              <span className="flex-1 text-foreground">นโยบายความเป็นส่วนตัว</span>
              <Icons.chevronRight size={20} className="text-muted-foreground" />
            </Link>
          </div>
        </GlassCard>

        {/* Developer Info */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Made with love for Thai Badminton Community</p>
          <p className="text-xs text-muted-foreground mt-1">2024 - 2569 Topminton. All rights reserved.</p>
        </div>

        {/* Check for Updates */}
        <Button variant="outline" className="w-full bg-transparent">
          <Icons.refresh size={16} className="mr-2" />
          ตรวจสอบอัปเดต
        </Button>
      </div>
    </AppShell>
  );
}
