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
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { AnimatedList, AnimatedItem } from "@/components/ui/animated-list";
import { NotificationPopup } from "@/components/notification-popup";
import { OnlineUsers } from "@/components/online-users";

// Fallback mock data
const mockCourts = [
  {
    id: "1",
    name: "Ice Burg badminton",
    imageUrl: "/images/courts/court-1.jpg",
    rating: 4.5,
    distance: "2.3 กม.",
    pricePerHour: 120,
    isPopular: true,
  }
];

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: "สวัสดีตอนเช้า", emoji: "☀️" };
  if (hour >= 12 && hour < 17) return { text: "สวัสดีตอนบ่าย", emoji: "🌤️" };
  if (hour >= 17 && hour < 21) return { text: "สวัสดีตอนเย็น", emoji: "🌅" };
  return { text: "สวัสดีตอนดึก", emoji: "🌙" };
}

export default function HomePage() {
  const greeting = getGreeting();
  const [courts, setCourts] = useState<any[]>([]);
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

      // Parallel Fetching Functions
      const fetchPoints = async () => {
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
        } catch (e) { console.error("Error fetching points:", e); }
      };

      const fetchParties = async () => {
        try {
          const bangkokDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
          const dateStr = bangkokDate.toISOString().split('T')[0];
          const currentTimeStr = bangkokDate.toTimeString().split(' ')[0].substring(0, 5);

          const { data: parties } = await supabase
            .from('parties')
            .select('id, start_time')
            .eq('date', dateStr);

          if (parties) {
            const upcoming = parties.filter(p => p.start_time.substring(0, 5) > currentTimeStr);
            setPartyCount(upcoming.length);
          }
        } catch (e) { console.error("Error fetching parties:", e); }
      };

      const fetchCourts = async () => {
        try {
          // Add limit to ensure fast response
          const { data } = await supabase.from('courts').select('*').limit(6);
          if (data && data.length > 0) {
            setCourts(data.map(c => ({
              id: c.id,
              name: c.name,
              address: c.address,
              imageUrl: c.images?.[0] || "/placeholder.svg",
              rating: Number(c.rating) || 0,
              distance: "2.5 กม.",
              pricePerHour: Number(c.price_per_hour) || 100,
              facilities: c.amenities || [],
              isPopular: c.rating > 4.5,
            })));
          }
        } catch (e) { console.error("Error fetching courts:", e); }
      };

      // Execute all in parallel
      await Promise.allSettled([
        fetchPoints(),
        fetchParties(),
        fetchCourts()
      ]);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <AppShell>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300">
        <div className="flex items-center justify-between px-5 h-16 safe-area-top w-full">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#FF9500] to-[#FF5E3A] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform group-hover:-rotate-6 transition-transform duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="drop-shadow-sm">
                <path d="M12 2C10.8954 2 10 2.89543 10 4V6C10 7.10457 10.8954 8 12 8C13.1046 8 14 7.10457 14 6V4C14 2.89543 13.1046 2 12 2ZM8 9L4 13V16L8 12V9ZM16 9V12L20 16V13L16 9ZM12 10C10.3431 10 9 11.3431 9 13V17L12 22L15 17V13C15 11.3431 13.6569 10 12 10Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FF9500] group-hover:to-[#FF5E3A] transition-all">
              Topminton
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            <TBPointsWidget points={userPoints} />

            <div className="w-[1px] h-6 bg-gray-200"></div>

            <NotificationPopup />
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{greeting.emoji}</span>
          <h2 className="text-lg font-semibold">{greeting.text}</h2>
        </div>

        <PromoBanner
          title={`${currentDayName || 'วันนี้'}อย่าอยู่นิ่ง!`}
          subtitle="มาตีแบดกันเถอะ"
          count={partyCount}
          countLabel="ก๊วนวันนี้"
          href="/party"
        />

        <QuickMenu />

        {/* Online Players */}
        <OnlineUsers />

        {/* Popular Courts */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">คอร์ทแบดยอดนิยม</h3>
            <Link href="/courts" className="text-sm text-primary font-medium">ดูทั้งหมด</Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-28 w-full bg-muted animate-pulse rounded-2xl" />)}
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
    </AppShell >
  );
}

// -- Components --


