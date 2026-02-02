"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { LevelBadge } from "@/components/ui/level-badge";
import type { Level } from "@/components/ui/level-badge";
import { cn } from "@/lib/utils";

type CertificateType = "quiz" | "pro";

interface Certificate {
  id: string;
  type: CertificateType;
  level: Level;
  score: number;
  maxScore: number;
  issuedDate: string;
  expiryDate: string;
  certificateNo: string;
}

const mockCertificates: Certificate[] = [
  {
    id: "1",
    type: "pro",
    level: "strong",
    score: 78,
    maxScore: 100,
    issuedDate: "15 ม.ค. 2569",
    expiryDate: "15 ม.ค. 2570",
    certificateNo: "TBM-PRO-2569-00123",
  },
  {
    id: "2",
    type: "quiz",
    level: "normal",
    score: 65,
    maxScore: 100,
    issuedDate: "10 ม.ค. 2569",
    expiryDate: "10 ม.ค. 2570",
    certificateNo: "TBM-QUIZ-2569-00456",
  },
];

export default function CertificatesPage() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link href="/assessment">
              <Button variant="ghost" size="icon" className="tap-highlight">
                <Icons.chevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">
              ใบรับรองของฉัน
            </h1>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {mockCertificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Icons.document className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              ยังไม่มีใบรับรอง
            </h2>
            <p className="text-muted-foreground text-center max-w-xs mb-6">
              ทำแบบทดสอบหรือส่งคลิปเพื่อรับการประเมินและรับใบรับรองระดับฝีมือ
            </p>
            <Link href="/assessment">
              <Button>เริ่มวัดระดับ</Button>
            </Link>
          </div>
        ) : (
          <>
            {mockCertificates.map((cert) => (
              <GlassCard
                key={cert.id}
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  "hover:shadow-lg active:scale-[0.98]"
                )}
                onClick={() => setSelectedCert(cert)}
              >
                <div className="flex items-start gap-4">
                  {/* Certificate Icon */}
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      cert.type === "pro"
                        ? "bg-[#F7B928]/10"
                        : "bg-primary/10"
                    )}
                  >
                    {cert.type === "pro" ? (
                      <Icons.trophy className="w-7 h-7 text-[#F7B928]" />
                    ) : (
                      <Icons.document className="w-7 h-7 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {cert.type === "pro"
                          ? "ใบรับรองระดับมืออาชีพ"
                          : "ใบรับรองแบบทดสอบ"}
                      </h3>
                      <LevelBadge level={cert.level} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      เลขที่: {cert.certificateNo}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>ออกเมื่อ: {cert.issuedDate}</span>
                      <span>หมดอายุ: {cert.expiryDate}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {cert.score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      /{cert.maxScore} คะแนน
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </>
        )}
      </main>

      {/* Certificate Detail Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-background rounded-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Certificate Preview */}
            <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-white text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />

              <div className="relative z-10">
                <Icons.trophy className="w-12 h-12 mx-auto mb-3 text-[#F7B928]" />
                <h2 className="text-xl font-bold mb-1">TOPMINTON</h2>
                <p className="text-sm opacity-80">Certificate of Achievement</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Level */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">ระดับที่ได้รับ</p>
                <LevelBadge level={selectedCert.level} size="lg" showLabel />
              </div>

              {/* Score */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">คะแนน</p>
                <p className="text-4xl font-bold text-primary">
                  {selectedCert.score}
                  <span className="text-lg text-muted-foreground">
                    /{selectedCert.maxScore}
                  </span>
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">เลขที่</p>
                  <p className="text-xs font-medium text-foreground break-all">
                    {selectedCert.certificateNo}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">หมดอายุ</p>
                  <p className="text-xs font-medium text-foreground">
                    {selectedCert.expiryDate}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Icons.share className="w-4 h-4 mr-2" />
                  แชร์
                </Button>
                <Button className="flex-1">
                  <Icons.document className="w-4 h-4 mr-2" />
                  ดาวน์โหลด PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
