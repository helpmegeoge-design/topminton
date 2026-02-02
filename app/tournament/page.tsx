"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";

const statusFilters = [
  { id: "all", label: "ทั้งหมด" },
  { id: "open", label: "กำลังรับสมัคร" },
  { id: "upcoming", label: "เร็วๆ นี้" },
  { id: "closed", label: "ปิดรับสมัคร" },
];

const mockTournaments = [
  {
    id: "1",
    name: "CENTNOX SO HOT PATHUM THANI TOURNAMENT",
    location: "Sport Refresh ลำลูกกา คลอง 4",
    poster: "/images/tournaments/tournament-1.jpg",
    status: "open",
    registrationDate: "17 ธ.ค. 2568 - 27 ก.พ. 2569",
    competitionDate: "1 มี.ค. 2569",
    price: 1700,
  },
  {
    id: "2",
    name: "แบดมินตันสมัครเล่น รังสิต Open",
    location: "สนามแบดมินตันรังสิต",
    poster: "/images/tournaments/tournament-2.jpg",
    status: "upcoming",
    registrationDate: "1 ก.พ. - 15 ก.พ. 2569",
    competitionDate: "22 ก.พ. 2569",
    price: 1200,
  },
];

const statusColors: Record<string, string> = {
  open: "bg-[#31A24C] text-white",
  upcoming: "bg-[#F7B928] text-white",
  closed: "bg-[#65676B] text-white",
};

const statusLabels: Record<string, string> = {
  open: "กำลังรับสมัคร",
  upcoming: "ยังไม่เปิดรับสมัคร",
  closed: "ปิดรับสมัครแล้ว",
};

export default function TournamentPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTournaments = mockTournaments.filter((t) => {
    if (activeFilter !== "all" && t.status !== activeFilter) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">แข่งขัน</h1>
            <Link href="/tournament/create">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#FF9500] text-[#FF9500] bg-transparent"
              >
                <Icons.plus className="h-4 w-4 mr-1" />
                สร้างการแข่งขัน
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหารายการแข่งขัน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary border-0 rounded-xl"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {statusFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-full whitespace-nowrap ${
                  activeFilter === filter.id
                    ? "bg-[#FF9500] text-white hover:bg-[#FF9500]/90"
                    : "border-border hover:bg-accent"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tournament List */}
        <div className="p-4 space-y-4">
          {filteredTournaments.map((tournament) => (
            <Link key={tournament.id} href={`/tournament/${tournament.id}`}>
              <GlassCard className="overflow-hidden tap-highlight">
                <div className="relative">
                  <Image
                    src={tournament.poster || "/placeholder.svg"}
                    alt={tournament.name}
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                  <Badge
                    className={`absolute top-3 left-3 ${statusColors[tournament.status]}`}
                  >
                    {statusLabels[tournament.status]}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {tournament.name}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icons.mapPin className="h-4 w-4" />
                      <span>{tournament.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.calendar className="h-4 w-4" />
                      <span>รับสมัคร: {tournament.registrationDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.trophy className="h-4 w-4 text-[#F7B928]" />
                      <span>วันแข่ง: {tournament.competitionDate}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}

          {filteredTournaments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Icons.trophy className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">ไม่พบรายการแข่งขัน</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
