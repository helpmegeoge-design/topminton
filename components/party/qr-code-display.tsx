"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  partyId: string;
  partyName: string;
  date: string;
  time: string;
  courtName: string;
  className?: string;
}

export function QRCodeDisplay({
  partyId,
  partyName,
  date,
  time,
  courtName,
  className,
}: QRCodeDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const partyUrl = `https://topminton.app/party/${partyId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(partyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: partyName,
          text: `เข้าร่วมก๊วน ${partyName} ที่ ${courtName}`,
          url: partyUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      handleCopy();
    }
  };

  // Generate a simple QR code pattern (mock)
  const generateQRPattern = () => {
    const size = 21; // QR code version 1
    const pattern = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        // Position detection patterns (corners)
        const isCorner = 
          (i < 7 && j < 7) || 
          (i < 7 && j > size - 8) || 
          (i > size - 8 && j < 7);
        
        if (isCorner) {
          // Create position detection pattern
          const inOuter = i < 7 && j < 7 ? 
            (i === 0 || i === 6 || j === 0 || j === 6) :
            i < 7 && j > size - 8 ?
              (i === 0 || i === 6 || j === size - 7 || j === size - 1) :
              (i === size - 7 || i === size - 1 || j === 0 || j === 6);
          const inInner = i < 7 && j < 7 ?
            (i >= 2 && i <= 4 && j >= 2 && j <= 4) :
            i < 7 && j > size - 8 ?
              (i >= 2 && i <= 4 && j >= size - 5 && j <= size - 3) :
              (i >= size - 5 && i <= size - 3 && j >= 2 && j <= 4);
          row.push(inOuter || inInner ? 1 : 0);
        } else {
          // Random data modules
          row.push(Math.random() > 0.5 ? 1 : 0);
        }
      }
      pattern.push(row);
    }
    return pattern;
  };

  const qrPattern = generateQRPattern();

  return (
    <GlassCard className={cn("overflow-hidden", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between tap-highlight"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icons.qrCode size={20} className="text-primary" />
          </div>
          <div className="text-left">
            <div className="font-medium text-sm">QR Code เข้าร่วมก๊วน</div>
            <div className="text-xs text-muted-foreground">แชร์ให้เพื่อนเข้าร่วม</div>
          </div>
        </div>
        <Icons.chevronDown 
          size={20} 
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      {/* Expandable Content */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 pb-4 space-y-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl mx-auto w-fit">
            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(21, 8px)` }}>
              {qrPattern.map((row, i) => (
                row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={cn(
                      "w-2 h-2",
                      cell === 1 ? "bg-black" : "bg-white"
                    )}
                  />
                ))
              ))}
            </div>
          </div>

          {/* Party Info */}
          <div className="text-center space-y-1">
            <div className="font-semibold">{partyName}</div>
            <div className="text-sm text-muted-foreground">{courtName}</div>
            <div className="text-sm text-muted-foreground">{date} | {time}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Icons.check size={16} className="mr-2 text-green-500" />
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <Icons.copy size={16} className="mr-2" />
                  คัดลอกลิงก์
                </>
              )}
            </Button>
            <Button
              className="flex-1"
              onClick={handleShare}
            >
              <Icons.share size={16} className="mr-2" />
              แชร์
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
