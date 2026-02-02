"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Icons, ArrowLeftIcon, CommentIcon, SendIcon, InfoIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const faqCategories = [
  { id: "general", label: "ทั่วไป" },
  { id: "party", label: "ก๊วน" },
  { id: "payment", label: "การชำระเงิน" },
  { id: "account", label: "บัญชี" },
];

const faqs = [
  {
    category: "general",
    question: "Topminton คืออะไร?",
    answer: "Topminton เป็นแอปพลิเคชันสำหรับคนรักแบดมินตัน ช่วยให้คุณค้นหาคอร์ท หาก๊วน และติดตามสถิติการเล่นของคุณได้อย่างง่ายดาย",
  },
  {
    category: "general",
    question: "ระดับฝีมือแบ่งอย่างไร?",
    answer: "ระดับฝีมือแบ่งเป็น 6 ระดับ: หน้าบ้าน, BG (Background), N (Normal), S (Strong), P (Pro), และ C (Champion) โดยพิจารณาจากผลการแข่งขันและการประเมินจากผู้เชี่ยวชาญ",
  },
  {
    category: "party",
    question: "วิธีสร้างก๊วนทำอย่างไร?",
    answer: "กดปุ่ม + ที่หน้าก๊วน เลือกคอร์ท วันเวลา และจำนวนคนที่ต้องการ จากนั้นกดสร้างก๊วน ระบบจะสร้าง QR Code สำหรับแชร์ให้เพื่อนได้ทันที",
  },
  {
    category: "party",
    question: "วิธีหารค่าใช้จ่ายกับเพื่อนในก๊วน?",
    answer: "หลังเล่นเสร็จ กดปุ่ม 'คิดเงิน' ในหน้าก๊วน กรอกค่าใช้จ่ายทั้งหมด ระบบจะคำนวณและสร้าง QR PromptPay สำหรับแต่ละคนให้อัตโนมัติ",
  },
  {
    category: "payment",
    question: "TB Points คืออะไร?",
    answer: "TB Points เป็นคะแนนสะสมในแอป สามารถนำไปแลกเฟรมโปรไฟล์พิเศษและของรางวัลอื่นๆ ได้ที่ร้านค้าในแอป",
  },
  {
    category: "payment",
    question: "วิธีเติม TB Points?",
    answer: "ปัจจุบัน TB Points ได้จากการทำภารกิจในแอป เช่น เข้าร่วมก๊วน รีวิวคอร์ท หรือเข้าแอปติดต่อกัน",
  },
  {
    category: "account",
    question: "ลืมรหัสผ่านทำอย่างไร?",
    answer: "กดปุ่ม 'ลืมรหัสผ่าน' ที่หน้าเข้าสู่ระบบ กรอกอีเมลที่ลงทะเบียนไว้ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณ",
  },
  {
    category: "account",
    question: "วิธีลบบัญชีผู้ใช้?",
    answer: "ไปที่ ตั้งค่า > จัดการบัญชี > ลบบัญชี การลบบัญชีจะไม่สามารถกู้คืนได้ และข้อมูลทั้งหมดจะถูกลบอย่างถาวร",
  },
];

const contactOptions = [
  { icon: CommentIcon, label: "แชทกับเรา", description: "ตอบภายใน 24 ชม.", action: "chat" },
  { icon: SendIcon, label: "อีเมล", description: "support@topminton.app", action: "email" },
  { icon: InfoIcon, label: "โทรศัพท์", description: "02-XXX-XXXX", action: "phone" },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4 flex items-center gap-3">
          <Link href="/more" className="p-2 -ml-2">
            <ArrowLeftIcon size={24} className="text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold">ช่วยเหลือ</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Contact Options */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">ติดต่อเรา</h2>
          <div className="grid grid-cols-3 gap-3">
            {contactOptions.map((option) => (
              <GlassCard key={option.label} className="p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <option.icon size={24} className="text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">คำถามที่พบบ่อย</h2>
          
          {/* Category Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedFaq(null);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
                  activeCategory === cat.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <GlassCard key={index} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <Icons.chevronDown
                    size={20}
                    className={cn(
                      "text-muted-foreground transition-transform flex-shrink-0",
                      expandedFaq === index && "rotate-180"
                    )}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Report Issue */}
        <GlassCard className="p-4">
          <h3 className="font-semibold text-foreground mb-2">พบปัญหาอื่นๆ?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            หากคุณพบปัญหาที่ไม่ได้ระบุในคำถามที่พบบ่อย สามารถแจ้งปัญหาให้เราทราบได้
          </p>
          <Link href="/help/report">
            <button
              type="button"
              className="w-full py-3 px-4 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              แจ้งปัญหา
            </button>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
