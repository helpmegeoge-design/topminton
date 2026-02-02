"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeftIcon, Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

type TournamentFormat = "single" | "double" | "round-robin" | "swiss";

interface FormData {
  name: string;
  description: string;
  location: string;
  courtId: string;
  format: TournamentFormat;
  maxTeams: number;
  registrationStart: string;
  registrationEnd: string;
  competitionDate: string;
  entryFee: number;
  prizePool: string;
  rules: string;
  categories: string[];
}

const formatOptions: { value: TournamentFormat; label: string; description: string }[] = [
  { value: "single", label: "Single Elimination", description: "แพ้คัดออก" },
  { value: "double", label: "Double Elimination", description: "แพ้ 2 ครั้งคัดออก" },
  { value: "round-robin", label: "Round Robin", description: "พบกันหมด" },
  { value: "swiss", label: "Swiss System", description: "จับคู่ตามคะแนน" },
];

const categoryOptions = [
  "ชายเดี่ยว",
  "หญิงเดี่ยว",
  "ชายคู่",
  "หญิงคู่",
  "คู่ผสม",
  "U18 ชาย",
  "U18 หญิง",
  "40+ ชาย",
  "40+ หญิง",
];

export default function TournamentCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    location: "",
    courtId: "",
    format: "single",
    maxTeams: 16,
    registrationStart: "",
    registrationEnd: "",
    competitionDate: "",
    entryFee: 0,
    prizePool: "",
    rules: "",
    categories: [],
  });

  const updateForm = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep(4); // Success step
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.location && formData.competitionDate;
      case 2:
        return formData.categories.length > 0 && formData.maxTeams > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <AppShell hideBottomNav>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/tournament" className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </Link>
          <h1 className="font-semibold text-foreground">สร้างการแข่งขัน</h1>
          <div className="w-10" />
        </div>

        {/* Progress Steps */}
        {step < 4 && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step > s ? <Icons.check size={16} /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={cn(
                        "flex-1 h-1 rounded-full transition-all",
                        step > s ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>ข้อมูลพื้นฐาน</span>
              <span>รายละเอียด</span>
              <span>ยืนยัน</span>
            </div>
          </div>
        )}
      </header>

      <main className="p-4 pb-24 space-y-4">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <GlassCard className="p-4 space-y-4">
              <h2 className="font-semibold text-foreground">ข้อมูลการแข่งขัน</h2>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">ชื่อการแข่งขัน *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="เช่น Topminton Championship 2025"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">รายละเอียด</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="อธิบายเกี่ยวกับการแข่งขัน..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">สถานที่จัดแข่ง *</label>
                <Input
                  value={formData.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                  placeholder="เช่น สนามแบดมินตัน S.T."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">วันแข่งขัน *</label>
                <Input
                  type="date"
                  value={formData.competitionDate}
                  onChange={(e) => updateForm("competitionDate", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">เปิดรับสมัคร</label>
                  <Input
                    type="date"
                    value={formData.registrationStart}
                    onChange={(e) => updateForm("registrationStart", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">ปิดรับสมัคร</label>
                  <Input
                    type="date"
                    value={formData.registrationEnd}
                    onChange={(e) => updateForm("registrationEnd", e.target.value)}
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 space-y-4">
              <h2 className="font-semibold text-foreground">รูปแบบการแข่งขัน</h2>

              <div className="grid grid-cols-2 gap-3">
                {formatOptions.map((format) => (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => updateForm("format", format.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all tap-highlight",
                      formData.format === format.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    <p className="font-medium text-sm text-foreground">{format.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format.description}</p>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Step 2: Categories & Details */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <GlassCard className="p-4 space-y-4">
              <h2 className="font-semibold text-foreground">ประเภทการแข่งขัน *</h2>
              <p className="text-sm text-muted-foreground">เลือกอย่างน้อย 1 ประเภท</p>

              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={cn(
                      "px-3 py-2 rounded-full text-sm font-medium transition-all tap-highlight",
                      formData.categories.includes(category)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-4 space-y-4">
              <h2 className="font-semibold text-foreground">จำนวนทีม</h2>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">จำนวนทีมสูงสุด *</label>
                <div className="flex items-center gap-3">
                  {[8, 16, 32, 64].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => updateForm("maxTeams", num)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-all tap-highlight",
                        formData.maxTeams === num
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 space-y-4">
              <h2 className="font-semibold text-foreground">ค่าสมัคร & รางวัล</h2>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">ค่าสมัคร (บาท/ทีม)</label>
                <Input
                  type="number"
                  value={formData.entryFee || ""}
                  onChange={(e) => updateForm("entryFee", Number(e.target.value))}
                  placeholder="0 = ฟรี"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">รางวัล</label>
                <Textarea
                  value={formData.prizePool}
                  onChange={(e) => updateForm("prizePool", e.target.value)}
                  placeholder="เช่น ชนะเลิศ 5,000 บาท, รองชนะเลิศ 2,000 บาท"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">กติกาเพิ่มเติม</label>
                <Textarea
                  value={formData.rules}
                  onChange={(e) => updateForm("rules", e.target.value)}
                  placeholder="กติกาพิเศษสำหรับการแข่งขันนี้..."
                  rows={3}
                />
              </div>
            </GlassCard>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <GlassCard className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Icons.trophy size={20} className="text-primary" />
                <h2 className="font-semibold text-foreground">ตรวจสอบข้อมูล</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">ชื่อการแข่งขัน</span>
                  <span className="font-medium text-foreground">{formData.name || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">สถานที่</span>
                  <span className="font-medium text-foreground">{formData.location || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">วันแข่งขัน</span>
                  <span className="font-medium text-foreground">{formData.competitionDate || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">รูปแบบ</span>
                  <span className="font-medium text-foreground">
                    {formatOptions.find((f) => f.value === formData.format)?.label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">จำนวนทีม</span>
                  <span className="font-medium text-foreground">{formData.maxTeams} ทีม</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">ค่าสมัคร</span>
                  <span className="font-medium text-foreground">
                    {formData.entryFee > 0 ? `${formData.entryFee.toLocaleString()} บาท` : "ฟรี"}
                  </span>
                </div>
                <div className="py-2">
                  <span className="text-muted-foreground">ประเภท</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 bg-amber-500/10 border-amber-500/20">
              <div className="flex gap-3">
                <Icons.alertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">หมายเหตุ</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    หลังจากสร้างการแข่งขันแล้ว คุณจะสามารถจัดการสาย แก้ไขผล และดูสถิติได้ในหน้าจัดการ
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-bounce-in">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Icons.check size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">สร้างการแข่งขันสำเร็จ!</h2>
            <p className="text-muted-foreground mt-2 max-w-xs">
              การแข่งขัน "{formData.name}" ถูกสร้างเรียบร้อยแล้ว
            </p>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={() => router.push("/tournament")}>
                กลับหน้าแข่งขัน
              </Button>
              <Button onClick={() => router.push("/tournament/manage")}>
                จัดการสาย
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action */}
      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border/50">
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(step - 1)}>
                ย้อนกลับ
              </Button>
            )}
            <Button
              className="flex-1"
              disabled={!canProceed() || isSubmitting}
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  handleSubmit();
                }
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Icons.loader size={16} className="animate-spin" />
                  กำลังสร้าง...
                </span>
              ) : step < 3 ? (
                "ถัดไป"
              ) : (
                "สร้างการแข่งขัน"
              )}
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
