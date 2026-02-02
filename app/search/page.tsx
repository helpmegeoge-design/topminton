"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Icons, CourtIcon, ShuttlecockIcon, TrophyIcon, ProfileIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "ทั้งหมด" },
  { id: "courts", label: "คอร์ท", icon: CourtIcon },
  { id: "parties", label: "ก๊วน", icon: ShuttlecockIcon },
  { id: "tournaments", label: "แข่งขัน", icon: TrophyIcon },
  { id: "users", label: "ผู้ใช้", icon: ProfileIcon },
];

const recentSearches = ["สนามแบดมินตัน S.T.", "ก๊วนพุธสุข", "Victor", "รังสิต"];

const popularSearches = ["สนามแบดรังสิต", "ก๊วนเย็นวันศุกร์", "แข่งระดับ N", "ขายไม้ Yonex"];

const mockResults = {
  courts: [
    { id: "1", name: "สนามแบดมินตัน S.T.", address: "ธนบุรี", rating: 4.5 },
    { id: "2", name: "Smash! Badminton", address: "คลองเตย", rating: 4.8 },
  ],
  parties: [
    { id: "1", name: "ก๊วนพุธสุข", date: "29 ม.ค.", members: "6/10" },
    { id: "2", name: "Pro Night", date: "30 ม.ค.", members: "8/8" },
  ],
  tournaments: [
    { id: "1", name: "CENTNOX Tournament", date: "1 มี.ค.", status: "เปิดรับสมัคร" },
  ],
  users: [
    { id: "1", name: "แชมป์ ณรงค์", level: "P", matches: 89 },
    { id: "2", name: "นัท สุวรรณ", level: "S", matches: 76 },
  ],
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
        setHasSearched(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setHasSearched(false);
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2">
              <Icons.chevronLeft size={24} className="text-foreground" />
            </Link>
            <div className="flex-1 relative">
              <Icons.search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ค้นหาคอร์ท, ก๊วน, แข่งขัน..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <Icons.close size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                  category === cat.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State - Show Recent & Popular */}
        {!query && !isSearching && (
          <div className="space-y-6">
            {/* Recent Searches */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">ค้นหาล่าสุด</h3>
                <button type="button" className="text-xs text-primary">ล้างทั้งหมด</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full text-sm"
                  >
                    <Icons.clock size={14} className="text-muted-foreground" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Searches */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">ยอดนิยม</h3>
              <div className="space-y-2">
                {popularSearches.map((term, i) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="w-full flex items-center gap-3 p-3 bg-muted/50 rounded-lg text-left hover:bg-muted transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{term}</span>
                    <Icons.chevronRight size={16} className="text-muted-foreground ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !isSearching && query && (
          <div className="space-y-6">
            {/* Courts */}
            {(category === "all" || category === "courts") && mockResults.courts.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CourtIcon size={18} className="text-primary" />
                  คอร์ท
                </h3>
                <div className="space-y-2">
                  {mockResults.courts.map((court) => (
                    <Link key={court.id} href={`/courts/${court.id}`}>
                      <GlassCard className="p-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CourtIcon size={24} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{court.name}</p>
                          <p className="text-xs text-muted-foreground">{court.address}</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Icons.star size={14} />
                          <span className="text-sm">{court.rating}</span>
                        </div>
                      </GlassCard>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Parties */}
            {(category === "all" || category === "parties") && mockResults.parties.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ShuttlecockIcon size={18} className="text-primary" />
                  ก๊วน
                </h3>
                <div className="space-y-2">
                  {mockResults.parties.map((party) => (
                    <Link key={party.id} href={`/party/${party.id}`}>
                      <GlassCard className="p-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <ShuttlecockIcon size={24} className="text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{party.name}</p>
                          <p className="text-xs text-muted-foreground">{party.date}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{party.members}</span>
                      </GlassCard>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tournaments */}
            {(category === "all" || category === "tournaments") && mockResults.tournaments.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrophyIcon size={18} className="text-primary" />
                  แข่งขัน
                </h3>
                <div className="space-y-2">
                  {mockResults.tournaments.map((tournament) => (
                    <Link key={tournament.id} href={`/tournament/${tournament.id}`}>
                      <GlassCard className="p-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <TrophyIcon size={24} className="text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{tournament.name}</p>
                          <p className="text-xs text-muted-foreground">{tournament.date}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded-full">
                          {tournament.status}
                        </span>
                      </GlassCard>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {(category === "all" || category === "users") && mockResults.users.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ProfileIcon size={18} className="text-primary" />
                  ผู้ใช้
                </h3>
                <div className="space-y-2">
                  {mockResults.users.map((user) => (
                    <GlassCard key={user.id} className="p-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <ProfileIcon size={24} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.matches} แมตช์</p>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                        {user.level}
                      </span>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
