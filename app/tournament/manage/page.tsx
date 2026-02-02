"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";

type Tournament = {
  id: string;
  name: string;
  status: "draft" | "open" | "ongoing" | "completed";
  date: string;
  participants: number;
  maxParticipants: number;
  format: string;
};

const mockTournaments: Tournament[] = [
  {
    id: "1",
    name: "Topminton Cup 2026",
    status: "ongoing",
    date: "1 ก.พ. 2569",
    participants: 32,
    maxParticipants: 32,
    format: "Single Elimination",
  },
  {
    id: "2",
    name: "Weekend Challenge",
    status: "open",
    date: "15 ก.พ. 2569",
    participants: 12,
    maxParticipants: 16,
    format: "Round Robin",
  },
  {
    id: "3",
    name: "Pro League Season 1",
    status: "draft",
    date: "1 มี.ค. 2569",
    participants: 0,
    maxParticipants: 64,
    format: "Swiss System",
  },
];

const statusConfig = {
  draft: { label: "แบบร่าง", color: "bg-muted text-muted-foreground" },
  open: { label: "เปิดรับสมัคร", color: "bg-green-500/20 text-green-600" },
  ongoing: { label: "กำลังแข่งขัน", color: "bg-primary/20 text-primary" },
  completed: { label: "เสร็จสิ้น", color: "bg-muted text-muted-foreground" },
};

export default function TournamentManagePage() {
  const [activeTab, setActiveTab] = useState("my-tournaments");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AppShell title="จัดการแข่งขัน" showBack backHref="/tournament">
      <div className="p-4 pb-24 space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">3</p>
            <p className="text-xs text-muted-foreground">รายการทั้งหมด</p>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">1</p>
            <p className="text-xs text-muted-foreground">กำลังดำเนินการ</p>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">44</p>
            <p className="text-xs text-muted-foreground">ผู้เข้าร่วมรวม</p>
          </GlassCard>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-tournaments">รายการของฉัน</TabsTrigger>
            <TabsTrigger value="create">สร้างใหม่</TabsTrigger>
          </TabsList>

          <TabsContent value="my-tournaments" className="mt-4 space-y-4">
            {mockTournaments.map((tournament) => (
              <GlassCard key={tournament.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {tournament.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[tournament.status].color}`}
                      >
                        {statusConfig[tournament.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icons.calendar size={12} />
                        {tournament.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icons.users size={12} />
                        {tournament.participants}/{tournament.maxParticipants}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    {tournament.format}
                  </span>
                  <div className="flex gap-2">
                    {tournament.status === "ongoing" && (
                      <Link href={`/tournament/${tournament.id}/bracket`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent">
                          <Icons.eye size={14} className="mr-1" />
                          Bracket
                        </Button>
                      </Link>
                    )}
                    <Link href={`/tournament/manage/${tournament.id}`}>
                      <Button size="sm" className="h-8 text-xs">
                        <Icons.edit size={14} className="mr-1" />
                        จัดการ
                      </Button>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </TabsContent>

          <TabsContent value="create" className="mt-4">
            <GlassCard className="p-4 space-y-4">
              <h3 className="font-semibold text-foreground">สร้างการแข่งขันใหม่</h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">ชื่อการแข่งขัน</Label>
                  <Input id="name" placeholder="เช่น Topminton Cup 2026" className="mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date">วันที่แข่งขัน</Label>
                    <Input id="date" type="date" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="max">จำนวนผู้เข้าแข่งขัน</Label>
                    <Input id="max" type="number" placeholder="16" className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label>รูปแบบการแข่งขัน</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { id: "single", label: "Single Elimination", desc: "แพ้คัดออก" },
                      { id: "double", label: "Double Elimination", desc: "แพ้ 2 ครั้งคัดออก" },
                      { id: "round", label: "Round Robin", desc: "พบกันหมด" },
                      { id: "swiss", label: "Swiss System", desc: "จับคู่ตามคะแนน" },
                    ].map((format) => (
                      <button
                        key={format.id}
                        type="button"
                        className="p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 text-left transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground">{format.label}</p>
                        <p className="text-xs text-muted-foreground">{format.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>ประเภทการแข่งขัน</Label>
                  <div className="flex gap-2 mt-2">
                    {["ชายเดี่ยว", "หญิงเดี่ยว", "ชายคู่", "หญิงคู่", "คู่ผสม"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className="px-3 py-1.5 rounded-full text-xs border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full">
                    <Icons.plus size={16} className="mr-2" />
                    สร้างการแข่งขัน
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Features Info */}
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-foreground">ฟีเจอร์ที่รองรับ</h4>
              {[
                { icon: Icons.users, title: "จัดการผู้เข้าแข่งขัน", desc: "เพิ่ม/ลบ/แก้ไขรายชื่อ" },
                { icon: Icons.shuffle, title: "สร้าง Bracket อัตโนมัติ", desc: "จับฉลากและสร้างสายแข่ง" },
                { icon: Icons.scoreboard, title: "Live Scoring", desc: "บันทึกคะแนนแบบเรียลไทม์" },
                { icon: Icons.share, title: "แชร์ผลการแข่งขัน", desc: "Export และแชร์ได้ทันที" },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
