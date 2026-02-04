"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PlusIcon, FilterIcon, Icons } from "@/components/icons";
import { DateStrip } from "@/components/ui/date-strip";
import { PartyCard } from "@/components/party/party-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const tabs = [
  { id: "nearby", label: "ใกล้ฉัน" },
  { id: "mine", label: "ก๊วนของฉัน" }, // Changed label
];

const sortOptions = [
  { id: "nearest", label: "ใกล้สุด" },
  { id: "farthest", label: "ไกลสุด" },
  { id: "time", label: "เวลา" },
];

const provinces = [
  { id: "all", label: "ทุกจังหวัด" },
  { id: "bangkok", label: "กรุงเทพฯ" },
  { id: "chonburi", label: "ชลบุรี" },
];

export default function PartyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courtFilterId = searchParams.get('court');

  const [activeTab, setActiveTab] = useState("nearby");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortBy, setSortBy] = useState("nearest");
  const [selectedProvince, setSelectedProvince] = useState("all"); // Default to all
  const [parties, setParties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParties = async () => {
      setIsLoading(true);
      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      // Format date for query
      const queryDate = format(selectedDate, 'yyyy-MM-dd');

      try {
        let query = supabase
          .from('parties')
          .select(`
            *,
            court:courts(name, address, id, images, province),
            host:profiles!parties_host_id_fkey(display_name, first_name, avatar_url),
            members:party_members(user_id)
          `)
          .eq('date', queryDate)
          .order('start_time', { ascending: true });

        if (courtFilterId) {
          query = query.eq('court_id', courtFilterId);
        }

        const { data: { user } } = await supabase.auth.getUser();

        // If activeTab is 'mine', filter by my ID
        // const myId = ...

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching parties:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          console.error("Error message:", error?.message || "No error message");
          console.error("Error code:", error?.code || "No error code");

          // Show error to user
          setParties([]);
          setError("ไม่สามารถโหลดข้อมูลก๊วนได้ กรุณาลองใหม่อีกครั้ง");
        } else if (data) {
          let filteredData = data;

          // Filter by Province (Client-side)
          if (selectedProvince !== 'all') {
            filteredData = filteredData.filter((p: any) => {
              const courtProv = p.court?.province || "";
              const courtAddr = p.court?.address || "";
              const fullText = (
                JSON.stringify(p.court || "") +
                " " +
                (courtProv || "") +
                " " +
                (courtAddr || "")
              ).toLowerCase();
              const provinceLower = selectedProvince.toLowerCase();
              return fullText.includes(provinceLower);
            });
          }

          // Filter "My Parties"
          if (activeTab === 'mine') {
            if (!user) {
              filteredData = []; // No user, no my parties
            } else {
              filteredData = filteredData.filter((p: any) =>
                p.host_id === user.id || p.members?.some((m: any) => m.user_id === user.id)
              );
            }
          }

          const formattedParties = filteredData.map((party: any) => ({
            id: party.id,
            name: party.title,
            courtName: party.court?.name || "ไม่ระบุสนาม",
            courtAddress: party.court?.address || "",
            distance: "2.5 กม.", // Placeholder
            date: format(new Date(party.date), 'd MMM', { locale: th }),
            dayName: format(new Date(party.date), 'eeq', { locale: th }),
            time: `${party.start_time.slice(0, 5)}-${party.end_time.slice(0, 5)}`,
            duration: "2 ชม.", // Calculated ideally
            currentParticipants: party.current_players || 0,
            maxParticipants: party.max_players,
            requiredLevels: party.skill_level === 'all' ? ["beginner", "bg", "normal", "strong"] : [party.skill_level],
            organizerName: party.host?.display_name || party.host?.first_name || "Unknown",
            isVerified: true,
            imageUrl: party.court?.images?.[0] || "/placeholder.svg",
            isOwner: user?.id === party.host_id,
          }));
          setParties(formattedParties);
        }
      } catch (err) {
        console.error("Exception fetching parties:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParties();
  }, [selectedDate, activeTab, selectedProvince]);

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14 safe-area-top">
          <h1 className="text-xl font-bold text-foreground">ก๊วน</h1>
          <Link
            href="/party/create"
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center tap-highlight shadow-lg"
          >
            <PlusIcon size={20} className="text-white" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all tap-highlight rounded-t-xl",
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Filters */}
      <div className="bg-background border-b border-border">
        {/* Sort & Province */}
        <div className="flex items-center justify-between px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-2">

            {/* Province Selector */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1">
              <Icons.mapPin size={14} className="text-primary" />
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="text-xs font-medium bg-transparent border-none focus:ring-0 p-0 pr-6"
              >
                {provinces.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>

            <div className="w-px h-4 bg-border mx-1" />

            <FilterIcon size={14} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-medium text-foreground bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {parties.length} ก๊วน
          </span>
        </div>

        {/* Date Strip */}
        <DateStrip
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingShuttlecock />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <div className="text-destructive mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        ) : parties.length > 0 ? (
          parties.map((party) => (
            <PartyCard key={party.id} {...party} />
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">ไม่พบก๊วนในวันที่เลือก</p>
            <Link
              href="/party/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium tap-highlight"
            >
              <PlusIcon size={18} />
              สร้างก๊วนใหม่
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
