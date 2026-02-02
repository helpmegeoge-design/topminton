"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const userPoints = 2580;

interface RedeemItem {
  id: string;
  name: string;
  description: string;
  points: number;
  category: "discount" | "product" | "service" | "frame";
  image: string;
  stock?: number;
  isHot?: boolean;
  isNew?: boolean;
  expiry?: string;
}

const redeemItems: RedeemItem[] = [
  {
    id: "1",
    name: "ส่วนลด 50 บาท ค่าคอร์ท",
    description: "ใช้ได้กับคอร์ทที่ร่วมรายการ",
    points: 500,
    category: "discount",
    image: "/images/banners/quest-banner.jpg",
    isHot: true,
    expiry: "31 มี.ค. 2569",
  },
  {
    id: "2",
    name: "กรอบโปรไฟล์ทอง",
    description: "กรอบโปรไฟล์สีทองพิเศษ",
    points: 1000,
    category: "frame",
    image: "/images/banners/ranking-banner.jpg",
    isNew: true,
  },
  {
    id: "3",
    name: "ลูกแบด 1 หลอด (6 ลูก)",
    description: "ลูกแบดมินตันคุณภาพดี",
    points: 2000,
    category: "product",
    image: "/images/marketplace/racket-1.jpg",
    stock: 15,
  },
  {
    id: "4",
    name: "ส่วนลด 100 บาท",
    description: "ใช้ได้ทุกการซื้อสินค้า",
    points: 800,
    category: "discount",
    image: "/images/banners/marketplace-banner.jpg",
    expiry: "28 ก.พ. 2569",
  },
  {
    id: "5",
    name: "เรียนแบดมินตัน 1 ชม.",
    description: "เรียนกับโค้ชมืออาชีพ",
    points: 3000,
    category: "service",
    image: "/images/party/party-banner-1.jpg",
    stock: 5,
  },
  {
    id: "6",
    name: "กริปพันด้าม 3 ชิ้น",
    description: "กริปคุณภาพสูงหลากสี",
    points: 1500,
    category: "product",
    image: "/images/marketplace/shoes-1.jpg",
    stock: 20,
  },
  {
    id: "7",
    name: "กรอบโปรไฟล์แชมป์",
    description: "กรอบพิเศษสำหรับแชมป์",
    points: 5000,
    category: "frame",
    image: "/images/banners/assessment-banner.jpg",
    stock: 3,
  },
  {
    id: "8",
    name: "ส่วนลด 20% ร้านค้า",
    description: "ใช้ได้กับร้านค้าพันธมิตร",
    points: 1200,
    category: "discount",
    image: "/images/courts/court-1.jpg",
    expiry: "15 ก.พ. 2569",
  },
];

const categories = [
  { id: "all", name: "ทั้งหมด", icon: Icons.home },
  { id: "discount", name: "ส่วนลด", icon: Icons.coins },
  { id: "product", name: "สินค้า", icon: Icons.bag },
  { id: "service", name: "บริการ", icon: Icons.star },
  { id: "frame", name: "กรอบ", icon: Icons.profile },
];

