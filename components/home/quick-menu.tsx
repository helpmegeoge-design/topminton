"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

interface QuickMenuItem {
  href: string;
  label: string;
  image?: string;
  icon?: React.ElementType; // Support component icons
  isNew?: boolean;
}

const quickMenuItems: QuickMenuItem[] = [
  { href: "/party", label: "หาก๊วน", image: "/icons/find-party.jpg" },
  { href: "/courts", label: "ตีเกม", image: "/icons/find-court.jpg" },
  { href: "/tools/cost-calculator", label: "คิดเงิน", icon: Icons.money, isNew: true }, // Changed to Icons.money
  { href: "/tools/team-generator", label: "สุ่มจับคู่", image: "/icons/team-generator.jpg" },
  { href: "/tools/scoreboard", label: "Scoreboard", image: "/icons/scoreboard.jpg" },
  { href: "/ranking", label: "Ranking", image: "/icons/ranking.jpg", isNew: true },
  { href: "/assessment", label: "วัดระดับ", image: "/icons/assessment.jpg", isNew: true },
  { href: "/marketplace", label: "ซื้อ-ขาย", image: "/icons/marketplace.jpg", isNew: true },
  { href: "/tournament", label: "แข่งแบด", image: "/icons/tournament.jpg" },
];

export function QuickMenu() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {quickMenuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center p-3 rounded-2xl",
            "puffy-card",
            "transition-all duration-200 tap-highlight",
            "active:scale-[0.97]"
          )}
        >
          <div className="relative mb-2">
            <div className={cn(
              "w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center",
              item.icon ? "bg-[#FFF5E6]" : "bg-muted/30"
            )}>
              {item.icon ? (
                <item.icon className="w-8 h-8 text-[#FF9500]" />
              ) : (
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.label}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {item.isNew && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#FF6B6B] text-white rounded-full shadow-sm">
                ใหม่
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-foreground text-center">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
