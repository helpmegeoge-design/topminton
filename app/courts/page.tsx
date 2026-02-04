"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { ArrowLeftIcon, SearchIcon, FilterIcon, StarIcon, ClockIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { CourtCard } from "@/components/courts/court-card";
import { PlusIcon } from "lucide-react";

export default function CourtsPage() {
  const [courts, setCourts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourts = async () => {
      setIsLoading(true);
      const supabase = createClient();
      try {
        const { data, error } = await supabase.from('courts').select('*').order('created_at', { ascending: false });
        if (data) {
          setCourts(data.map((c) => ({
            id: c.id,
            name: c.name,
            address: c.address,
            imageUrl: c.images?.[0] || "/placeholder.svg",
            rating: Number(c.rating || 0),
            hours: (c.open_time && c.close_time) ? `${c.open_time} - ${c.close_time}` : "09:00 - 22:00",
            pricePerHour: Number(c.price_per_hour),
            courtCount: c.court_count || 1,
            facilities: c.amenities || [],
          })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourts();
  }, []);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center tap-highlight transition-colors">
            <ArrowLeftIcon size={24} className="text-gray-900" />
          </Link>
          <div className="flex-1 text-center font-bold text-lg">รายการสนามแบดมินตัน</div>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 min-h-screen bg-gray-50/50">

        {/* Action Button */}
        <Link
          href="/courts/new"
          className="w-full h-14 bg-gradient-to-r from-[#FF9500] to-[#FF5E3A] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <PlusIcon className="w-6 h-6" />
          <span>ลงทะเบียนสนามใหม่</span>
        </Link>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">ทั้งหมด {courts.length} สนาม</h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : courts.length > 0 ? (
          <div className="space-y-4">
            {courts.map((court) => (
              <CourtCard key={court.id} {...court} className="bg-white shadow-sm border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <SearchIcon className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-lg">ยังไม่มีสนามแบดมินตัน</h3>
              <p className="text-sm text-gray-500 px-10">
                เพิ่มสนามใหม่ได้ง่ายๆ เพียงกดปุ่มด้านบน
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