export default function RedeemPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<RedeemItem | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const filteredItems = selectedCategory === "all" 
    ? redeemItems 
    : redeemItems.filter(item => item.category === selectedCategory);

  const handleRedeem = async () => {
    if (!selectedItem) return;
    setRedeeming(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRedeeming(false);
    setShowConfirm(false);
    setShowSuccess(true);
  };

  const canAfford = (points: number) => userPoints >= points;

  return (
    <AppShell hideNav>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <Icons.chevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground flex-1">แลก TB Points</h1>
          <Button variant="ghost" size="sm" onClick={() => router.push("/quests")}>
            <Icons.coins className="h-4 w-4 mr-1 text-[#F7B928]" />
            รับเพิ่ม
          </Button>
        </div>
      </div>

      <div className="pb-24">
        {/* Points Balance */}
        <div className="px-4 pt-4">
          <GlassCard className="p-4 bg-gradient-to-r from-[#FF9500] to-[#D35400] border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">TB Points ของคุณ</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-white">{userPoints.toLocaleString()}</span>
                  <span className="text-white/60 text-sm">คะแนน</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Icons.coins size={32} className="text-[#F7B928]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="text-white/80 text-xs">กำลังจะหมดอายุ 30 วัน</span>
              <span className="text-white text-sm font-medium">150 คะแนน</span>
            </div>
          </GlassCard>
        </div>

        {/* Categories */}
        <div className="px-4 mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Items Grid */}
        <div className="px-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <GlassCard
                key={item.id}
                className={cn(
                  "overflow-hidden cursor-pointer tap-highlight transition-all",
                  !canAfford(item.points) && "opacity-60"
                )}
                onClick={() => {
                  setSelectedItem(item);
                  setShowConfirm(true);
                }}
              >
                {/* Image */}
                <div className="relative h-28 bg-muted">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {item.isHot && (
                      <Badge className="bg-[#FA383E] text-white text-[10px] px-1.5 py-0">HOT</Badge>
                    )}
                    {item.isNew && (
                      <Badge className="bg-[#FF9500] text-white text-[10px] px-1.5 py-0">ใหม่</Badge>
                    )}
                  </div>
                  {item.stock !== undefined && item.stock <= 10 && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        เหลือ {item.stock}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="font-medium text-sm text-foreground line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Icons.coins className="h-4 w-4 text-[#F7B928]" />
                      <span className={cn(
                        "font-bold text-sm",
                        canAfford(item.points) ? "text-[#F7B928]" : "text-muted-foreground"
                      )}>
                        {item.points.toLocaleString()}
                      </span>
                    </div>
                    {!canAfford(item.points) && (
                      <span className="text-[10px] text-muted-foreground">ไม่พอ</span>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* History Link */}
        <div className="px-4 mt-6">
          <Button 
            variant="outline" 
            className="w-full bg-transparent"
            onClick={() => router.push("/redeem/history")}
          >
            <Icons.calendar className="h-4 w-4 mr-2" />
            ประวัติการแลก
          </Button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle>ยืนยันการแลก</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {/* Item Preview */}
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted relative flex-shrink-0">
                  <Image
                    src={selectedItem.image || "/placeholder.svg"}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{selectedItem.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  {selectedItem.expiry && (
                    <p className="text-xs text-orange-500 mt-1">หมดอายุ: {selectedItem.expiry}</p>
                  )}
                </div>
              </div>

              {/* Points Summary */}
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">คะแนนที่ใช้</span>
                  <span className="font-bold text-[#FA383E]">-{selectedItem.points.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">คะแนนคงเหลือ</span>
                  <span className="font-bold text-foreground">
                    {(userPoints - selectedItem.points).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Warning if low points after */}
              {userPoints - selectedItem.points < 500 && (
                <div className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-xl">
                  <Icons.info className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-600">
                    หลังการแลก คะแนนของคุณจะเหลือน้อยกว่า 500 คะแนน
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowConfirm(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleRedeem}
                  disabled={!canAfford(selectedItem.points) || redeeming}
                >
                  {redeeming ? (
                    <>
                      <Icons.refresh className="h-4 w-4 mr-2 animate-spin" />
                      กำลังแลก...
                    </>
                  ) : (
                    <>
                      <Icons.coins className="h-4 w-4 mr-2" />
                      ยืนยันแลก
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="rounded-3xl max-w-sm text-center">
          <div className="py-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-500/10 mx-auto flex items-center justify-center">
              <Icons.check size={40} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">แลกสำเร็จ!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedItem?.name}
              </p>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm text-muted-foreground">คะแนนคงเหลือ</p>
              <p className="text-2xl font-bold text-foreground">
                {selectedItem ? (userPoints - selectedItem.points).toLocaleString() : userPoints.toLocaleString()} TB
              </p>
            </div>
            <Button 
              className="w-full"
              onClick={() => {
                setShowSuccess(false);
                setSelectedItem(null);
              }}
            >
              เสร็จสิ้น
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
