"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function SuggestCourtPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    courtCount: "",
    pricePerHour: "",
    contact: "",
    notes: "",
    recommenderName: "",
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const handleLocationPick = () => {
    // Simulate picking a location
    setLocation({ lat: 13.7563, lng: 100.5018 });
    setAddress("กรุงเทพมหานคร ประเทศไทย");
  };

  if (showSuccess) {
    return (
      <AppShell>
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 to-background items-center justify-center p-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckIcon size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
            ส่งข้อมูลสำเร็จ!
          </h1>
          <p className="text-muted-foreground text-center mb-8 max-w-xs">
            ขอบคุณสำหรับการแนะนำคอร์ท เราจะตรวจสอบและเพิ่มลงระบบภายใน 3-5 วัน
          </p>
          <Button className="w-full max-w-xs" onClick={() => router.push("/courts")}>
            กลับหน้าค้นหาคอร์ท
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight"
            >
              <ArrowLeftIcon size={20} className="text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              แนะนำคอร์ทใหม่
            </h1>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-4 pb-24">
          {/* Intro Card */}
          <GlassCard className="p-4 bg-primary/5 border-primary/20">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <LightbulbIcon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  ช่วยเราเพิ่มคอร์ทใหม่
                </h3>
                <p className="text-sm text-muted-foreground">
                  รู้จักคอร์ทที่ยังไม่มีในระบบ? แนะนำให้เราได้เลย
                  คุณจะได้รับ 10 TB Points เมื่อคอร์ทถูกเพิ่มลงระบบ
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Court Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              ชื่อคอร์ท <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="เช่น สนามแบดมินตัน ABC"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.name.length}/100
            </p>
          </div>

          {/* Location Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              ตำแหน่งที่ตั้ง <span className="text-red-500">*</span>
            </label>
            <GlassCard
              className={cn(
                "p-4 cursor-pointer tap-highlight",
                location && "border-primary/30 bg-primary/5"
              )}
              onClick={handleLocationPick}
            >
              {location ? (
                <div className="space-y-2">
                  <div className="h-32 rounded-lg bg-muted overflow-hidden relative">
                    <img
                      src="/images/map-preview.jpg"
                      alt="Map"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <MapPinIcon size={16} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon size={16} className="text-primary" />
                    <span className="text-sm text-foreground">{address}</span>
                  </div>
                  <button className="text-xs text-primary font-medium">
                    เปลี่ยนตำแหน่ง
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <MapPinIcon size={24} className="text-primary" />
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    แตะเพื่อเลือกตำแหน่ง
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ปักหมุดบนแผนที่
                  </p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Court Count & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                จำนวนสนาม
              </label>
              <Input
                type="number"
                placeholder="เช่น 8"
                value={formData.courtCount}
                onChange={(e) =>
                  setFormData({ ...formData, courtCount: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                ราคา/ชม.
              </label>
              <Input
                type="number"
                placeholder="เช่น 120"
                value={formData.pricePerHour}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerHour: e.target.value })
                }
              />
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              ข้อมูลติดต่อ
            </label>
            <Input
              placeholder="เบอร์โทร, LINE, Facebook"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              ข้อมูลเพิ่มเติม
            </label>
            <Textarea
              placeholder="เช่น มีที่จอดรถ, ห้องอาบน้ำ, เปิดกี่โมง..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Recommender Name (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              ชื่อผู้แนะนำ (ไม่บังคับ)
            </label>
            <Input
              placeholder="ใส่ชื่อของคุณ"
              value={formData.recommenderName}
              onChange={(e) =>
                setFormData({ ...formData, recommenderName: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              หากต้องการให้แสดงว่าคุณเป็นผู้แนะนำ
            </p>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full h-12 mt-4"
            onClick={handleSubmit}
            disabled={!formData.name || !location || isSubmitting}
          >
            {isSubmitting ? "กำลังส่ง..." : "ส่งข้อมูล"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

// Icons
function ArrowLeftIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LightbulbIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MapPinIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
