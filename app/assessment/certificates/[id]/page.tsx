"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const mockCertificate = {
  id: "CERT-2026-001",
  type: "pro",
  level: "S",
  levelName: "Strong",
  holderName: "สมชาย ใจดี",
  issueDate: "15 มกราคม 2569",
  validUntil: "15 มกราคม 2570",
  scores: {
    footwork: 85,
    strokeTechnique: 78,
    gameSense: 82,
    fitness: 88,
  },
  overallScore: 83,
  verifyUrl: "https://topminton.app/verify/CERT-2026-001",
};

const levelColors: Record<string, { bg: string; text: string; gradient: string }> = {
  BG: { bg: "from-sky-500 to-blue-600", text: "text-white", gradient: "bg-gradient-to-br from-sky-500 to-blue-600" },
  N: { bg: "from-green-500 to-emerald-600", text: "text-white", gradient: "bg-gradient-to-br from-green-500 to-emerald-600" },
  S: { bg: "from-yellow-500 to-amber-600", text: "text-white", gradient: "bg-gradient-to-br from-yellow-500 to-amber-600" },
  P: { bg: "from-orange-500 to-red-600", text: "text-white", gradient: "bg-gradient-to-br from-orange-500 to-red-600" },
  C: { bg: "from-purple-500 to-pink-600", text: "text-white", gradient: "bg-gradient-to-br from-purple-500 to-pink-600" },
};

