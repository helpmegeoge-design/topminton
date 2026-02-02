"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { ArrowLeftIcon, FilterIcon, SearchIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CourtCard } from "@/components/courts/court-card";

const filterChips = [
  "ที่จอดรถ",
  "ห้องอาบน้ำ",
  "EV Charging",
  "เช่าไม้แบด",
  "ร้านอาหาร",
];

export default function CourtsPage() {
  const [courts, setCourts] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourts = async () => {
      setIsLoading(true);
      const supabase = createClient();

      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('courts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching courts:", error);
          return;
        }

        if (data) {
          const formattedCourts = data.map((court) => ({
            id: court.id,
            name: court.name,
            address: court.address,
            imageUrl: court.images?.[0] || "/placeholder.svg",
            rating: Number(court.rating) || 0,
            distance: "3.5 กม.", // Placeholder distance
            hours: "09:00-22:00", // Default
            courtCount: court.court_count || 1,
            pricePerHour: Number(court.price_per_hour) || 100,
            facilities: court.amenities || [],
            isPopular: Number(court.rating) > 4.5,
          }));
          setCourts(formattedCourts);
        }
      } catch (err) {
        console.error("Exception fetching courts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourts();
  }, []);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredCourts = courts.filter(court => {
    if (activeFilters.length === 0) return true;
    return activeFilters.every(filter => court.facilities.includes(filter));
  });

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-full hover:bg-muted/50 flex items-center justify-center tap-highlight transition-colors"
          >
            <ArrowLeftIcon size={24} className="text-foreground" />
          </Link>

          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาสนามแบด..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-muted/50 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
            />
          </div>

          <button
            type="button"
            className="w-10 h-10 rounded-full hover:bg-muted/50 flex items-center justify-center tap-highlight transition-colors"
          >
            <FilterIcon size={20} className="text-foreground" />
          </button>
        </div>

        {/* Filter chips */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filterChips.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => toggleFilter(filter)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all tap-highlight border",
                  activeFilters.includes(filter)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Courts List */}
      <div className="px-4 py-4 space-y-3 min-h-screen bg-muted/30">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">ทั้งหมด {filteredCourts.length} สนาม</h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredCourts.length > 0 ? (
          <div className="space-y-4">
            {filteredCourts.map((court) => (
              <CourtCard key={court.id} {...court} className="bg-card shadow-sm border border-border/50" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>ไม่พบสนามที่คุณค้นหา</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
