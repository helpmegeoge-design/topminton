"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface OnboardingSlide {
  icon: keyof typeof Icons;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: "shuttlecock",
    title: "ยินดีต้อนรับสู่ Topminton",
    description: "แอปสำหรับคนรักแบดมินตัน หาก๊วน ตีเกม และเชื่อมต่อกับเพื่อนๆ นักแบด",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: "users",
    title: "หาก๊วนง่ายๆ",
    description: "ค้นหาก๊วนแบดมินตันใกล้คุณ หรือสร้างก๊วนของตัวเอง แล้วเชิญเพื่อนมาร่วมสนุก",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: "court",
    title: "จองคอร์ทสะดวก",
    description: "ค้นหาและจองคอร์ทแบดมินตันได้ทันที พร้อมดูรีวิวจากผู้เล่นจริง",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: "trophy",
    title: "แข่งขันและสะสมคะแนน",
    description: "ร่วมแข่งขัน ทำภารกิจ สะสม TB Points และไต่อันดับในลีดเดอร์บอร์ด",
    color: "from-amber-500 to-orange-500",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push("/");
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  const slide = slides[currentSlide];
  const IconComponent = Icons[slide.icon];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip Button */}
      <div className="flex justify-end p-4">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-muted-foreground tap-highlight hover:text-foreground transition-colors"
        >
          ข้าม
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Icon */}
        <div
          className={cn(
            "w-32 h-32 rounded-full bg-gradient-to-br flex items-center justify-center mb-8 animate-bounce-in",
            slide.color
          )}
          key={currentSlide}
        >
          <IconComponent size={64} className="text-white" />
        </div>

        {/* Text */}
        <div className="animate-fade-in" key={`text-${currentSlide}`}>
          <h1 className="text-2xl font-bold text-foreground mb-4">{slide.title}</h1>
          <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Pagination & Actions */}
      <div className="p-8 space-y-6">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "bg-muted hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* Button */}
        <Button onClick={handleNext} className="w-full h-12 text-base">
          {currentSlide < slides.length - 1 ? "ถัดไป" : "เริ่มใช้งาน"}
        </Button>

        {/* Login Link */}
        {currentSlide === slides.length - 1 && (
          <p className="text-center text-sm text-muted-foreground">
            มีบัญชีอยู่แล้ว?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-primary font-medium tap-highlight"
            >
              เข้าสู่ระบบ
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
