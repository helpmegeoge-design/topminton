"use client";

import { AppShell } from "@/components/app-shell";
import { BellIcon } from "@/components/icons";
import { TBPointsWidget } from "@/components/home/tb-points-widget";
import { PromoBanner } from "@/components/home/promo-banner";
import { QuickMenu } from "@/components/home/quick-menu";
import { QuestWidget } from "@/components/home/quest-widget";
import { CourtCard } from "@/components/courts/court-card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { AnimatedList, AnimatedItem } from "@/components/ui/animated-list";

// Fallback mock data
const mockCourts = [
  {
    id: "1",
    name: "Ice Burg badminton",
    address: "45 ถนน วุฒากาศ แขวงตลาดพลู เขตธนบุรี",
    imageUrl: "/images/courts/court-1.jpg",
    rating: 4.5,
    distance: "2.3 กม.",
    hours: "06:00-24:00",
    courtCount: 8,
    pricePerHour: 120,
    facilities: ["ที่จอดรถ", "ห้องอาบน้ำ", "เช่าไม้แบด"],
    isPopular: true,
  },
  {
    id: "2",
    name: "BBW BADMINTON",
    address: "123 ถนน สุขุมวิท แขวงคลองเตย",
    imageUrl: "/images/courts/court-2.jpg",
    rating: 4.8,
    distance: "3.5 กม.",
    hours: "08:00-22:00",
    courtCount: 12,
    pricePerHour: 180,
    facilities: ["ที่จอดรถ", "EV Charging", "ห้องอาบน้ำ"],
    isPopular: true,
  },
  {
    id: "3",
    name: "สนามแบดมินตันบางนา",
    address: "456 ถนน บางนา-ตราด แขวงบางนา",
    imageUrl: "/images/courts/court-3.jpg",
    rating: 4.2,
    distance: "5.1 กม.",
    hours: "10:00-22:00",
    courtCount: 6,
    pricePerHour: 100,
    facilities: ["ที่จอดรถ"],
    isPopular: false,
  },
];

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { text: "สวัสดีตอนเช้า", emoji: "☀️" };
  } else if (hour >= 12 && hour < 17) {
    return { text: "สวัสดีตอนบ่าย", emoji: "🌤️" };
  } else if (hour >= 17 && hour < 21) {
    return { text: "สวัสดีตอนเย็น", emoji: "🌅" };
  } else {
    return { text: "สวัสดีตอนดึก", emoji: "🌙" };
  }
}

