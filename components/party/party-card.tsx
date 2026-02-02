"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CourtIcon, ClockIcon, UsersIcon, CheckIcon, QRCodeIcon } from "@/components/icons";
import { LevelBadgeGroup } from "@/components/ui/level-badge";
import type { Level } from "@/components/ui/level-badge";

interface PartyCardProps {
  id: string;
  name: string;
  courtName: string;
  courtAddress: string;
  distance: string;
  date: string;
  dayName: string;
  time: string;
  duration: string;
  currentParticipants: number;
  maxParticipants: number;
  requiredLevels?: Level[];
  organizerName: string;
  isVerified?: boolean;
  imageUrl?: string;
  className?: string;
}

export function PartyCard({
  id,
  name,
  courtName,
  courtAddress,
  distance,
  date,
  dayName,
  time,
  duration,
  currentParticipants,
  maxParticipants,
  requiredLevels,
  organizerName,
  isVerified,
  imageUrl,
  className,
}: PartyCardProps) {
  return (
    <Link
      href={`/party/${id}`}
      className={cn(
        "block rounded-2xl puffy-card overflow-hidden",
        "transition-all duration-200 tap-highlight",
        "active:scale-[0.98]",
        className
      )}
    >
      {/* Header with image or gradient */}
      <div className="relative h-28 bg-gradient-to-br from-primary/20 to-primary/40 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CourtIcon size={40} className="text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          {/* Status badge */}
          <div className={cn(
            "px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm",
            currentParticipants >= maxParticipants 
              ? "bg-red-500/90 text-white" 
              : "bg-green-500/90 text-white"
          )}>
            {currentParticipants >= maxParticipants ? "เต็มแล้ว" : "เปิดรับสมัคร"}
          </div>
          
          {/* QR Code indicator */}
          <div className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <QRCodeIcon size={16} className="text-foreground" />
          </div>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm">
              <span className="text-white text-xs font-medium">{date} ({dayName})</span>
            </div>
            <div className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm">
              <span className="text-white text-xs">{time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Title with verification */}
        <div className="flex items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CourtIcon size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-foreground text-sm line-clamp-1">{name}</h3>
              {isVerified && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <CheckIcon size={10} className="text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {courtName} • {distance}
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50">
          <div className="flex items-center gap-1 text-xs">
            <span className="font-semibold text-primary">{dayName}</span>
            <span className="text-muted-foreground">{date}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon size={12} />
            <span>{time}</span>
            <span>({duration})</span>
          </div>
        </div>

        {/* Required levels */}
        {requiredLevels && requiredLevels.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">ระดับที่ต้องการ</p>
            <LevelBadgeGroup levels={requiredLevels} size="sm" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            ผู้จัด: <span className="font-medium text-foreground">{organizerName}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <UsersIcon size={14} className="text-muted-foreground" />
            <span className={cn(
              "font-semibold",
              currentParticipants >= maxParticipants ? "text-[#FA383E]" : "text-primary"
            )}>
              {currentParticipants}/{maxParticipants}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
