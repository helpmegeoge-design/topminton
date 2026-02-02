"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type GearCategory = "racket" | "shoes" | "string" | "grip" | "bag" | "accessories";

interface GearItem {
  id: string;
  category: GearCategory;
  brand: string;
  model: string;
  image: string;
  specs?: Record<string, string>;
  isPrimary?: boolean;
}

const categoryInfo: Record<GearCategory, { name: string; icon: keyof typeof Icons }> = {
  racket: { name: "ไม้แบด", icon: "shuttlecock" },
  shoes: { name: "รองเท้า", icon: "users" },
  string: { name: "เอ็น", icon: "edit" },
  grip: { name: "กริป", icon: "edit" },
  bag: { name: "กระเป๋า", icon: "bag" },
  accessories: { name: "อุปกรณ์อื่นๆ", icon: "more" },
};

const mockGear: GearItem[] = [
  {
    id: "1",
    category: "racket",
    brand: "YONEX",
    model: "Astrox 99 Pro",
    image: "/images/marketplace/racket-1.jpg",
    specs: {
      weight: "4U (83g)",
      balance: "Head Heavy",
      flexibility: "Stiff",
    },
    isPrimary: true,
  },
  {
    id: "2",
    category: "racket",
    brand: "VICTOR",
    model: "Thruster Ryuga II Pro",
    image: "/images/marketplace/racket-1.jpg",
    specs: {
      weight: "3U (88g)",
      balance: "Head Heavy",
      flexibility: "Medium",
    },
  },
  {
    id: "3",
    category: "shoes",
    brand: "YONEX",
    model: "Power Cushion 65 Z3",
    image: "/images/marketplace/shoes-1.jpg",
    specs: {
      size: "US 10",
      color: "White/Red",
    },
    isPrimary: true,
  },
  {
    id: "4",
    category: "string",
    brand: "YONEX",
    model: "BG65 Ti",
    image: "/images/marketplace/racket-1.jpg",
    specs: {
      tension: "27 lbs",
      gauge: "0.70mm",
    },
    isPrimary: true,
  },
];

export default function ProfileGearPage() {
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GearCategory | "all">("all");

  const categories = Object.keys(categoryInfo) as GearCategory[];
  
  const filteredGear = selectedCategory === "all" 
    ? mockGear 
    : mockGear.filter(g => g.category === selectedCategory);

  const gearByCategory = categories.reduce((acc, cat) => {
    acc[cat] = mockGear.filter(g => g.category === cat);
    return acc;
  }, {} as Record<GearCategory, GearItem[]>);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="tap-highlight">
                <Icons.chevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">
              อุปกรณ์ของฉัน
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "เสร็จสิ้น" : "แก้ไข"}
          </Button>
        </div>
      </header>

      {/* Category Filter */}
      <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="flex-shrink-0"
          >
            ทั้งหมด
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="flex-shrink-0"
            >
              {categoryInfo[cat].name}
              {gearByCategory[cat].length > 0 && (
                <span className="ml-1 text-xs opacity-70">
                  ({gearByCategory[cat].length})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      <main className="p-4 space-y-4">
        {filteredGear.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Icons.shuttlecock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">ยังไม่มีอุปกรณ์</p>
            <Button>
              <Icons.plus className="w-4 h-4 mr-2" />
              เพิ่มอุปกรณ์
            </Button>
          </div>
        ) : (
          filteredGear.map((item) => (
            <GlassCard
              key={item.id}
              className={cn(
                "p-4 transition-all",
                item.isPrimary && "ring-2 ring-primary"
              )}
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.model}
                    className="w-full h-full object-cover"
                  />
                  {item.isPrimary && (
                    <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Icons.star className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="text-xs text-primary font-medium">
                        {item.brand}
                      </span>
                      <h3 className="font-semibold text-foreground">
                        {item.model}
                      </h3>
                    </div>
                    {editMode && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Icons.edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Specs */}
                  {item.specs && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(item.specs).map(([key, value]) => (
                        <span
                          key={key}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">
                      {categoryInfo[item.category].name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions in Edit Mode */}
              {editMode && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  {!item.isPrimary && (
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Icons.star className="w-4 h-4 mr-1" />
                      ตั้งเป็นหลัก
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[#FA383E] hover:text-[#FA383E] bg-transparent"
                  >
                    <Icons.trash className="w-4 h-4 mr-1" />
                    ลบ
                  </Button>
                </div>
              )}
            </GlassCard>
          ))
        )}

        {/* Add Button */}
        {filteredGear.length > 0 && (
          <Button variant="outline" className="w-full bg-transparent">
            <Icons.plus className="w-4 h-4 mr-2" />
            เพิ่มอุปกรณ์
          </Button>
        )}
      </main>
    </div>
  );
}