export default function HomePage() {
  const greeting = getGreeting();
  const [courts, setCourts] = useState<any[]>(mockCourts);
  const [isLoading, setIsLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  const [partyCount, setPartyCount] = useState(0);
  const [currentDayName, setCurrentDayName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // Set Thai Day Name
      const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
      const today = new Date();
      setCurrentDayName(days[today.getDay()]);

      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      // 1. Fetch User Profile for Points
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', user.id)
            .single();
          if (profile) setUserPoints(profile.points || 0);
        }
      } catch (e) { console.error("Profile fetch error", e); }

      // 2. Fetch Party Count for Today
      try {
        const now = new Date();
        // Force Thailand Timezone for correct date string
        const bangkokDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
        const dateStr = bangkokDate.getFullYear() + '-' +
          String(bangkokDate.getMonth() + 1).padStart(2, '0') + '-' +
          String(bangkokDate.getDate()).padStart(2, '0');

        const hour = String(bangkokDate.getHours()).padStart(2, '0');
        const minute = String(bangkokDate.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${hour}:${minute}`;

        // Fetch parties for today
        const { data: parties, error } = await supabase
          .from('parties')
          .select('id, start_time')
          .eq('date', dateStr);

        if (!error && parties) {
          // Filter: only future parties
          // Time comparison
          const upcoming = parties.filter(p => {
            // Handle if DB time has seconds (e.g., 18:00:00)
            // Use p.start_time instead of p.time
            const partyTime = p.start_time.length > 5 ? p.start_time.substring(0, 5) : p.start_time;
            return partyTime > currentTimeStr;
          });

          console.log(`Checking parties for ${dateStr} at ${currentTimeStr}`);
          console.log(`Total found: ${parties.length}, Upcoming: ${upcoming.length}`);

          setPartyCount(upcoming.length);
        }
      } catch (e) { console.error("Party count error", e); }

      // 3. Fetch Courts
      try {
        const { data, error } = await supabase
          .from('courts')
          .select('*')
          .limit(5);

        if (error) {
          console.error("Error fetching courts:", error);
        } else if (data && data.length > 0) {
          const formattedCourts = data.map((court) => ({
            id: court.id,
            name: court.name,
            address: court.address,
            imageUrl: court.images?.[0] || "/placeholder.svg",
            rating: Number(court.rating) || 0,
            distance: "2.5 กม.",
            hours: "09:00-22:00",
            courtCount: court.court_count || 1,
            pricePerHour: Number(court.price_per_hour) || 100,
            facilities: court.amenities || [],
            isPopular: court.rating > 4.5,
          }));
          setCourts(formattedCourts);
        }
      } catch (err) {
        console.error("Exception fetching courts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 h-14 safe-area-top">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">Topminton</h1>
          </div>
          <div className="flex items-center gap-3">
            <TBPointsWidget points={userPoints} />
            <Link
              href="/notifications"
              className="relative p-2 rounded-full hover:bg-muted tap-highlight"
            >
              <BellIcon size={22} className="text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B6B] rounded-full" />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* Greeting */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{greeting.emoji}</span>
          <h2 className="text-lg font-semibold text-foreground">{greeting.text}</h2>
        </div>

        {/* Promo Banner */}
        <PromoBanner
          title={`${currentDayName || 'วันนี้'}อย่าอยู่นิ่ง!`}
          subtitle="มาตีแบดกันเถอะ"
          count={partyCount}
          countLabel="ก๊วนวันนี้"
          href="/party"
        />

        {/* Quick Menu */}
        <section>
          <QuickMenu />
        </section>

        {/* Quest Widget */}
        <section>
          <QuestWidget
            quests={[
              { id: "1", title: "ตีแบด 1 ครั้งวันนี้", progress: 0, target: 1, reward: 10, type: "daily" },
              { id: "2", title: "เข้าร่วมก๊วน 3 ครั้ง", progress: 2, target: 3, reward: 50, type: "weekly" },
            ]}
            streak={5}
          />
        </section>

        {/* Popular Players Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">นักแบดประจำสัปดาห์</h3>
            <button type="button" className="text-sm text-primary font-medium">
              ดูทั้งหมด
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {[
              { id: 1, name: "แชมป์", avatar: "/images/avatars/avatar-1.jpg", matches: 89 },
              { id: 2, name: "นัท", avatar: "/images/avatars/avatar-2.jpg", matches: 76 },
              { id: 3, name: "กิม", avatar: "/images/avatars/avatar-3.jpg", matches: 65 },
              { id: 4, name: "สมชาย", avatar: "/images/avatars/avatar-4.jpg", matches: 41 },
              { id: 5, name: "วิชัย", avatar: "/images/avatars/avatar-1.jpg", matches: 38 },
            ].map((player) => (
              <div
                key={player.id}
                className="flex flex-col items-center gap-2 min-w-[72px]"
              >
                <div className="w-14 h-14 rounded-full bg-muted overflow-hidden ring-2 ring-primary/20">
                  <img
                    src={player.avatar || "/placeholder.svg"}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {player.name}
                  </p>
                  <p className="text-xs text-primary font-semibold">
                    {player.matches} แมตช์
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Courts Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">คอร์ทแบดยอดนิยม</h3>
            <Link href="/courts" className="text-sm text-primary font-medium hover:underline">
              ดูทั้งหมด
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 w-full bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <AnimatedList className="space-y-3">
              {courts.map((court) => (
                <AnimatedItem key={court.id}>
                  <CourtCard {...court} />
                </AnimatedItem>
              ))}
            </AnimatedList>
          )}
        </section>
      </div>
    </AppShell>
  );
}
