"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  HeartIcon,
  PhoneIcon,
  ShareIcon,
  StarIcon,
  ClockIcon,
  CourtIcon,
  NavigateIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { LevelBadge } from "@/components/ui/level-badge";
import { createClient } from "@/lib/supabase/client";
import { OnlineUsers } from "@/components/online-users";

// Mock Fallback court data
const mockCourtFallback = {
  id: "1",
  name: "สนามแบดมินตัน S.T.",
  address: "45 ถนน วุฒากาศ แขวงตลาดพลู เขตธนบุรี กรุงเทพมหานคร 10600",
  images: [
    "/images/courts/court-1.jpg",
    "/images/courts/court-2.jpg",
    "/images/courts/court-3.jpg",
  ],
  rating: 4.5,
  reviewCount: 128,
  hours: "06:00-24:00",
  courtCount: 8,
  pricePerHour: 120,
  facilities: [
    { icon: "parking", label: "ที่จอดรถ" },
    { icon: "shower", label: "ห้องอาบน้ำ" },
    { icon: "racket", label: "เช่าไม้แบด" },
    { icon: "shuttle", label: "ขายลูกขนไก่" },
    { icon: "wifi", label: "WiFi" },
    { icon: "ac", label: "แอร์" },
  ],
  contact: {
    phone: "02-123-4567",
    facebook: "Badminton S.T.",
    line: "@badmintonst",
  },
  isPopular: true,
  hasPartyToday: true,
  partyCount: 3,
};


export default function CourtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [court, setCourt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCourt = async () => {
      setIsLoading(true);
      const supabase = createClient();

      // Fallback if Supabase not configured or for mocked IDs
      if (!supabase) {
        setCourt(mockCourtFallback);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('courts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Error fetching court:", error);
          // If the ID looks mocked (e.g. "1", "2"), use mock data
          if (id === "1" || id === "2" || id === "3") {
            setCourt(mockCourtFallback);
          } else {
            setError(true);
          }
        } else if (data) {
          const formattedCourt = {
            id: data.id,
            name: data.name,
            address: data.address,
            images: data.images?.length > 0 ? data.images : ["/placeholder.svg"],
            rating: Number(data.rating) || 0,
            reviewCount: data.review_count || 0,
            hours: "09:00-22:00", // Default as not in DB
            courtCount: data.court_count || 1,
            pricePerHour: Number(data.price_per_hour) || 100,
            facilities: (data.amenities || []).map((item: string) => ({
              icon: "star", // Simplified for now
              label: item
            })),
            contact: {
              phone: data.phone || "-",
              facebook: "-",
              line: data.line_id || "-",
            },
            isPopular: Number(data.rating) > 4.5,
            hasPartyToday: false, // Default
            partyCount: 0,
          };
          setCourt(formattedCourt);
        }
      } catch (err) {
        console.error("Exception fetching court:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourt();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">ไม่พบข้อมูลสนาม</p>
        <Link href="/" className="text-primary hover:underline">กลับหน้าหลัก</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Image Carousel */}
      <div className="relative h-72 bg-muted">
        <Image
          src={court.images[currentImageIndex] || "/placeholder.svg"}
          alt={court.name}
          fill
          className="object-cover"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 safe-area-top">
          <div className="flex items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center tap-highlight"
            >
              <ArrowLeftIcon size={20} className="text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/courts/${court.id}/edit`}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center tap-highlight"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Link>
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center tap-highlight"
              >
                <ShareIcon size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Popular badge */}
        {court.isPopular && (
          <div className="absolute top-20 left-4 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F7B928] text-white">
            <StarIcon size={12} filled className="text-white" />
            <span className="text-xs font-bold">คอร์ทยอดนิยม</span>
          </div>
        )}

        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5">
          {court.images.map((_: any, index: number) => (
            <button
              key={`indicator-${court.id}-${index}`}
              type="button"
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Title & Rating */}
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">{court.name}</h1>
          <p className="text-sm text-muted-foreground mb-2">{court.address}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <StarIcon size={16} filled className="text-[#F7B928]" />
              <span className="font-semibold text-foreground">{court.rating}</span>
              <span>({court.reviewCount} รีวิว)</span>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ClockIcon size={16} />
              <span className="text-xs">เวลาเปิด</span>
            </div>
            <p className="font-semibold text-foreground">{court.hours}</p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CourtIcon size={16} />
              <span className="text-xs">จำนวนสนาม</span>
            </div>
            <p className="font-semibold text-foreground">{court.courtCount} สนาม</p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span className="text-xs">ราคา</span>
            </div>
            <p className="font-semibold text-primary">{court.pricePerHour}.-/ชม</p>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-border">
          <div className="h-40 bg-muted relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-blue-100">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(24, 119, 242, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(24, 119, 242, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px'
                }}
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <CourtIcon size={20} className="text-white" filled />
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-card flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ดูใน Google Maps</span>
            <NavigateIcon size={18} className="text-primary" />
          </div>
        </div>

        {/* Facilities */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">สิ่งอำนวยความสะดวก</h2>
          <div className="grid grid-cols-3 gap-2">
            {court.facilities.map((facility: any, index: number) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CourtIcon size={16} className="text-primary" />
                </div>
                <span className="text-xs text-foreground text-center">{facility.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">ติดต่อ</h2>
          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border tap-highlight"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <PhoneIcon size={18} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs text-muted-foreground">โทรศัพท์</p>
                <p className="font-medium text-foreground">{court.contact.phone}</p>
              </div>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border tap-highlight"
            >
              <div className="w-10 h-10 rounded-full bg-[#31A24C]/10 flex items-center justify-center">
                <span className="text-xs font-bold text-[#31A24C]">LINE</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs text-muted-foreground">LINE</p>
                <p className="font-medium text-foreground">{court.contact.line}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Online Users */}
        <OnlineUsers />

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">รีวิว ({court.reviewCount})</h2>
            <Link href={`/courts/${court.id}/reviews`} className="text-sm text-primary font-medium">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <p className="text-muted-foreground mb-3">ยังไม่มีรีวิว</p>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium tap-highlight"
            >
              รีวิวคอร์ทนี้
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border safe-area-bottom">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center border tap-highlight",
              isFavorite ? "bg-red-50 border-red-200" : "bg-card border-border"
            )}
          >
            <HeartIcon
              size={22}
              filled={isFavorite}
              className={isFavorite ? "text-[#FA383E]" : "text-muted-foreground"}
            />
          </button>
          <button
            type="button"
            className="w-12 h-12 rounded-xl flex items-center justify-center border border-border bg-card tap-highlight"
          >
            <PhoneIcon size={22} className="text-muted-foreground" />
          </button>
          <Link
            href={`/courts/${court.id}/book`}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 tap-highlight"
          >
            จองคอร์ท
          </Link>
          <Link
            href={`/party?court=${court.id}`}
            className="flex-1 h-12 rounded-xl bg-card border border-primary text-primary font-semibold flex items-center justify-center gap-2 tap-highlight"
          >
            หาก๊วน
            {court.hasPartyToday && (
              <span className="px-1.5 py-0.5 text-[10px] bg-[#FA383E] text-white rounded-full">
                {court.partyCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
