"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { StarIcon, ClockIcon, CourtIcon } from "@/components/icons";

interface CourtCardProps {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  rating: number;
  distance?: string;
  hours: string;
  courtCount: number;
  pricePerHour: number;
  facilities?: string[];
  isPopular?: boolean;
  className?: string;
}

export function CourtCard({
  id,
  name,
  address,
  imageUrl,
  rating,
  distance,
  hours,
  courtCount,
  pricePerHour,
  facilities = [],
  isPopular = false,
  className,
}: CourtCardProps) {
  return (
    <Link
      href={`/courts/${id}`}
      className={cn(
        "flex gap-3 p-3 rounded-2xl puffy-card",
        "transition-all duration-200 tap-highlight",
        "active:scale-[0.98]",
        className
      )}
    >
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
        />
        {isPopular && (
          <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#FFD93D] text-[#8B6914] shadow-sm">
            <StarIcon size={10} filled className="text-[#8B6914]" />
            <span className="text-[10px] font-bold">ยอดนิยม</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-0.5">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
          {address}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <StarIcon size={12} filled className="text-[#F7B928]" />
            <span>{rating.toFixed(1)}</span>
          </div>
          {distance && (
            <span>{distance}</span>
          )}
          <div className="flex items-center gap-1">
            <ClockIcon size={12} className="text-muted-foreground" />
            <span>{hours}</span>
          </div>
        </div>

        {/* Facilities */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {facilities.slice(0, 3).map((facility) => (
              <span
                key={facility}
                className="px-1.5 py-0.5 text-[10px] rounded-md border border-primary/30 text-primary bg-primary/5"
              >
                {facility}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col items-end justify-between">
        <div className="px-2 py-1 rounded-lg bg-[#F5793A] text-white">
          <span className="text-xs font-bold">{pricePerHour}.-/ชม</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CourtIcon size={12} />
          <span>{courtCount} สนาม</span>
        </div>
      </div>
    </Link>
  );
}
