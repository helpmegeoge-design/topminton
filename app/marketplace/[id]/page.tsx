"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

const mockProduct = {
  id: "1",
  title: "Yonex Astrox 99 Pro",
  price: 4500,
  originalPrice: 7990,
  condition: "มือสอง",
  conditionDetail: "ใช้งาน 3 เดือน สภาพ 90%",
  images: [
    "/images/marketplace/racket-1.jpg",
    "/images/marketplace/racket-1.jpg",
    "/images/marketplace/racket-1.jpg",
  ],
  category: "ไม้แบด",
  brand: "YONEX",
  description: `ไม้แบด Yonex Astrox 99 Pro สภาพดีมาก ใช้งานน้อย
  
- น้ำหนัก 4U (83g)
- Balance: Head Heavy
- Flexibility: Stiff
- ขึ้นเอ็น BG65 Ti 27 lbs

ขายเพราะเปลี่ยนรุ่นใหม่ มีกระเป๋าใส่ให้`,
  location: "กรุงเทพมหานคร",
  postedAt: "3 วันที่แล้ว",
  views: 156,
  seller: {
    id: "seller1",
    name: "สมชาย ใจดี",
    avatar: "/images/avatars/avatar-1.jpg",
    rating: 4.8,
    totalSales: 12,
    memberSince: "ม.ค. 2568",
  },
};

export default function MarketplaceDetailPage() {
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const discountPercent = Math.round(
    ((mockProduct.originalPrice - mockProduct.price) / mockProduct.originalPrice) * 100
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/marketplace">
            <Button variant="ghost" size="icon" className="tap-highlight">
              <Icons.chevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Icons.heart
                className={cn(
                  "w-5 h-5",
                  isSaved && "fill-[#FA383E] text-[#FA383E]"
                )}
              />
            </Button>
            <Button variant="ghost" size="icon">
              <Icons.share className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-14">
        {/* Image Gallery */}
        <div className="relative aspect-square bg-muted">
          <img
            src={mockProduct.images[currentImageIndex] || "/placeholder.svg"}
            alt={mockProduct.title}
            className="w-full h-full object-cover"
          />
          
          {/* Image Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {mockProduct.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentImageIndex
                    ? "bg-white w-6"
                    : "bg-white/50"
                )}
              />
            ))}
          </div>

          {/* Condition Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-[#F7B928] text-white text-sm font-medium rounded-full">
            {mockProduct.condition}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-4">
          {/* Title & Price */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-primary font-medium">
                {mockProduct.brand}
              </span>
              <span className="text-xs text-muted-foreground">
                {mockProduct.category}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              {mockProduct.title}
            </h1>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                ฿{mockProduct.price.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ฿{mockProduct.originalPrice.toLocaleString()}
              </span>
              <span className="text-sm text-[#FA383E] font-medium">
                -{discountPercent}%
              </span>
            </div>
          </div>

          {/* Condition Detail */}
          <GlassCard className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F7B928]/10 flex items-center justify-center">
                <Icons.info className="w-5 h-5 text-[#F7B928]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">สภาพสินค้า</p>
                <p className="text-sm text-muted-foreground">
                  {mockProduct.conditionDetail}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Description */}
          <div>
            <h2 className="font-semibold text-foreground mb-2">รายละเอียด</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {mockProduct.description}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icons.mapPin className="w-4 h-4" />
              <span>{mockProduct.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icons.eye className="w-4 h-4" />
              <span>{mockProduct.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Icons.clock className="w-4 h-4" />
              <span>{mockProduct.postedAt}</span>
            </div>
          </div>

          {/* Seller Info */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={mockProduct.seller.avatar || "/placeholder.svg"}
                alt={mockProduct.seller.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {mockProduct.seller.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icons.star className="w-4 h-4 text-[#F7B928] fill-[#F7B928]" />
                    <span>{mockProduct.seller.rating}</span>
                  </div>
                  <span>|</span>
                  <span>ขายแล้ว {mockProduct.seller.totalSales} ชิ้น</span>
                </div>
              </div>
              <Link href={`/profile/${mockProduct.seller.id}`}>
                <Button variant="outline" size="sm">
                  ดูโปรไฟล์
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-border p-4 safe-area-bottom">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent">
            <Icons.message className="w-4 h-4 mr-2" />
            แชท
          </Button>
          <Button className="flex-1">
            <Icons.phone className="w-4 h-4 mr-2" />
            โทร
          </Button>
        </div>
      </div>
    </div>
  );
}
