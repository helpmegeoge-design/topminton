"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface TBPointsWidgetProps {
  points: number;
  className?: string;
}

export function TBPointsWidget({ points, className }: TBPointsWidgetProps) {
  return (
    <Link 
      href="/shop"
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-gradient-to-r from-[#FFD93D] to-[#FFB800]",
        "shadow-sm shadow-[#FFB800]/30",
        "transition-all duration-200 tap-highlight hover:shadow-md",
        className
      )}
    >
      <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
        <span className="text-[9px] font-bold text-white drop-shadow-sm">TB</span>
      </div>
      <span className="text-sm font-bold text-white drop-shadow-sm">
        {points.toLocaleString()}
      </span>
    </Link>
  );
}
