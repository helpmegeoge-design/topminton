"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return "from-[#F7B928] to-[#F5793A]";
    case 2: return "from-[#C0C0C0] to-[#A0A0A0]";
    case 3: return "from-[#CD7F32] to-[#8B4513]";
    default: return "";
  }
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, avatar_url, total_games')
        .order('total_games', { ascending: false })
        .limit(20);

      if (data) {
        setUsers(data.map((u, i) => ({
          rank: i + 1,
          name: u.display_name || u.first_name || "นักแบด",
          avatar: u.avatar_url,
          partyCount: u.total_games || 0
        })));
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <AppShell hideNav>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-primary font-bold">กำลังโหลดอันดับ...</div>
        </div>
      </AppShell>
    );
  }

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <Icons.chevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Leaderboard</h1>
          </div>
        </div>

        {top3.length > 0 && (
          <div className="px-4 py-8">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${getRankColor(2)} p-1 mb-2`}>
                    <div className="w-full h-full rounded-full bg-background overflow-hidden relative">
                      <Image src={top3[1].avatar || "/placeholder.svg"} alt={top3[1].name} fill className="object-cover" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate max-w-[64px]">{top3[1].name}</p>
                  <p className="text-[10px] text-muted-foreground">{top3[1].partyCount} เกม</p>
                  <div className="mt-2 w-16 h-20 bg-[#C0C0C0] rounded-t-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className="text-center -mt-8">
                  <div className="relative">
                    <Icons.crown className="h-8 w-8 text-[#F7B928] mx-auto mb-1" />
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getRankColor(1)} p-1 mb-2`}>
                      <div className="w-full h-full rounded-full bg-background overflow-hidden relative">
                        <Image src={top3[0].avatar || "/placeholder.svg"} alt={top3[0].name} fill className="object-cover" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate max-w-[80px]">{top3[0].name}</p>
                  <p className="text-xs text-muted-foreground">{top3[0].partyCount} เกม</p>
                  <div className="mt-2 w-20 h-28 bg-[#F7B928] rounded-t-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${getRankColor(3)} p-1 mb-2`}>
                    <div className="w-full h-full rounded-full bg-background overflow-hidden relative">
                      <Image src={top3[2].avatar || "/placeholder.svg"} alt={top3[2].name} fill className="object-cover" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate max-w-[64px]">{top3[2].name}</p>
                  <p className="text-[10px] text-muted-foreground">{top3[2].partyCount} เกม</p>
                  <div className="mt-2 w-16 h-16 bg-[#CD7F32] rounded-t-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="px-4 pb-8 space-y-2">
          {rest.map((user) => (
            <GlassCard key={user.rank} className="p-3 flex items-center gap-3">
              <span className="w-6 text-sm font-bold text-muted-foreground">#{user.rank}</span>
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                <Image src={user.avatar || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
              </div>
              <span className="text-[#FF9500] font-semibold text-sm">{user.partyCount} เกม</span>
            </GlassCard>
          ))}

          {users.length === 0 && !loading && (
            <div className="text-center py-20 text-muted-foreground text-sm">ยังไม่มีข้อมูลอันดับ</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
