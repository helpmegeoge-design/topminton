"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons, ChevronLeftIcon, CheckCircleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const mockTournament = {
  id: "1",
  name: "CENTNOX SO HOT PATHUM THANI TOURNAMENT",
  location: "Sport Refresh ลำลูกกา คลอง 4",
  date: "1 มี.ค. 2569",
  price: 1700,
  categories: [
    { id: "md-s", name: "ชายคู่ S", price: 1700, slots: 32, registered: 28 },
    { id: "md-n", name: "ชายคู่ N", price: 1500, slots: 32, registered: 30 },
    { id: "wd-s", name: "หญิงคู่ S", price: 1700, slots: 16, registered: 12 },
    { id: "xd-s", name: "คู่ผสม S", price: 1700, slots: 24, registered: 20 },
  ],
};

type Step = "category" | "partner" | "payment" | "success";

export default function TournamentRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");

  const selectedCat = mockTournament.categories.find(c => c.id === selectedCategory);

  const handleNext = () => {
    if (step === "category" && selectedCategory) {
      setStep("partner");
    } else if (step === "partner" && partnerName) {
      setStep("payment");
    } else if (step === "payment") {
      setStep("success");
    }
  };

  const steps = [
    { id: "category", label: "เลือกประเภท" },
    { id: "partner", label: "คู่หู" },
    { id: "payment", label: "ชำระเงิน" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 h-14">
            <Link href={`/tournament/${params.id}`} className="p-2 -ml-2 tap-highlight">
              <ChevronLeftIcon size={24} />
            </Link>
            <h1 className="font-semibold">สมัครแข่งขัน</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-scale-in">
            <CheckCircleIcon size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">สมัครสำเร็จ!</h2>
          <p className="text-muted-foreground mb-2">
            คุณได้สมัครแข่งขันประเภท {selectedCat?.name}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            หมายเลขการสมัคร: <span className="font-mono font-semibold">REG-2024-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
          </p>

          <Card className="w-full max-w-sm p-4 mb-6">
            <h3 className="font-semibold mb-3">รายละเอียดการสมัคร</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">รายการ</span>
                <span className="font-medium">{mockTournament.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ประเภท</span>
                <span>{selectedCat?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">คู่หู</span>
                <span>{partnerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">วันแข่ง</span>
                <span>{mockTournament.date}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-medium">ค่าสมัคร</span>
                <span className="font-bold text-primary">{selectedCat?.price.toLocaleString()} บาท</span>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 w-full max-w-sm">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push(`/tournament/${params.id}`)}>
              ดูรายละเอียด
            </Button>
            <Button className="flex-1" onClick={() => router.push("/tournament")}>
              กลับหน้าหลัก
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href={`/tournament/${params.id}`} className="p-2 -ml-2 tap-highlight">
            <ChevronLeftIcon size={24} />
          </Link>
          <h1 className="font-semibold">สมัครแข่งขัน</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Progress Steps */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center justify-between max-w-xs mx-auto">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                i < currentStepIndex ? "bg-primary text-primary-foreground" :
                i === currentStepIndex ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              )}>
                {i < currentStepIndex ? <Icons.check size={16} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-1",
                  i < currentStepIndex ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-xs mx-auto mt-2">
          {steps.map((s) => (
            <span key={s.id} className="text-[10px] text-muted-foreground">{s.label}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4">
        {step === "category" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold mb-1">เลือกประเภทการแข่งขัน</h2>
              <p className="text-sm text-muted-foreground">เลือกประเภทที่ต้องการสมัคร</p>
            </div>

            <div className="space-y-3">
              {mockTournament.categories.map((cat) => {
                const isFull = cat.registered >= cat.slots;
                const remaining = cat.slots - cat.registered;
                
                return (
                  <Card
                    key={cat.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all",
                      selectedCategory === cat.id ? "ring-2 ring-primary bg-primary/5" : "",
                      isFull ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"
                    )}
                    onClick={() => !isFull && setSelectedCategory(cat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{cat.name}</span>
                          {isFull && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-medium">
                              เต็มแล้ว
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          เหลือ {remaining} ทีม จาก {cat.slots} ทีม
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{cat.price.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">บาท/ทีม</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          isFull ? "bg-red-500" : "bg-primary"
                        )}
                        style={{ width: `${(cat.registered / cat.slots) * 100}%` }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === "partner" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold mb-1">ข้อมูลคู่หู</h2>
              <p className="text-sm text-muted-foreground">กรอกข้อมูลคู่หูของคุณ</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">ชื่อ-นามสกุล คู่หู *</Label>
                <Input
                  id="partnerName"
                  placeholder="กรอกชื่อ-นามสกุล"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnerPhone">เบอร์โทรศัพท์ คู่หู</Label>
                <Input
                  id="partnerPhone"
                  type="tel"
                  placeholder="0xx-xxx-xxxx"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                />
              </div>
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex gap-3">
                <Icons.info size={20} className="text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">หมายเหตุ</p>
                  <p className="text-muted-foreground mt-1">
                    กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนดำเนินการต่อ ข้อมูลนี้จะใช้ในการออกใบรับรองและจัดทำสายการแข่งขัน
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold mb-1">ชำระเงิน</h2>
              <p className="text-sm text-muted-foreground">สแกน QR Code เพื่อชำระเงิน</p>
            </div>

            {/* Order Summary */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">สรุปรายการ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ประเภท</span>
                  <span>{selectedCat?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">คู่หู</span>
                  <span>{partnerName}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold">รวมทั้งสิ้น</span>
                  <span className="font-bold text-lg text-primary">{selectedCat?.price.toLocaleString()} บาท</span>
                </div>
              </div>
            </Card>

            {/* QR Code */}
            <Card className="p-6 flex flex-col items-center">
              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Icons.qrCode size={80} className="text-muted-foreground mx-auto mb-2" />
                  <span className="text-xs text-muted-foreground">QR PromptPay</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                สแกนเพื่อชำระ {selectedCat?.price.toLocaleString()} บาท
              </p>
            </Card>

            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex gap-3">
                <Icons.warning size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">กรุณาชำระภายใน 30 นาที</p>
                  <p className="text-yellow-700 mt-1">
                    หากไม่ชำระภายในเวลาที่กำหนด การสมัครจะถูกยกเลิกอัตโนมัติ
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Action */}
      {step !== "success" && (
        <div className="sticky bottom-0 p-4 bg-background border-t">
          <div className="flex gap-3">
            {step !== "category" && (
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  if (step === "partner") setStep("category");
                  if (step === "payment") setStep("partner");
                }}
              >
                ย้อนกลับ
              </Button>
            )}
            <Button
              className="flex-1"
              disabled={
                (step === "category" && !selectedCategory) ||
                (step === "partner" && !partnerName)
              }
              onClick={handleNext}
            >
              {step === "payment" ? "ยืนยันการชำระเงิน" : "ถัดไป"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
