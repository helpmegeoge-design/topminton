"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons, ChevronLeftIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type BookingStatus = "upcoming" | "completed" | "cancelled";

interface Booking {
  id: string;
  courtName: string;
  courtImage: string;
  date: string;
  time: string;
  duration: string;
  courts: number;
  totalPrice: number;
  status: BookingStatus;
  bookingCode: string;
}

const mockBookings: Booking[] = [
  {
    id: "1",
    courtName: "สนามแบดมินตัน S.T.",
    courtImage: "/images/courts/court-1.jpg",
    date: "30 ม.ค. 2569",
    time: "18:00 - 20:00",
    duration: "2 ชม.",
    courts: 2,
    totalPrice: 600,
    status: "upcoming",
    bookingCode: "BK-2569013001",
  },
  {
    id: "2",
    courtName: "Smash! Badminton",
    courtImage: "/images/courts/court-2.jpg",
    date: "28 ม.ค. 2569",
    time: "19:00 - 21:00",
    duration: "2 ชม.",
    courts: 1,
    totalPrice: 350,
    status: "completed",
    bookingCode: "BK-2569012801",
  },
  {
    id: "3",
    courtName: "สนามแบดมินตันบางนา",
    courtImage: "/images/courts/court-3.jpg",
    date: "25 ม.ค. 2569",
    time: "17:00 - 19:00",
    duration: "2 ชม.",
    courts: 1,
    totalPrice: 300,
    status: "cancelled",
    bookingCode: "BK-2569012501",
  },
];

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  upcoming: { label: "กำลังจะมาถึง", color: "bg-blue-500" },
  completed: { label: "เสร็จสิ้น", color: "bg-green-500" },
  cancelled: { label: "ยกเลิก", color: "bg-red-500" },
};

const tabs: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "upcoming", label: "กำลังจะมา" },
  { value: "completed", label: "เสร็จสิ้น" },
  { value: "cancelled", label: "ยกเลิก" },
];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus | "all">("all");

  const filteredBookings = activeTab === "all" 
    ? mockBookings 
    : mockBookings.filter(b => b.status === activeTab);

  return (
    <AppShell hideBottomNav>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/profile" className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </Link>
          <h1 className="text-lg font-semibold">การจองของฉัน</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Icons.calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">ไม่มีการจอง</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <GlassCard key={booking.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                {/* Court Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={booking.courtImage || "/placeholder.svg"}
                    alt={booking.courtName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {booking.courtName}
                    </h3>
                    <Badge className={cn("text-white text-[10px]", statusConfig[booking.status].color)}>
                      {statusConfig[booking.status].label}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icons.calendar size={14} />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.clock size={14} />
                      <span>{booking.time} ({booking.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.court size={14} />
                      <span>{booking.courts} คอร์ท</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">รหัสการจอง</p>
                  <p className="text-sm font-mono font-medium">{booking.bookingCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">ราคารวม</p>
                  <p className="text-lg font-bold text-primary">{booking.totalPrice} บาท</p>
                </div>
              </div>

              {/* Actions */}
              {booking.status === "upcoming" && (
                <div className="flex gap-2 p-4 pt-0">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Icons.qrCode size={16} className="mr-2" />
                    แสดง QR
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-destructive border-destructive/30 bg-transparent">
                    ยกเลิกการจอง
                  </Button>
                </div>
              )}

              {booking.status === "completed" && (
                <div className="flex gap-2 p-4 pt-0">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Icons.star size={16} className="mr-2" />
                    ให้คะแนน
                  </Button>
                  <Button size="sm" className="flex-1">
                    จองอีกครั้ง
                  </Button>
                </div>
              )}
            </GlassCard>
          ))
        )}
      </div>
    </AppShell>
  );
}
