"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type QuestionCategory = 'general' | 'technical' | 'tactical' | 'psychology' | 'trick';

type Question = {
  id: number;
  text: string;
  category: QuestionCategory;
  isTrick?: boolean;
  // If defined, this question will only appear if the user is trending high/low so far
  // But for tree logic, we might just define explicit next paths if we want to be strict.
  // For now, let's stick to a pool based approach or random selection with some mandatory ones.
};

// Full Pool of 40 Questions
const QUESTION_POOL: Question[] = [
  // --- General / Fitness (1-5) ---
  { id: 1, text: "ฉันสามารถวิ่งคอร์ทได้ทั่วสนามติดต่อกัน 2 เกมโดยไม่หมดแรง", category: 'general' },
  { id: 2, text: "ฉันมีการยืดเหยียดกล้ามเนื้อ (Warm-up / Cool-down) ทุกครั้งที่เล่น", category: 'general' },
  { id: 3, text: "ฉันสามารถเคลื่อนที่แบบสไลด์ (Chassé) ได้อย่างถูกต้องและคล่องแคล่ว", category: 'general' },
  { id: 4, text: "ฉันเล่นแบดมินตันอย่างน้อยสัปดาห์ละ 2-3 ครั้ง", category: 'general' },
  { id: 5, text: "ฉันเคยบาดเจ็บจากการเล่นแบดมินตันเพราะเคลื่อนที่ผิดท่า", category: 'general' }, // Reverse scoring/trick potential?

  // --- Technical (6-20) ---
  { id: 6, text: "ฉันสามารถตีลูกเซฟ (Clear) ถึงหลังคอร์ทได้ทั้งโฟร์แฮนด์และแบคแฮนด์", category: 'technical' },
  { id: 7, text: "ฉันสามารถเสิร์ฟลูกสั้นให้เลียดเน็ตและลงในจุดที่ต้องการได้อย่างสม่ำเสมอ", category: 'technical' },
  { id: 8, text: "ฉันสามารถรับลูกตบ (Defense) แล้วเปลี่ยนทิศทางลูกไปยังที่ว่างได้", category: 'technical' },
  { id: 9, text: "ฉันสามารถตีลูกหยอด (Drop) จากท้ายคอร์ทให้ลูกตกชิดเน็ตได้", category: 'technical' },
  { id: 10, text: "ฉันสามารถตีลูกตัด (Slice) หรือปั่นลูกให้หมุนได้", category: 'technical' },
  { id: 11, text: "ฉันสามารถกระโดดตบ (Jump Smash) ได้อย่างรุนแรงและแม่นยำ", category: 'technical' },
  { id: 12, text: "ฉันสามารถตีลูกดาด (Drive) สวนกลับเร็วๆ ได้ทันท่วงทีโดยไม่เสียจังหวะ", category: 'technical' },
  { id: 13, text: "ฉันสามารถแย็บลูกหน้าเน็ต (Net Kill) ได้ทันทีเมื่อลูกลอยสูง", category: 'technical' },
  { id: 14, text: "ฉันสามารถใช้แบคแฮนด์ตบ (Backhand Smash) ได้รุนแรง", category: 'technical', isTrick: true }, // Semi-trick for most
  { id: 15, text: "ฉันสามารถพลิกหน้าไม้หลอก (Deception) คู่ต่อสู้ได้บ่อยครั้ง", category: 'technical' },

  // --- Tactical (Doubles Focus) (21-30) - HARDER ---
  { id: 21, text: "ในประเภทคู่ เมื่อคู่ขาตบจากแดนหลัง ฉันสามารถอ่านทางบอลและดักลูกหน้าเน็ตได้ถูกต้องโดยอัตโนมัติ", category: 'tactical' },
  { id: 22, text: "ฉันสามารถเปลี่ยนจากรับเป็นรุก (Counter Attack) ได้ทันทีเมื่อคู่ต่อสู้ตีลูกดาดหรือลูกเลียดมาไม่ดี", category: 'tactical' },
  { id: 23, text: "ฉันเข้าใจระบบการหมุนเวียน (Rotation) เพื่อปิดช่องว่างในสนามได้สมบูรณ์แบบ แม้ในสถานการณ์ที่เสียเปรียบ", category: 'tactical' },
  { id: 24, text: "ฉันสามารถวางลูกเพื่อบีบให้คู่ต่อสู้ต้องตีโต้กลับมาในทิศทางที่คู่ของฉันรออยู่ได้ (Channeling)", category: 'tactical' },
  { id: 25, text: "ฉันรู้จังหวะการขึ้นเกม (Pace) ว่าช่วงไหนควรเล่นเร็วเพื่อกดดัน หรือดึงจังหวะช้าเพื่อตั้งเกมใหม่", category: 'tactical' },
  { id: 26, text: "ฉันสามารถวิเคราะห์จุดอ่อนของคู่แข่งและปรับแผนการเล่นร่วมกับคู่หูได้ทันทีระหว่างแข่ง", category: 'tactical' },

  // --- Psychology / Mindset (31-35) ---
  { id: 31, text: "เมื่อถูกนำห่าง ฉันสามารถตั้งสติและค่อยๆ ไล่ทำคะแนนคืนได้โดยไม่ถอดใจ", category: 'psychology' },
  { id: 32, text: "ฉันเคารพคำตัดสินของกรรมการและคู่แข่งเสมอ ไม่หงุดหงิดง่าย", category: 'psychology' },
  { id: 33, text: "ฉันสามารถอ่านเกมและเดาทางคู่ต่อสู้ได้ล่วงหน้า", category: 'psychology' },
  { id: 34, text: "ฉันรู้จุดอ่อนของตัวเองและพยายามไม่เล่นในจุดที่เสียเปรียบ", category: 'psychology' },

  // --- Trick Questions (36-40) ---
  { id: 36, text: "ฉันสามารถกระโดดตบจากเส้นหลังลงเส้นหน้าได้แม่นยำ 100% ทุกลูก", category: 'trick', isTrick: true },
  { id: 37, text: "ฉันไม่เคยตีลูกติดเน็ตเลยตลอดการแข่งขัน 20 เกมล่าสุด", category: 'trick', isTrick: true },
  { id: 38, text: "ฉันสามารถสั่งให้เพื่อนร่วมทีมเล่นตามแผนของฉันได้และชนะทุกครั้ง", category: 'trick', isTrick: true },
  { id: 39, text: "ฉันไม่เคยเสิร์ฟเสียเลยแม้แต่ลูกเดียวในรอบ 3 เดือน", category: 'trick', isTrick: true },
  { id: 40, text: "ฉันมั่นใจว่าฝีมือของฉันเหนือกว่านักกีฬาทีมชาติบางคน", category: 'trick', isTrick: true },
];

