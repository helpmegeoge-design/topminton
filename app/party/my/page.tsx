"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons, ArrowLeftIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type PartyStatus = "upcoming" | "completed" | "cancelled";

interface Party {
  id: string;
  name: string;
  courtName: string;
  date: string;
  time: string;
  status: PartyStatus;
  participants: number;
  maxParticipants: number;
  isOrganizer: boolean;
  totalCost?: number;
  myShare?: number;
  isPaid?: boolean;
}

const mockParties: Party[] = [
  {
    id: "1",
    name: "ก๊วนพุธสุข",
    courtName: "สนามแบดมินตัน S.T.",
    date: "29 ม.ค. 2569",
    time: "18:00-20:00",
    status: "upcoming",
    participants: 6,
    maxParticipants: 10,
    isOrganizer: true,
  },
  {
    id: "2",
    name: "ตีแบดยามเย็น",
    courtName: "Smash! Badminton",
    date: "25 ม.ค. 2569",
    time: "19:00-21:00",
    status: "completed",
    participants: 8,
    maxParticipants: 8,
    isOrganizer: false,
    totalCost: 900,
    myShare: 112.5,
    isPaid: true,
  },
  {
    id: "3",
    name: "Pro Night",
    courtName: "สนามแบดมินตันบางนา",
    date: "20 ม.ค. 2569",
    time: "20:00-22:00",
    status: "completed",
    participants: 6,
    maxParticipants: 8,
    isOrganizer: false,
    totalCost: 720,
    myShare: 120,
    isPaid: false,
  },
  {
    id: "4",
    name: "ก๊วนวันหยุด",
    courtName: "Court Arena",
    date: "15 ม.ค. 2569",
    time: "10:00-12:00",
    status: "cancelled",
    participants: 3,
    maxParticipants: 8,
    isOrganizer: false,
  },
];

const statusConfig: Record<PartyStatus, { label: string; color: string }> = {
  upcoming: { label: "กำลังจะมาถึง", color: "bg-blue-500" },
  completed: { label: "เสร็จสิ้น", color: "bg-green-500" },
  cancelled: { label: "ยกเลิก", color: "bg-red-500" },
};

export default function MyPartiesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "organized" | "joined">("all");

  const filteredParties = mockParties.filter((party) => {
    if (activeTab === "organized") return party.isOrganizer;
    if (activeTab === "joined") return !party.isOrganizer;
    return true;
  });

  const upcomingCount = mockParties.filter((p) => p.status === "upcoming").length;
  const unpaidCount = mockParties.filter((p) => p.status === "completed" && !p.isPaid).length;

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/party" className="p-2 -ml-2 tap-highlight">
            <ArrowLeftIcon size={24} />
          </Link>
          <h1 className="font-semibold text-foreground">ก๊วนของฉัน</h1>
          <Link href="/party/create" className="p-2 -mr-2 tap-highlight">
            <Icons.plus size={24} className="text-primary" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-3">
          {[
            { key: "all", label: "ทั้งหมด" },
            { key: "organized", label: "ที่ฉันสร้าง" },
            { key: "joined", label: "ที่เข้าร่วม" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all tap-highlight",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 pb-24 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Icons.calendar size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{upcomingCount}</p>
                <p className="text-xs text-muted-foreground">นัดที่จะมาถึง</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Icons.coins size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unpaidCount}</p>
                <p className="text-xs text-muted-foreground">รอชำระ</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Party List */}
        <div className="space-y-3">
          {filteredParties.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Icons.users size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">ยังไม่มีก๊วน</p>
              <Link href="/party">
                <Button variant="outline" className="mt-4 bg-transparent">
                  หาก๊วนเลย
                </Button>
              </Link>
            </div>
          ) : (
            filteredParties.map((party) => (
              <Link key={party.id} href={`/party/${party.id}`}>
                <GlassCard className="p-4 tap-highlight">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{party.name}</h3>
                        {party.isOrganizer && (
                          <Badge className="bg-primary/10 text-primary text-[10px]">
                            ผู้จัด
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{party.courtName}</p>
                    </div>
                    <Badge className={cn("text-white text-[10px]", statusConfig[party.status].color)}>
                      {statusConfig[party.status].label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icons.calendar size={14} />
                      <span>{party.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icons.clock size={14} />
                      <span>{party.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icons.users size={14} />
                      <span>{party.participants}/{party.maxParticipants}</span>
                    </div>
                  </div>

                  {/* Payment Info for completed parties */}
                  {party.status === "completed" && party.myShare && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">ส่วนที่ต้องจ่าย</p>
                        <p className="font-semibold text-foreground">{party.myShare.toLocaleString()} บาท</p>
                      </div>
                      {party.isPaid ? (
                        <Badge className="bg-green-500/10 text-green-500">ชำระแล้ว</Badge>
                      ) : (
                        <Button size="sm" className="h-8">
                          ชำระเงิน
                        </Button>
                      )}
                    </div>
                  )}
                </GlassCard>
              </Link>
            ))
          )}
        </div>
      </main>
    </AppShell>
  );
}