// Simple QR Code SVG Generator (basic pattern)
function QRCodeSVG({ data, size = 100 }: { data: string; size?: number }) {
  // This creates a visual QR-like pattern
  const cells = 21;
  const cellSize = size / cells;
  
  // Generate deterministic pattern based on data
  const hash = data.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  
  const pattern: boolean[][] = [];
  for (let y = 0; y < cells; y++) {
    pattern[y] = [];
    for (let x = 0; x < cells; x++) {
      // Finder patterns (corners)
      const isFinderArea = (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7);
      if (isFinderArea) {
        const isOuterBorder = x === 0 || y === 0 || x === 6 || y === 6 || x === cells - 1 || y === 0 || x === cells - 7 || y === 6 || x === 0 || y === cells - 7 || x === 6 || y === cells - 1;
        const isInnerSquare = (x >= 2 && x <= 4 && y >= 2 && y <= 4) || 
                             (x >= cells - 5 && x <= cells - 3 && y >= 2 && y <= 4) ||
                             (x >= 2 && x <= 4 && y >= cells - 5 && y <= cells - 3);
        pattern[y][x] = isOuterBorder || isInnerSquare;
      } else {
        // Data pattern
        pattern[y][x] = ((hash + x * y + x + y) % 3) === 0;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {pattern.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function CertificateViewPage() {
  const router = useRouter();
  const params = useParams();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const colors = levelColors[mockCertificate.level] || levelColors.N;

  const handleDownload = async () => {
    setDownloading(true);
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a downloadable content
    const certificateData = `
TOPMINTON - ใบรับรองระดับฝีมือแบดมินตัน
=========================================
เลขที่: ${mockCertificate.id}
ชื่อ: ${mockCertificate.holderName}
ระดับ: ${mockCertificate.level} - ${mockCertificate.levelName}
คะแนนรวม: ${mockCertificate.overallScore}/100
วันที่ออก: ${mockCertificate.issueDate}
ใช้ได้ถึง: ${mockCertificate.validUntil}
=========================================
ยืนยันที่: ${mockCertificate.verifyUrl}
    `;
    
    const blob = new Blob([certificateData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${mockCertificate.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloading(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mockCertificate.verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `ใบรับรอง Topminton - ${mockCertificate.holderName}`,
        text: `ใบรับรองระดับ ${mockCertificate.levelName} จาก Topminton`,
        url: mockCertificate.verifyUrl,
      });
    }
  };

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
          <h1 className="text-lg font-semibold text-foreground flex-1">ใบรับรอง</h1>
          <Button variant="ghost" size="icon" onClick={() => setShowPreview(true)}>
            <Icons.eye className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 pb-32 space-y-6">
        {/* Certificate Card */}
        <div ref={certificateRef} className={cn("relative rounded-3xl overflow-hidden p-1", colors.gradient)}>
          <div className="bg-white rounded-2xl overflow-hidden">
            {/* Decorative Header */}
            <div className={cn("h-32 relative", colors.gradient)}>
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-16 h-16 border-4 border-white/30 rounded-full" />
                <div className="absolute bottom-4 right-4 w-24 h-24 border-4 border-white/20 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Icons.trophy size={80} className="text-white/20" />
                </div>
              </div>
              
              {/* Logo */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Icons.shuttlecock size={16} className="text-white" />
                </div>
                <span className="text-white font-bold text-lg tracking-wider">TOPMINTON</span>
              </div>

              {/* Level Badge */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center">
                  <div className={cn("w-20 h-20 rounded-full flex items-center justify-center", colors.gradient)}>
                    <div className="text-center">
                      <p className="text-2xl font-black text-white">{mockCertificate.level}</p>
                      <p className="text-[10px] font-medium text-white/90">{mockCertificate.levelName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-16 pb-6 px-6 space-y-5">
              {/* Title */}
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-900">ใบรับรองระดับฝีมือแบดมินตัน</h2>
                <p className="text-xs text-gray-500">Badminton Skill Level Certificate</p>
              </div>

              {/* Holder */}
              <div className="text-center py-4 border-y border-gray-100">
                <p className="text-xs text-gray-500 mb-1">ขอรับรองว่า</p>
                <p className="text-xl font-bold text-gray-900">{mockCertificate.holderName}</p>
                <p className="text-xs text-gray-500 mt-2">
                  ผ่านการทดสอบระดับฝีมือแบดมินตัน ระดับ <span className="font-semibold">{mockCertificate.levelName}</span>
                </p>
              </div>

              {/* Scores */}
              <div>
                <p className="text-xs font-medium text-gray-500 text-center mb-3">ผลการประเมิน</p>
                <div className="space-y-2">
                  {Object.entries(mockCertificate.scores).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      footwork: "Footwork",
                      strokeTechnique: "Technique",
                      gameSense: "Game Sense",
                      fitness: "Fitness",
                    };
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-20">{labels[key]}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", colors.gradient)}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-900 w-8">{value}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 py-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">คะแนนรวม</span>
                  <span className="text-3xl font-black text-primary">{mockCertificate.overallScore}</span>
                  <span className="text-sm text-gray-400">/100</span>
                </div>
              </div>

              {/* Certificate Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">เลขที่ใบรับรอง</p>
                  <p className="font-mono font-bold text-gray-900">{mockCertificate.id}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">วันที่ออก</p>
                  <p className="font-bold text-gray-900">{mockCertificate.issueDate}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center pt-4 border-t border-gray-100">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <QRCodeSVG data={mockCertificate.verifyUrl} size={80} />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  สแกนเพื่อยืนยันความถูกต้อง
                </p>
                <p className="text-[9px] text-gray-300 font-mono">{mockCertificate.verifyUrl}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Badge */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Icons.check size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">ใบรับรองถูกต้อง</p>
              <p className="text-xs text-muted-foreground">
                ยืนยันโดย Topminton เมื่อ {mockCertificate.issueDate}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Validity Info */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ใช้ได้ถึง</p>
              <p className="font-semibold text-foreground">{mockCertificate.validUntil}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
              ยังใช้ได้
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="space-y-3">
          <Button 
            className="w-full h-12 text-base"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <Icons.refresh className="h-5 w-5 mr-2 animate-spin" />
                กำลังดาวน์โหลด...
              </>
            ) : (
              <>
                <Icons.download size={20} className="mr-2" />
                ดาวน์โหลดใบรับรอง
              </>
            )}
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 bg-transparent" onClick={handleShare}>
              <Icons.share size={18} className="mr-2" />
              แชร์
            </Button>
            <Button variant="outline" className="h-11 bg-transparent" onClick={handleCopyLink}>
              {copied ? (
                <>
                  <Icons.check size={18} className="mr-2 text-green-500" />
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <Icons.copy size={18} className="mr-2" />
                  คัดลอก Link
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <DialogTitle>ตัวอย่างใบรับรอง</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
              <Icons.close size={20} />
            </Button>
          </div>
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className={cn("rounded-2xl overflow-hidden p-0.5", colors.gradient)}>
              <div className="bg-white rounded-xl p-4 space-y-4">
                {/* Mini version of certificate */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Icons.shuttlecock size={14} className="text-primary" />
                    <span className="text-sm font-bold">TOPMINTON</span>
                  </div>
                  <div className={cn("w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3", colors.gradient)}>
                    <div className="text-center">
                      <p className="text-lg font-black text-white">{mockCertificate.level}</p>
                      <p className="text-[8px] text-white/90">{mockCertificate.levelName}</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">{mockCertificate.holderName}</p>
                  <p className="text-xs text-gray-500">คะแนน: {mockCertificate.overallScore}/100</p>
                </div>
                
                <div className="flex justify-center">
                  <QRCodeSVG data={mockCertificate.verifyUrl} size={120} />
                </div>
                
                <div className="text-center text-xs text-gray-400">
                  <p>เลขที่: {mockCertificate.id}</p>
                  <p>หมดอายุ: {mockCertificate.validUntil}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
