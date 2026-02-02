"use client";

import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import Link from "next/link";

const toolItems = [
  {
    icon: Icons.scoreboard,
    label: "Scoreboard",
    description: "บันทึกคะแนนแบดมินตัน",
    href: "/tools/scoreboard",
    badge: "ใหม่",
  },
  {
    icon: Icons.shuffle,
    label: "สุ่มจับคู่",
    description: "สร้างตารางการแข่งขัน",
    href: "/tools/team-generator",
    badge: "ใหม่",
  },
  {
    icon: Icons.mapPin,
    label: "แนะนำคอร์ท",
    description: "แนะนำคอร์ทที่คุณรู้จัก",
    href: "/courts/suggest",
  },
  {
    icon: Icons.ranking,
    label: "Ranking",
    description: "จัดอันดับและ Ladder",
    href: "/ranking",
  },
  {
    icon: Icons.trophy,
    label: "ภารกิจ",
    description: "ทำภารกิจรับ TB Points",
    href: "/quests",
  },
  {
    icon: Icons.star,
    label: "วัดระดับฝีมือ",
    description: "ทดสอบและรับใบรับรอง",
    href: "/assessment",
  },
  {
    icon: Icons.bag,
    label: "Marketplace",
    description: "ซื้อ-ขายอุปกรณ์แบดมินตัน",
    href: "/marketplace",
    badge: "ใหม่",
  },
  {
    icon: Icons.heart,
    label: "รายการโปรด",
    description: "คอร์ทและก๊วนที่บันทึกไว้",
    href: "/favorites",
  },
];

const accountItems = [
  {
    icon: Icons.message,
    label: "ข้อความ",
    href: "/messages",
    badge: 3,
  },
  {
    icon: Icons.bell,
    label: "การแจ้งเตือน",
    href: "/notifications",
  },
  {
    icon: Icons.users,
    label: "ก๊วนของฉัน",
    href: "/party/my",
  },
  {
    icon: Icons.settings,
    label: "ตั้งค่า",
    href: "/settings",
  },
];

const helpItems = [
  {
    icon: Icons.info,
    label: "ศูนย์ช่วยเหลือ",
    href: "/help",
  },
  {
    icon: Icons.document,
    label: "เงื่อนไขการใช้งาน",
    href: "/terms",
  },
  {
    icon: Icons.shield,
    label: "นโยบายความเป็นส่วนตัว",
    href: "/privacy",
  },
];

export default function MorePage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3">
            <h1 className="text-xl font-semibold text-foreground">อื่นๆ</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Account Section */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              บัญชี
            </h2>
            <div className="space-y-2">
              {accountItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <GlassCard className="p-4 flex items-center gap-3 tap-highlight">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="flex-1 font-medium text-foreground">
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge className="bg-[#FA383E] text-white text-xs px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                    <Icons.chevronRight className="h-5 w-5 text-muted-foreground" />
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>

          {/* Tools Section */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              เครื่องมือ
            </h2>
            <div className="space-y-2">
              {toolItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <GlassCard className="p-4 flex items-center gap-3 tap-highlight">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF9500]/10 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-[#FF9500]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {item.label}
                        </span>
                        {item.badge && (
                          <Badge className="bg-[#FA383E] text-white text-xs px-1.5 py-0">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Icons.chevronRight className="h-5 w-5 text-muted-foreground" />
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              ช่วยเหลือ
            </h2>
            <GlassCard className="divide-y divide-border">
              {helpItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 p-4 tap-highlight"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-foreground">{item.label}</span>
                  <Icons.chevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </GlassCard>
          </div>

          {/* App Version */}
          <div className="text-center pt-8">
            <p className="text-sm text-muted-foreground">
              Topminton v1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Made with love for Thai badminton players
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
