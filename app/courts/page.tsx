"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { ArrowLeftIcon, SearchIcon, FilterIcon, StarIcon, ClockIcon, Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { PlusIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface CompetitionRoom {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  status: string;
  players: any[];
}

export default function CourtsPage() {
  const [rooms, setRooms] = useState<CompetitionRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('competition_rooms')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (data) {
          setRooms(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="w-10 h-10 rounded-full hover:bg-muted/50 flex items-center justify-center tap-highlight transition-colors">
            <ArrowLeftIcon size={24} className="text-foreground" />
          </Link>
          <div className="flex-1 text-center font-bold text-lg">รายการห้องแข่งขัน</div>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 min-h-screen bg-muted/20">

        {/* Create Room Button */}
        <Link
          href="/courts/create"
          className="w-full h-14 bg-gradient-to-r from-[#FF9500] to-[#FF5E3A] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <PlusIcon className="w-6 h-6" />
          <span>สร้างห้องแข่งขัน</span>
        </Link>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">รายการห้อง ({rooms.length})</h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>กำลังโหลด...</p>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid gap-4">
            {rooms.map((room) => (
              <Link key={room.id} href={`/courts/room/${room.id}`}>
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-transform">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">{room.name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(room.created_at), { addSuffix: true, locale: th })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Icons.users className="w-4 h-4" />
                      <span>{room.players?.length || 0} คน</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-green-600 font-medium">กำลังแข่งขัน</span>
                    </div>
                  </div>

                  {/* Player Avatars Preview */}
                  {room.players && room.players.length > 0 && (
                    <div className="flex -space-x-2 overflow-hidden py-1">
                      {room.players.slice(0, 5).map((p: any, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground" title={p.name}>
                          {p.name.charAt(0)}
                        </div>
                      ))}
                      {room.players.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          +{room.players.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <Icons.trophy className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-foreground text-lg">ยังไม่มีห้องแข่งขัน</h3>
              <p className="text-sm text-muted-foreground px-10">
                เริ่มสร้างห้องใหม่เพื่อจัดตารางแข่งและบันทึกคะแนน
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
