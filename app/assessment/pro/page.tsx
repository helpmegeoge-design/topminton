"use client";

import React from "react"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type UploadStatus = "idle" | "uploading" | "processing" | "completed" | "error";

const assessmentCriteria = [
  {
    id: "footwork",
    name: "Footwork",
    nameT: "ฟุตเวิร์ค",
    description: "การเคลื่อนที่ในสนาม ความคล่องแคล่ว",
    maxScore: 25,
  },
  {
    id: "stroke",
    name: "Stroke Technique",
    nameT: "เทคนิคการตี",
    description: "ท่าทางการตี ความถูกต้อง",
    maxScore: 25,
  },
  {
    id: "tactics",
    name: "Game Tactics",
    nameT: "กลยุทธ์เกม",
    description: "การวางแผน การอ่านเกม",
    maxScore: 25,
  },
  {
    id: "fitness",
    name: "Physical Fitness",
    nameT: "สมรรถภาพร่างกาย",
    description: "ความอึด ความเร็ว พละกำลัง",
    maxScore: 25,
  },
];

const videoRequirements = [
  "คลิปความยาว 3-5 นาที",
  "ความละเอียดอย่างน้อย 720p",
  "มุมกล้องเห็นทั้งสนาม",
  "เห็นการเล่นทั้งการรุกและรับ",
  "ควรเป็นการแข่งขันจริง ไม่ใช่การซ้อม",
];

export default function ProAssessmentPage() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus("uploading");
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200));
      setUploadProgress(i);
    }

    setStatus("processing");
    
    // Simulate processing
    await new Promise((r) => setTimeout(r, 2000));
    
    setStatus("completed");
  };

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
              วัดระดับมืออาชีพ
            </h1>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {status === "idle" && (
          <>
            {/* Info Banner */}
            <GlassCard className="p-4 bg-primary/5 border-primary/20">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icons.info className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    การประเมินโดยผู้เชี่ยวชาญ
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ส่งคลิปการเล่นของคุณเพื่อรับการประเมินจากผู้เชี่ยวชาญ 
                    และรับใบรับรองระดับฝีมืออย่างเป็นทางการ
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Criteria */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-3">
                เกณฑ์การประเมิน
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {assessmentCriteria.map((criteria) => (
                  <GlassCard key={criteria.id} className="p-3">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {criteria.maxScore}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {criteria.nameT}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {criteria.description}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>

            {/* Requirements */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-3">
                ข้อกำหนดคลิปวิดีโอ
              </h2>
              <GlassCard className="p-4">
                <ul className="space-y-2">
                  {videoRequirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icons.check className="w-4 h-4 text-[#31A24C] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </section>

            {/* Upload Area */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-3">
                อัพโหลดคลิป
              </h2>
              <label className="block">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <GlassCard
                  className={cn(
                    "p-8 border-2 border-dashed cursor-pointer transition-all",
                    "hover:border-primary hover:bg-primary/5",
                    selectedFile ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex flex-col items-center text-center">
                    {selectedFile ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Icons.check className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-medium text-foreground mb-1">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Icons.camera className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground mb-1">
                          เลือกไฟล์วิดีโอ
                        </p>
                        <p className="text-sm text-muted-foreground">
                          รองรับ MP4, MOV สูงสุด 500MB
                        </p>
                      </>
                    )}
                  </div>
                </GlassCard>
              </label>
            </section>

            {/* Price */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ค่าบริการประเมิน</p>
                  <p className="text-2xl font-bold text-foreground">฿299</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">ระยะเวลา</p>
                  <p className="text-sm font-medium text-foreground">3-5 วันทำการ</p>
                </div>
              </div>
            </GlassCard>

            {/* Submit Button */}
            <Button
              className="w-full h-12 text-base font-semibold"
              disabled={!selectedFile}
              onClick={handleUpload}
            >
              ส่งคลิปเพื่อประเมิน
            </Button>
          </>
        )}

        {status === "uploading" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Icons.camera className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              กำลังอัพโหลด...
            </h2>
            <p className="text-muted-foreground mb-6">{uploadProgress}%</p>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {status === "processing" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-24 h-24 rounded-full bg-[#F7B928]/10 flex items-center justify-center mb-6">
              <Icons.clock className="w-12 h-12 text-[#F7B928] animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              กำลังประมวลผล
            </h2>
            <p className="text-muted-foreground text-center max-w-xs">
              ระบบกำลังตรวจสอบคลิปของคุณ กรุณารอสักครู่...
            </p>
          </div>
        )}

        {status === "completed" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-24 h-24 rounded-full bg-[#31A24C]/10 flex items-center justify-center mb-6 animate-bounce">
              <Icons.check className="w-12 h-12 text-[#31A24C]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              ส่งคลิปสำเร็จ!
            </h2>
            <p className="text-muted-foreground text-center max-w-xs mb-6">
              คลิปของคุณถูกส่งเพื่อประเมินแล้ว ผลจะแจ้งภายใน 3-5 วันทำการ
            </p>
            <div className="space-y-3 w-full max-w-xs">
              <Link href="/assessment/certificates">
                <Button className="w-full">ดูใบรับรองของฉัน</Button>
              </Link>
              <Link href="/assessment">
                <Button variant="outline" className="w-full bg-transparent">
                  กลับหน้าวัดระดับ
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
