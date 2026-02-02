"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Switch } from "@/components/ui/switch";
import { ChevronLeftIcon, Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface SettingToggle {
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<SettingToggle[]>([
    { key: "party", label: "แจ้งเตือนก๊วน", description: "เมื่อมีคนเข้าร่วมหรือออกจากก๊วน", enabled: true },
    { key: "chat", label: "แจ้งเตือนข้อความ", description: "เมื่อได้รับข้อความใหม่", enabled: true },
    { key: "tournament", label: "แจ้งเตือนการแข่งขัน", description: "ข่าวสารการแข่งขัน", enabled: true },
    { key: "quest", label: "แจ้งเตือนภารกิจ", description: "เมื่อมีภารกิจใหม่หรือใกล้หมดเวลา", enabled: false },
    { key: "promo", label: "โปรโมชั่น", description: "ข้อเสนอพิเศษและส่วนลด", enabled: false },
  ]);

  const [privacy, setPrivacy] = useState<SettingToggle[]>([
    { key: "profile_public", label: "โปรไฟล์สาธารณะ", description: "ให้ทุกคนดูโปรไฟล์ได้", enabled: true },
    { key: "show_online", label: "แสดงสถานะออนไลน์", enabled: true },
    { key: "show_stats", label: "แสดงสถิติการเล่น", enabled: true },
    { key: "allow_challenge", label: "อนุญาตให้ท้าแข่ง", enabled: true },
  ]);

  const toggleNotification = (key: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const togglePrivacy = (key: string) => {
    setPrivacy((prev) =>
      prev.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const menuItems = [
    { icon: Icons.profile, label: "บัญชีของฉัน", href: "/settings/account" },
    { icon: Icons.shield, label: "ความปลอดภัย", href: "/settings/security" },
    { icon: Icons.share, label: "เชื่อมต่อบัญชี", href: "/settings/connect" },
    { icon: Icons.coins, label: "การชำระเงิน", href: "/settings/payment" },
  ];

  const supportItems = [
    { icon: Icons.info, label: "ศูนย์ช่วยเหลือ", href: "/help" },
    { icon: Icons.document, label: "ข้อกำหนดการใช้งาน", href: "/terms" },
    { icon: Icons.shield, label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
    { icon: Icons.info, label: "เกี่ยวกับแอป", href: "/about" },
  ];

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/more" className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </Link>
          <h1 className="font-semibold text-foreground">ตั้งค่า</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="p-4 pb-24 space-y-6">
        {/* Account Section */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">บัญชี</h2>
          <GlassCard className="divide-y divide-border">
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <div className="flex items-center gap-3 p-4 tap-highlight">
                  <item.icon size={20} className="text-muted-foreground" />
                  <span className="flex-1 text-foreground">{item.label}</span>
                  <Icons.chevronRight size={18} className="text-muted-foreground" />
                </div>
              </Link>
            ))}
          </GlassCard>
        </section>

        {/* Notifications Section */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">การแจ้งเตือน</h2>
          <GlassCard className="divide-y divide-border">
            {notifications.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <p className="text-foreground">{setting.label}</p>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                  )}
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={() => toggleNotification(setting.key)}
                />
              </div>
            ))}
          </GlassCard>
        </section>

        {/* Privacy Section */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">ความเป็นส่วนตัว</h2>
          <GlassCard className="divide-y divide-border">
            {privacy.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <p className="text-foreground">{setting.label}</p>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                  )}
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={() => togglePrivacy(setting.key)}
                />
              </div>
            ))}
          </GlassCard>
        </section>

        {/* Support Section */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">สนับสนุน</h2>
          <GlassCard className="divide-y divide-border">
            {supportItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <div className="flex items-center gap-3 p-4 tap-highlight">
                  <item.icon size={20} className="text-muted-foreground" />
                  <span className="flex-1 text-foreground">{item.label}</span>
                  <Icons.chevronRight size={18} className="text-muted-foreground" />
                </div>
              </Link>
            ))}
          </GlassCard>
        </section>

        {/* App Info */}
        <section className="text-center py-4">
          <p className="text-sm text-muted-foreground">Topminton v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">Made with love in Thailand</p>
        </section>

        {/* Logout Button */}
        <button
          type="button"
          className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-medium tap-highlight hover:bg-red-500/20 transition-colors"
        >
          ออกจากระบบ
        </button>
      </main>
    </AppShell>
  );
}
