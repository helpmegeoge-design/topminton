"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { ShuttlecockIcon, Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const skillLevels = [
  { id: "beginner", label: "หน้าบ้าน", description: "เพิ่งเริ่มเล่น" },
  { id: "bg", label: "BG", description: "เล่นได้พอสมควร" },
  { id: "normal", label: "N", description: "เล่นเป็นประจำ" },
  { id: "strong", label: "S", description: "เล่นได้ดี" },
  { id: "pro", label: "P", description: "ระดับแข่งขัน" },
  { id: "b", label: "B", description: "มือ B" },
  { id: "a", label: "A", description: "มือ A" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    level: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg("รหัสผ่านไม่ตรงกัน");
        return;
      }
      if (formData.password.length < 6) {
        setErrorMsg("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.name) {
        setErrorMsg("กรุณากรอกชื่อ");
        return;
      }
      setStep(3);
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setErrorMsg("Supabase client not initialized");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name, // This meta data might be useful
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create Profile in public.profiles table
        // Splitting name roughly
        const nameParts = formData.name.split(" ");
        const firstName = nameParts[0] || formData.name;
        const lastName = nameParts.slice(1).join(" ") || "";

        // Generate random Short ID (XX000)
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        const shortId =
          chars.charAt(Math.floor(Math.random() * chars.length)) +
          chars.charAt(Math.floor(Math.random() * chars.length)) +
          nums.charAt(Math.floor(Math.random() * nums.length)) +
          nums.charAt(Math.floor(Math.random() * nums.length)) +
          nums.charAt(Math.floor(Math.random() * nums.length));

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            display_name: formData.name,
            first_name: firstName,
            last_name: lastName,
            email: formData.email,
            phone: formData.phone,
            skill_level: formData.level,
            short_id: shortId, // Explicitly set it
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Default values
            total_games: 0,
            points: 0,
            is_verified: false,
            is_admin: false
          });

        if (profileError) {
          console.error("Profile creation error:", JSON.stringify(profileError, null, 2));
          // If error is about uniqueness, we might want to retry, but for now just log
        }

        // 3. Force Check Session / Explicit Login
        let { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // Try explicit login
          const { data: loginData } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          });
          if (loginData.session) session = loginData.session;
        }

        if (session) {
          router.push("/");
          // Force a hard refresh to update UI state
          router.refresh();
          return;
        } else {
          alert("กรุณาตรวจสอบ Email เพื่อยืนยันตัวตน");
          router.push("/login"); // fallback
        }
      }

    } catch (err: any) {
      console.error("Registration Error:", err);
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center">
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)} className="p-2 -ml-2">
            <Icons.chevronLeft size={24} className="text-foreground" />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-3 shadow-lg">
            <ShuttlecockIcon size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">สมัครสมาชิก</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "w-8 h-1 rounded-full transition-colors",
                s <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Form */}
        <GlassCard className="w-full max-w-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-center text-red-500 bg-red-100 rounded-lg">
                {errorMsg}
              </div>
            )}

            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold mb-4">ข้อมูลบัญชี</h2>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Icons.eyeOff size={18} /> : <Icons.eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold mb-4">ข้อมูลส่วนตัว</h2>
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="ชื่อที่แสดงในแอป"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-lg font-semibold mb-4">ระดับฝีมือของคุณ</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  เลือกระดับที่ใกล้เคียงกับความสามารถของคุณ
                </p>
                <div className="space-y-2">
                  {skillLevels.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, level: level.id })}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        formData.level === level.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                          formData.level === level.id
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {level.label}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{level.label}</p>
                          <p className="text-xs text-muted-foreground">{level.description}</p>
                        </div>
                        {formData.level === level.id && (
                          <Icons.check size={20} className="text-primary ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isLoading || (step === 3 && !formData.level)}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังสมัคร...</span>
                </div>
              ) : step === 3 ? (
                "สมัครสมาชิก"
              ) : (
                "ถัดไป"
              )}
            </Button>
          </form>
        </GlassCard>

        {/* Login Link */}
        <p className="mt-6 text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
