"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/icons";
import Image from "next/image";

const mockTournament = {
  id: "1",
  name: "CENTNOX SO HOT PATHUM THANI TOURNAMENT",
  location: "Sport Refresh ลำลูกกา คลอง 4",
  poster: "/images/tournaments/tournament-1.jpg",
  status: "open",
  registrationDate: "17 ธ.ค. 2568 - 27 ก.พ. 2569",
  competitionDate: "1 มี.ค. 2569 - 1 มี.ค. 2569",
  price: 1700,
  description:
    "เตรียมตัวให้พร้อมกับศึก CENTNOX SO HOT PATHUM THANI TOURNAMENT! ชิงเงินรางวัลรวมกว่าหลักหมื่น พร้อมพิสูจน์ฝีมือทั้ง 3 ระดับความมันส์ วันที่ 1 มีนาคม 2569 นี้ที่สนาม Sport Refresh ลำลูกกา คลอง 4—สมัครเลยก่อนเต็ม!",
  levels: [
    { id: 1, name: "Level 1", teams: 1, maxTeams: 32, color: "#31A24C" },
    { id: 2, name: "Level 2", teams: 5, maxTeams: 32, color: "#F5A623" },
    { id: 3, name: "Level 3", teams: 1, maxTeams: 16, color: "#31A24C" },
  ],
  contact: {
    phone: "0968250321",
    line: "@0968250321",
  },
};

export default function TournamentDetailPage() {
  const router = useRouter();

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <Icons.chevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Poster */}
        <div className="relative">
          <Image
            src={mockTournament.poster || "/placeholder.svg"}
            alt={mockTournament.name}
            width={400}
            height={400}
            className="w-full aspect-square object-cover"
          />
          <Badge className="absolute top-3 left-3 bg-[#31A24C] text-white">
            กำลังรับสมัคร
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-black/30 rounded-full"
          >
            <Icons.maximize className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <h1 className="text-xl font-bold text-foreground">
            {mockTournament.name}
          </h1>

          {/* Info Cards */}
          <GlassCard className="p-4 border-l-4 border-l-[#31A24C]">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icons.calendar className="h-4 w-4" />
              <span className="text-sm">วันรับสมัคร</span>
            </div>
            <p className="text-foreground font-medium">
              {mockTournament.registrationDate}
            </p>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-[#F7B928]">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icons.trophy className="h-4 w-4" />
              <span className="text-sm">วันแข่งขัน</span>
            </div>
            <p className="text-foreground font-medium">
              {mockTournament.competitionDate}
            </p>
          </GlassCard>

          <GlassCard className="p-4 border-l-4 border-l-[#F7B928]">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icons.coins className="h-4 w-4" />
              <span className="text-sm">ค่าสมัคร</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ฿{mockTournament.price.toLocaleString()}
            </p>
          </GlassCard>

          {/* Description */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-foreground mb-2">รายละเอียด</h3>
            <p className="text-muted-foreground">{mockTournament.description}</p>
          </GlassCard>

          {/* Levels */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-foreground mb-4">รายการแข่งขัน</h3>
            <div className="space-y-4">
              {mockTournament.levels.map((level) => (
                <div key={level.id} className="border border-border rounded-2xl p-4">
                  <Badge
                    style={{ backgroundColor: level.color }}
                    className="text-white mb-3"
                  >
                    {level.name}
                  </Badge>
                  <Button
                    variant="default"
                    style={{ backgroundColor: level.color }}
                    className="w-full mb-3 text-white"
                  >
                    รายชื่อผู้แข่งขัน/สมัคร
                  </Button>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Icons.users className="h-4 w-4" />
                      จำนวนทีม
                    </span>
                    <span>
                      <span className="text-foreground font-medium">
                        {level.teams}
                      </span>
                      /{level.maxTeams}
                    </span>
                  </div>
                  <Progress
                    value={(level.teams / level.maxTeams) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {Math.round((level.teams / level.maxTeams) * 100)}% เต็ม
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Contact */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-foreground mb-4">ติดต่อสอบถาม</h3>
            <div className="space-y-3">
              <a
                href={`tel:${mockTournament.contact.phone}`}
                className="flex items-center gap-3 p-3 bg-secondary rounded-xl"
              >
                <div className="w-10 h-10 bg-[#31A24C]/10 rounded-full flex items-center justify-center">
                  <Icons.phone className="h-5 w-5 text-[#31A24C]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">โทรศัพท์</p>
                  <p className="text-foreground font-medium">
                    {mockTournament.contact.phone}
                  </p>
                </div>
                <Icons.chevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
              <a
                href={`https://line.me/R/ti/p/${mockTournament.contact.line}`}
                className="flex items-center gap-3 p-3 bg-secondary rounded-xl"
              >
                <div className="w-10 h-10 bg-[#06C755]/10 rounded-full flex items-center justify-center">
                  <Icons.message className="h-5 w-5 text-[#06C755]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">LINE</p>
                  <p className="text-foreground font-medium">
                    {mockTournament.contact.line}
                  </p>
                </div>
                <Icons.chevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </GlassCard>
        </div>

        {/* Fixed Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-bottom">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ค่าสมัคร</p>
              <p className="text-xl font-bold text-[#FF9500]">
                ฿{mockTournament.price.toLocaleString()}
              </p>
            </div>
            <Button className="bg-[#FF9500] hover:bg-[#FF9500]/90 text-white rounded-2xl px-8 py-6">
              <Icons.send className="h-5 w-5 mr-2" />
              สมัครเข้าร่วม
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