export default function AssessmentQuizPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Questions - Tree/Random Logic
  useEffect(() => {
    if (isInitialized) return;

    // 1. Mandatory Core Questions (Foundation)
    const coreIds = [1, 6, 7, 21, 22, 23];
    const coreQs = QUESTION_POOL.filter(q => coreIds.includes(q.id));

    // 2. Random selection from remaining technical/tactical
    const remainingTech = QUESTION_POOL.filter(q =>
      q.category === 'technical' && !coreIds.includes(q.id) && !q.isTrick);
    const techSample = shuffleArray(remainingTech).slice(0, 8); // Pick 8 more technical

    const remainingTac = QUESTION_POOL.filter(q =>
      q.category === 'tactical' && !coreIds.includes(q.id));
    const tacSample = shuffleArray(remainingTac).slice(0, 5); // Pick 5 more tactical

    const psySample = shuffleArray(QUESTION_POOL.filter(q => q.category === 'psychology')).slice(0, 3); // Pick 3 psych

    // 3. Trick Questions (Pick 2-3)
    const trickSample = shuffleArray(QUESTION_POOL.filter(q => q.category === 'trick')).slice(0, 3);

    // Combine
    let finalSet = [
      ...coreQs,
      ...techSample,
      ...tacSample,
      ...psySample,
      ...trickSample
    ];

    // Final Shuffle to mix categories (optional, or keep grouped? Mixing is better for flow)
    finalSet = shuffleArray(finalSet);

    // Ensure we have around 25-30 questions
    // Currently: 6 + 8 + 5 + 3 + 3 = 25 questions. Perfect.

    setActiveQuestions(finalSet);
    setIsInitialized(true);
  }, [isInitialized]);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const progress = activeQuestions.length > 0
    ? ((currentQuestionIndex) / activeQuestions.length) * 100
    : 0;

  // Options for Likert Scale (Tactical Only)
  const tacticalOptions = [
    { label: "ทำไม่ได้", score: 0, color: "bg-red-500", icon: "❌" },
    { label: "ทำได้บ้าง", score: 25, color: "bg-orange-500", icon: "🤏" },
    { label: "ทำได้", score: 50, color: "bg-yellow-500", icon: "👌" },
    { label: "ทำได้ดี", score: 75, color: "bg-lime-500", icon: "✨" },
    { label: "เชี่ยวชาญ", score: 100, color: "bg-green-500", icon: "🔥" },
  ];

  // Options for Yes/No (General, Technical, etc.)
  const yesNoOptions = [
    { label: "ไม่ใช่", score: 0, color: "bg-red-500", icon: "❌" },
    { label: "ใช่", score: 100, color: "bg-green-500", icon: "✅" },
  ];

  const handleAnswer = async (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    // Adaptive Tree Logic (Simplistic version)
    // If user answers 'Expert' (100) on a core technical question (e.g. Clears), 
    // we might want to inject a Harder technical question next if available?
    // For now, sticking to the pre-selected pool but we could dynamically inject here.

    if (currentQuestionIndex < activeQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 150);
    } else {
      await calculateAndSaveResult(newAnswers);
    }
  };

  const calculateAndSaveResult = async (finalAnswers: number[]) => {
    setIsSubmitting(true);

    let totalScore = 0;
    let trickPenalty = 0;
    let validQuestionCount = 0;

    activeQuestions.forEach((q, index) => {
      const score = finalAnswers[index];

      if (q.category === 'trick') {
        // Trick Logic: 
        // If they answer 'Expert' (100) or 'Good' (75) on a blatant trick/unrealistic question
        // We penalize.
        if (score >= 75) {
          trickPenalty += 10; // Heavy penalty for lying/delusion
        }
      } else {
        totalScore += score;
        validQuestionCount++;
      }
    });

    let averageScore = validQuestionCount > 0 ? totalScore / validQuestionCount : 0;

    // Apply penalty
    averageScore -= trickPenalty;
    if (averageScore < 0) averageScore = 0;

    // Detailed Mapping Logic per user request
    let level = 'beginner';
    if (averageScore >= 98) level = 'A';
    else if (averageScore >= 95) level = 'B';
    else if (averageScore >= 89) level = 'P+';
    else if (averageScore >= 83) level = 'P';
    else if (averageScore >= 76) level = 'P-';
    else if (averageScore >= 67) level = 'S';
    else if (averageScore >= 60) level = 'N+';
    else if (averageScore >= 53) level = 'N';
    else if (averageScore >= 46) level = 'N-';
    else if (averageScore >= 36) level = 'BG+';
    else if (averageScore >= 26) level = 'BG';
    else if (averageScore >= 16) level = 'BG-';
    else level = 'beginner'; // มือใหม่ / หน้าบ้าน

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ skill_level: level })
          .eq('id', user.id);

        if (error) throw error;
        toast.success(`ประเมินเสร็จสิ้น! ระดับของคุณคือ ${level}`);
      } else {
        toast.info("คุณยังไม่ได้เข้าสู่ระบบ (ผลลัพธ์จะไม่ถูกบันทึกถาวร)");
      }

      router.push(`/assessment/completed?level=${encodeURIComponent(level)}`);
    } catch (error: any) {
      console.error("Assessment Save Error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      // Show more specific error to user
      if (error.code === '23514') { // Check constraint violation code in Postgres
        toast.error("ไม่สามารถบันทึกระดับได้ (Database Skill Level Constraint Mismatch). กรุณาอัปเดต Database.");
      } else {
        toast.error(`เกิดข้อผิดพลาดในการบันทึก: ${error.message || "Unknown Error"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  if (!isInitialized || activeQuestions.length === 0 || !currentQuestion) {
    return (
      <AppShell hideNav>
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse text-muted-foreground">กำลังเตรียมชุดคำถาม...</div>
        </div>
      </AppShell>
    );
  }

  // Decide which options to use
  const currentOptions = currentQuestion.category === 'tactical' ? tacticalOptions : yesNoOptions;

  return (
    <AppShell hideNav>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 glass-card px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight"
            >
              <ArrowLeftIcon size={20} className="text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-base font-semibold text-foreground leading-tight">
                แบบทดสอบวัดระดับ (Advanced)
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {currentQuestionIndex + 1}/{activeQuestions.length}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="mb-4 flex justify-center">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              currentQuestion.category === 'psychology' ? "bg-purple-100 text-purple-700" :
                currentQuestion.category === 'technical' ? "bg-blue-100 text-blue-700" :
                  currentQuestion.category === 'tactical' ? "bg-orange-100 text-orange-700" :
                    currentQuestion.isTrick ? "bg-gray-100 text-gray-500" : // Hide Trick label in real UI? Maybe keep it secret
                      "bg-gray-100 text-gray-700"
            )}>
              {/* Don't show 'Trick' to user, show General or something else */}
              {currentQuestion.isTrick ? "General" : currentQuestion.category}
            </span>
          </div>

          <div className="mb-8 text-center bg-violet-50/50 p-6 rounded-3xl border border-violet-100 min-h-[160px] flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold text-foreground leading-snug">
              "{currentQuestion.text}"
            </h2>
          </div>

          <div className={cn(
            "grid gap-2",
            currentQuestion.category === 'tactical' ? "grid-cols-5" : "grid-cols-2"
          )}>
            {currentOptions.map((option, idx) => (
              <button
                key={idx}
                className={cn(
                  "flex flex-col items-center gap-2 group transition-all active:scale-95",
                  isSubmitting && "opacity-50 pointer-events-none"
                )}
                onClick={() => handleAnswer(option.score)}
              >
                <div
                  className={cn(
                    "rounded-2xl flex items-center justify-center text-white text-xl shadow-md transition-transform group-hover:-translate-y-1",
                    option.color,
                    currentQuestion.category === 'tactical' ? "w-12 h-12 sm:w-14 sm:h-14" : "w-full h-16 sm:h-20"
                  )}
                >
                  {option.icon}
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-center text-foreground/80 leading-tight px-1">
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {isSubmitting && (
            <div className="mt-8 text-center text-muted-foreground animate-pulse">
              กำลังวิเคราะห์ทักษะและประเมินระดับ...
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
