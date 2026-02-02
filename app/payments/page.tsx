"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Icons, ChevronLeftIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type PaymentType = "booking" | "party" | "tournament" | "shop";
type PaymentStatus = "success" | "pending" | "failed" | "refunded";

interface Payment {
  id: string;
  type: PaymentType;
  title: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  status: PaymentStatus;
  transactionId: string;
}

const mockPayments: Payment[] = [
  {
    id: "1",
    type: "booking",
    title: "จองคอร์ท",
    description: "สนามแบดมินตัน S.T. - 2 คอร์ท",
    amount: -600,
    date: "30 ม.ค. 2569",
    time: "14:30",
    status: "success",
    transactionId: "TXN-2569013001234",
  },
  {
    id: "2",
    type: "party",
    title: "ค่าก๊วน",
    description: "ก๊วนพุธสุข - หารค่าใช้จ่าย",
    amount: -150,
    date: "29 ม.ค. 2569",
    time: "21:00",
    status: "success",
    transactionId: "TXN-2569012905678",
  },
  {
    id: "3",
    type: "tournament",
    title: "สมัครแข่งขัน",
    description: "Centrox SO HOT Pathum Thani",
    amount: -1700,
    date: "27 ม.ค. 2569",
    time: "10:15",
    status: "success",
    transactionId: "TXN-2569012709012",
  },
  {
    id: "4",
    type: "shop",
    title: "แลก TB Points",
    description: "ลูกแบด Yonex AS-30 (1 หลอด)",
    amount: -500,
    date: "25 ม.ค. 2569",
    time: "16:45",
    status: "pending",
    transactionId: "TXN-2569012503456",
  },
  {
    id: "5",
    type: "booking",
    title: "คืนเงินจอง",
    description: "ยกเลิกการจอง - สนามแบดมินตันบางนา",
    amount: 300,
    date: "24 ม.ค. 2569",
    time: "09:00",
    status: "refunded",
    transactionId: "TXN-2569012407890",
  },
];

const typeConfig: Record<PaymentType, { icon: typeof Icons.calendar; color: string }> = {
  booking: { icon: Icons.calendar, color: "bg-blue-500/10 text-blue-500" },
  party: { icon: Icons.users, color: "bg-green-500/10 text-green-500" },
  tournament: { icon: Icons.trophy, color: "bg-amber-500/10 text-amber-500" },
  shop: { icon: Icons.gift, color: "bg-purple-500/10 text-purple-500" },
};

const statusConfig: Record<PaymentStatus, { label: string; color: string }> = {
  success: { label: "สำเร็จ", color: "bg-green-500" },
  pending: { label: "รอดำเนินการ", color: "bg-amber-500" },
  failed: { label: "ล้มเหลว", color: "bg-red-500" },
  refunded: { label: "คืนเงิน", color: "bg-blue-500" },
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState<PaymentType | "all">("all");

  const filteredPayments = filter === "all"
    ? mockPayments
    : mockPayments.filter(p => p.type === filter);

  const totalSpent = mockPayments
    .filter(p => p.status === "success" && p.amount < 0)
    .reduce((sum, p) => sum + Math.abs(p.amount), 0);

  return (
    <AppShell hideBottomNav>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/profile" className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </Link>
          <h1 className="text-lg font-semibold">ประวัติการชำระเงิน</h1>
        </div>
      </header>

      {/* Summary Card */}
      <div className="p-4">
        <GlassCard className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <p className="text-sm text-muted-foreground mb-1">ยอดใช้จ่ายเดือนนี้</p>
          <p className="text-3xl font-bold text-primary">{totalSpent.toLocaleString()} บาท</p>
          <p className="text-xs text-muted-foreground mt-2">{mockPayments.length} รายการ</p>
        </GlassCard>
      </div>

      {/* Filter */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {[
          { value: "all", label: "ทั้งหมด" },
          { value: "booking", label: "จองคอร์ท" },
          { value: "party", label: "ก๊วน" },
          { value: "tournament", label: "แข่งขัน" },
          { value: "shop", label: "TB Shop" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value as PaymentType | "all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payment List */}
      <div className="px-4 pb-4 space-y-3">
        {filteredPayments.map((payment) => {
          const TypeIcon = typeConfig[payment.type].icon;
          return (
            <GlassCard key={payment.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  typeConfig[payment.type].color
                )}>
                  <TypeIcon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-foreground">{payment.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{payment.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        "font-semibold",
                        payment.amount > 0 ? "text-green-500" : "text-foreground"
                      )}>
                        {payment.amount > 0 ? "+" : ""}{payment.amount.toLocaleString()} บาท
                      </p>
                      <Badge className={cn("text-white text-[10px] mt-1", statusConfig[payment.status].color)}>
                        {statusConfig[payment.status].label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {payment.date} {payment.time}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {payment.transactionId}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </AppShell>
  );
}
