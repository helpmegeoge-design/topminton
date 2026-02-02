"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/ui/level-badge";
import { ArrowLeftIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const quizQuestions = [
  {
    id: 1,
    category: "กติกา",
    question: "ในการเสิร์ฟแบดมินตัน ลูกต้องถูกตีจากระดับใดของเอว?",
    options: ["สูงกว่าเอว", "ต่ำกว่าเอว", "ระดับเอวพอดี", "ไม่มีกฎกำหนด"],
    correctAnswer: 1,
  },
  {
    id: 2,
    category: "กติกา",
    question: "การแข่งขันแบดมินตันประเภทเดี่ยว เล่นกี่เกมถึงจะชนะ?",
    options: ["1 เกม", "2 ใน 3 เกม", "3 ใน 5 เกม", "4 เกม"],
    correctAnswer: 1,
  },
  {
    id: 3,
    category: "เทคนิค",
    question: "การตีลูกแบบ Clear มีจุดประสงค์หลักคืออะไร?",
    options: [
      "ตีให้ลูกลงใกล้เน็ต",
      "ตีให้ลูกไปสูงและลึกถึงเส้นหลัง",
      "ตีให้ลูกเร็วและแรง",
      "ตีให้ลูกหมุน",
    ],
    correctAnswer: 1,
  },
  {
    id: 4,
    category: "เทคนิค",
    question: "การจับไม้แบบ Forehand Grip นิ้วหัวแม่มือควรอยู่ตำแหน่งใด?",
    options: [
      "ด้านแบนของด้ามจับ",
      "ด้านแคบของด้ามจับ",
      "พันรอบด้ามจับ",
      "ไม่สัมผัสด้ามจับ",
    ],
    correctAnswer: 0,
  },
  {
    id: 5,
    category: "กลยุทธ์",
    question: "เมื่อคู่ต่อสู้อยู่หลังสนาม ควรใช้ช็อตแบบใด?",
    options: ["Clear", "Drop shot", "Smash", "Drive"],
    correctAnswer: 1,
  },
  {
    id: 6,
    category: "กติกา",
    question: "คะแนนสูงสุดในแต่ละเกมคือเท่าไหร่?",
    options: ["15 คะแนน", "21 คะแนน", "25 คะแนน", "30 คะแนน"],
    correctAnswer: 3,
  },
  {
    id: 7,
    category: "เทคนิค",
    question: "การตี Smash ที่ดีควรตีลูกที่จุดใด?",
    options: [
      "ระดับต่ำกว่าเอว",
      "ระดับหน้าอก",
      "จุดสูงสุดที่แขนเอื้อมถึง",
      "หลังศีรษะ",
    ],
    correctAnswer: 2,
  },
  {
    id: 8,
    category: "กลยุทธ์",
    question: "ในการเล่นคู่ รูปแบบการยืนแบบ Side-by-Side เหมาะกับสถานการณ์ใด?",
    options: ["ตอนรุก", "ตอนรับ/ป้องกัน", "ตอนเสิร์ฟ", "ตลอดเวลา"],
    correctAnswer: 1,
  },
  {
    id: 9,
    category: "กติกา",
    question: "ถ้าลูกตกลงบนเส้น ถือว่าเป็นลูกอะไร?",
    options: ["ลูกเสีย (Out)", "ลูกดี (In)", "เล่นใหม่ (Let)", "แล้วแต่กรรมการ"],
    correctAnswer: 1,
  },
  {
    id: 10,
    category: "เทคนิค",
    question: "Backhand Clear ใช้กล้ามเนื้อส่วนใดเป็นหลัก?",
    options: ["ไหล่และแขน", "ข้อมือและนิ้ว", "ขาและสะโพก", "หลังและหน้าท้อง"],
    correctAnswer: 1,
  },
];

type QuizState = "intro" | "playing" | "result";

export default function QuizPage() {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showCorrect, setShowCorrect] = useState(false);

  // Timer
  useEffect(() => {
    if (quizState !== "playing" || showCorrect) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, currentQuestion, showCorrect]);

  const handleTimeout = () => {
    setAnswers([...answers, -1]);
    moveToNext();
  };

  const handleAnswer = (index: number) => {
    if (showCorrect) return;
    setSelectedAnswer(index);
    setShowCorrect(true);
    setAnswers([...answers, index]);

    setTimeout(() => {
      moveToNext();
    }, 1500);
  };

  const moveToNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowCorrect(false);
      setTimeLeft(30);
    } else {
      setQuizState("result");
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getResultLevel = (score: number) => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 90) return { level: "pro", name: "P (Pro)" };
    if (percentage >= 75) return { level: "strong", name: "S (Strong)" };
    if (percentage >= 60) return { level: "normal", name: "N (Normal)" };
    if (percentage >= 40) return { level: "bg", name: "BG (Background)" };
    return { level: "beginner", name: "หน้าบ้าน" };
  };

  // Intro Screen
  if (quizState === "intro") {
    return (
      <AppShell>
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 to-background">
          <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight"
              >
                <ArrowLeftIcon size={20} className="text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">
                แบบทดสอบพื้นฐาน
              </h1>
            </div>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <QuizIcon size={48} className="text-primary" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
              พร้อมทดสอบหรือยัง?
            </h2>
            <p className="text-muted-foreground text-center mb-8 max-w-xs">
              ตอบคำถาม {quizQuestions.length} ข้อ เพื่อประเมินระดับฝีมือของคุณ
            </p>

            <GlassCard className="w-full max-w-sm p-4 mb-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">จำนวนคำถาม</span>
                  <span className="font-medium text-foreground">
                    {quizQuestions.length} ข้อ
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">เวลาต่อข้อ</span>
                  <span className="font-medium text-foreground">30 วินาที</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">หมวดหมู่</span>
                  <span className="font-medium text-foreground">
                    กติกา, เทคนิค, กลยุทธ์
                  </span>
                </div>
              </div>
            </GlassCard>

            <Button
              className="w-full max-w-sm h-14 text-lg font-semibold"
              onClick={() => setQuizState("playing")}
            >
              เริ่มทำแบบทดสอบ
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Result Screen
  if (quizState === "result") {
    const score = calculateScore();
    const result = getResultLevel(score);
    const percentage = Math.round((score / quizQuestions.length) * 100);

    return (
      <AppShell>
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 to-background">
          <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/assessment")}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight"
              >
                <ArrowLeftIcon size={20} className="text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">
                ผลการทดสอบ
              </h1>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-6">
            {/* Score Card */}
            <GlassCard className="p-6 text-center">
              <div className="mb-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 relative">
                  <span className="text-4xl font-bold text-primary">
                    {percentage}%
                  </span>
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-muted"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray={`${percentage * 2.83} 283`}
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                </div>
                <p className="text-lg text-muted-foreground">
                  ตอบถูก {score} จาก {quizQuestions.length} ข้อ
                </p>
              </div>

              <div className="py-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-2">
                  ระดับที่ประเมินได้
                </p>
                <div className="flex items-center justify-center gap-2">
                  <LevelBadge level={result.level as any} size="lg" />
                  <span className="text-xl font-bold text-foreground">
                    {result.name}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Category Breakdown */}
            <GlassCard className="p-4">
              <h3 className="font-semibold text-foreground mb-4">
                ผลตามหมวดหมู่
              </h3>
              <div className="space-y-3">
                {["กติกา", "เทคนิค", "กลยุทธ์"].map((category) => {
                  const categoryQuestions = quizQuestions.filter(
                    (q) => q.category === category
                  );
                  const categoryCorrect = categoryQuestions.filter(
                    (q, i) =>
                      answers[quizQuestions.indexOf(q)] === q.correctAnswer
                  ).length;
                  const categoryPercent = Math.round(
                    (categoryCorrect / categoryQuestions.length) * 100
                  );

                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{category}</span>
                        <span className="text-muted-foreground">
                          {categoryCorrect}/{categoryQuestions.length}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${categoryPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full h-12"
                onClick={() => router.push("/assessment")}
              >
                กลับหน้าศูนย์วัดระดับ
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onClick={() => {
                  setQuizState("intro");
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setSelectedAnswer(null);
                  setShowCorrect(false);
                  setTimeLeft(30);
                }}
              >
                ทำแบบทดสอบอีกครั้ง
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // Playing Screen
  const question = quizQuestions[currentQuestion];

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Header with Progress */}
        <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight"
            >
              <ArrowLeftIcon size={20} className="text-foreground" />
            </button>
            <span className="text-sm font-medium text-foreground">
              ข้อ {currentQuestion + 1}/{quizQuestions.length}
            </span>
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                timeLeft <= 10
                  ? "bg-red-100 text-red-600"
                  : "bg-primary/10 text-primary"
              )}
            >
              {timeLeft}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
              }}
            />
          </div>
        </header>

        <div className="flex-1 p-4 flex flex-col">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              {question.category}
            </span>
          </div>

          {/* Question */}
          <GlassCard className="p-5 mb-6">
            <h2 className="text-lg font-semibold text-foreground leading-relaxed">
              {question.question}
            </h2>
          </GlassCard>

          {/* Options */}
          <div className="space-y-3 flex-1">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showResult = showCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showCorrect}
                  className={cn(
                    "w-full p-4 rounded-2xl text-left transition-all duration-200 tap-highlight",
                    "border-2",
                    !showResult && !isSelected && "bg-card border-border/50",
                    !showResult && isSelected && "bg-primary/10 border-primary",
                    showResult &&
                      isCorrect &&
                      "bg-green-50 border-green-500 text-green-800",
                    showResult &&
                      isSelected &&
                      !isCorrect &&
                      "bg-red-50 border-red-500 text-red-800",
                    showResult &&
                      !isSelected &&
                      !isCorrect &&
                      "bg-card border-border/50 opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                        !showResult && "bg-muted text-muted-foreground",
                        showResult && isCorrect && "bg-green-500 text-white",
                        showResult &&
                          isSelected &&
                          !isCorrect &&
                          "bg-red-500 text-white"
                      )}
                    >
                      {showResult && isCorrect ? (
                        <CheckIcon size={16} />
                      ) : showResult && isSelected && !isCorrect ? (
                        <XIcon size={16} />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function QuizIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.3062 14.1652 11.4175 13 11.8293V13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function XIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
