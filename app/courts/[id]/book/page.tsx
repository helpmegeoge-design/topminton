"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeftIcon, Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  court: number;
}

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 6; hour <= 23; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    const available = Math.random() > 0.3;
    const price = hour >= 18 && hour <= 21 ? 180 : 120; // Peak hours
    slots.push({ time, available, price, court: Math.floor(Math.random() * 8) + 1 });
  }
  return slots;
};

const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      date: date.toISOString().split("T")[0],
      dayName: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"][date.getDay()],
      dayNum: date.getDate(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }
  return dates;
};

export default function CourtBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(generateDates()[0].date);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [step, setStep] = useState<"select" | "confirm" | "success">("select");

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  const toggleSlot = (time: string) => {
    setSelectedSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const totalPrice = selectedSlots.reduce((sum, time) => {
    const slot = timeSlots.find((s) => s.time === time);
    return sum + (slot?.price || 0);
  }, 0);

  const handleConfirm = () => {
    setStep("confirm");
  };

  const handlePayment = async () => {
    // Simulate payment
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStep("success");
  };

  return (
    <AppShell hideBottomNav>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href={`/courts/${params.id}`} className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </Link>
          <h1 className="font-semibold text-foreground">จองคอร์ท</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-32">
        {step === "select" && (
          <>
            {/* Court Info */}
            <div className="p-4 bg-primary/5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icons.court size={24} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">สนามแบดมินตัน S.T.</h2>
                  <p className="text-sm text-muted-foreground">8 คอร์ท | 06:00 - 24:00</p>
                </div>
              </div>
            </div>

            {/* Date Selector */}
            <div className="p-4">
              <h3 className="font-medium text-foreground mb-3">เลือกวันที่</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {dates.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDate(d.date)}
                    className={cn(
                      "flex flex-col items-center min-w-[56px] py-2 px-3 rounded-xl transition-all tap-highlight",
                      selectedDate === d.date
                        ? "bg-primary text-primary-foreground"
                        : d.isWeekend
                          ? "bg-red-500/10 text-red-500"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="text-xs">{d.dayName}</span>
                    <span className="text-lg font-bold">{d.dayNum}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">เลือกเวลา</h3>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-primary/20" />
                    <span className="text-muted-foreground">ว่าง</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-muted" />
                    <span className="text-muted-foreground">ไม่ว่าง</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => toggleSlot(slot.time)}
                    className={cn(
                      "p-2 rounded-lg text-center transition-all tap-highlight",
                      !slot.available
                        ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        : selectedSlots.includes(slot.time)
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : "bg-primary/10 text-foreground hover:bg-primary/20"
                    )}
                  >
                    <p className="text-sm font-medium">{slot.time}</p>
                    <p className="text-[10px] opacity-80">{slot.price} บาท</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Legend */}
            <div className="px-4 mb-4">
              <GlassCard className="p-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ราคาปกติ: 120 บาท/ชม.</span>
                <span className="text-amber-500 font-medium">Peak (18-21): 180 บาท/ชม.</span>
              </GlassCard>
            </div>
          </>
        )}

        {step === "confirm" && (
          <div className="p-4 space-y-4 animate-fade-in">
            <GlassCard className="p-4 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Icons.calendar size={20} className="text-primary" />
                ยืนยันการจอง
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">สนาม</span>
                  <span className="font-medium text-foreground">สนามแบดมินตัน S.T.</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">วันที่</span>
                  <span className="font-medium text-foreground">{selectedDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">เวลา</span>
                  <span className="font-medium text-foreground">
                    {selectedSlots.sort().join(", ")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">จำนวน</span>
                  <span className="font-medium text-foreground">{selectedSlots.length} ชั่วโมง</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-foreground font-medium">รวมทั้งหมด</span>
                  <span className="text-xl font-bold text-primary">{totalPrice.toLocaleString()} บาท</span>
                </div>
              </div>
            </GlassCard>

            {/* QR Payment */}
            <GlassCard className="p-4">
              <h3 className="font-medium text-foreground mb-4 text-center">สแกน QR เพื่อชำระเงิน</h3>
              <div className="w-48 h-48 mx-auto bg-white rounded-xl p-2 flex items-center justify-center">
                <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyOSAyOSI+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTAgMGg3djdIMHptMSAxaDV2NUgxem0xIDFoM3YzSDJ6bTggMGgxdjFoLTF6bTIgMGgxdjFoLTF6bTUgMGg3djdoLTd6bTEgMGg1djVoLTV6bTEgMWgzdjNoLTN6TTAgOGgxdjFIMHptMiAwaDJ2MUgyem0zIDBoMXYxSDV6bTMgMGgxdjNoLTF6bTIgMGgydjFoLTJ6bTQgMGgxdjFoLTF6bTIgMGgxdjJoLTF6bTUgMGgxdjJoLTF6TTAgOWgxdjFIMHptMiAwaDFWOGgydjFINHYxSDJ6bTMgMGgxdjFINXptNSAwaDJ2MWgtMnptNSAwaDJ2MWgtMnptNSAwaDFWOGgydjNIMjd6TTAgMTBoMXYxSDB6bTIgMGgxdjFIMnptMiAwaDN2MUg0em0xMCAwaDJ2MWgtMnptMiAwaDFWOGgxdjNoLTJ6TTAgMTFoMXYxSDB6bTIgMGgxdjFIMnptMTggMGgxdjFoLTF6bTMgMGgydjFoLTJ6TTAgMTJoMXYxSDB6bTIgMGgxdjFIMnptMiAwaDJ2MUg0em0zIDBoMXYxSDd6bTIgMGgxdjFIOXptNSAwaDN2MWgtM3ptNiAwaDJ2MWgtMnptMiAwaDJ2MWgtMnpNOCAxM2gxdjFIOHptNiAwaDJ2MWgtMnptMTMgMGgxdjFoLTF6TTAgMTRoMXYxSDB6bTMgMGgxdjFIM3ptMyAwaDR2MWgtNHptNSAwaDZ2MWgtNnptNyAwaDN2MWgtM3ptNSAwaDJ2MWgtMnpNMSAxNWgxdjFIMXptMiAwaDFWMTRoMXYySDN6bTQgMGg0djFIN3ptNiAwaDFWMTRoMnYyaC0xdi0xaC0xdjF6bTcgMGgzdjFoLTN6bTQgMGgxdi0xaDJ2MmgtMnYtMWgtMXptMyAwaDFWMTRoMXYyaC0yem0tMjggMWgzdjFIMHptNiAwaDJ2MUg2em00IDBoM3YxaC0zem01IDBoMXYxaC0xem00IDBoNHYxaC00em02IDBoMXYxaC0xem0yIDBoMnYxaC0yek0wIDE3aDJ2MUgwem02IDBoMXYxSDZ6bTQgMGgxdi0xaDJ2MmgtMnYtMWgtMXptMyAwaDJ2MWgtMnptNCAwaDJ2MWgtMnptMyAwaDJ2MWgtMnptMiAwaDJ2MWgtMnptMyAwaDFWMTZoMXYyaC0yem0tMjIgMWgxdjFIN3ptNCAwaDV2MWgtNXptOCAwaDR2MWgtNHptNCAwaDN2MWgtM3ptNCAwaDJ2MWgtMnptLTI3IDF2MWgxdjFINXYtMUg0di0xaDFWMThIMXYyaC0xdi0yem00IDBoMXYxSDV6bTcgMGgydjFoLTJ6bTQgMGgydjFoLTJ6bTMgMGgxdi0xaDJ2MmgtMnYtMWgtMXptNCAwaDJ2MWgtMnptLTE0IDFoMXYxaC0xem0xMSAwaDJ2MWgtMnptNyAwaDJ2MWgtMnptLTI4IDFoMXYxSDB6bTQgMGgxdi0xaDN2MUg2di0xaDFWMjBINXYxSDR2LTFIMnYyaC0xdi0yaDF2MWgyem02IDBoMXYxaC0xem0yIDBoMXYxaC0xem02IDBoMXYxaC0xem00IDBoMXYxaC0xem0yIDBoMXYyaC0xem00IDBoMXYxaC0xem0tMjMgMUgxdjFIMHYtMWgxdi0xaDF2MUgzem0yIDBoMXYxSDV6bTkgMGgxdjFoLTF6bTIgMGgxdjFoLTF6bTUgMGgxdjFoLTF6bTIgMGgxdi0xaDF2MUgyNXYxaC0xem0zIDBoMXYxaC0xek0wIDIzaDd2N0gwem0xIDFoNXY1SDF6bTEgMWgzdjNIMnptOCAwaDJ2MWgtMnptNSAwaDN2MWgtM3ptNCAwaDJ2MWgtMnptLTE2IDFoNXYxSDN6bTYgMGgxdjJoMXYtMWgxdjFoLTF2MWgtMXYtMWgtMXptMTIgMGgxdjFoLTF6bTUgMGgxdi0xaDJ2MmgtMnYtMWgtMXptLTE4IDFoMXYxSDh6bTQgMGgxdjFoLTF6bTQgMGgxdi0xaDF2MWgtMXYxaC0xem01IDBoMXYtMWgzdjJoLTF2LTFoLTF2MWgtMnptMiAwaDFWMjZoMXYyaC0yem0tMTUgMWgxdjFoLTF6bTMgMGgxdjFoLTF6bTMgMGgxdjFoLTF6bTQgMGgxdjFoLTF6bTIgMGgxdi0xaDF2MmgtMnptNiAwaDJ2MWgtMnptLTkgMWgzdjFoLTN6bTUgMGgxdjFoLTF6bTIgMGgxdi0xaDF2MmgtMnoiLz48L3N2Zz4=')] bg-contain" />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                PromptPay: 089-XXX-XXXX
              </p>
            </GlassCard>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center animate-bounce-in">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Icons.check size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">จองคอร์ทสำเร็จ!</h2>
            <p className="text-muted-foreground mt-2">รหัสการจอง: BK-2025012901</p>

            <GlassCard className="p-4 mt-6 w-full max-w-xs text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">สนาม</span>
                  <span className="font-medium">สนามแบดมินตัน S.T.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">วันที่</span>
                  <span className="font-medium">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เวลา</span>
                  <span className="font-medium">{selectedSlots.sort().join(", ")}</span>
                </div>
              </div>
            </GlassCard>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={() => router.push("/courts")}>
                กลับหน้าคอร์ท
              </Button>
              <Button onClick={() => router.push("/party/create")}>
                สร้างก๊วน
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action */}
      {step === "select" && selectedSlots.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">{selectedSlots.length} ชั่วโมง</p>
              <p className="text-xl font-bold text-foreground">{totalPrice.toLocaleString()} บาท</p>
            </div>
            <Button onClick={handleConfirm} className="px-8">
              ดำเนินการต่อ
            </Button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border/50">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("select")}>
              ย้อนกลับ
            </Button>
            <Button className="flex-1" onClick={handlePayment}>
              ยืนยันชำระเงิน
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
