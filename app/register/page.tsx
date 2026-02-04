"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShuttlecockIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";

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

    setIsLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setErrorMsg("ระบบเชื่อมต่อขัดข้อง กรุณาลองใหม่");
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
            full_name: formData.name,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create Profile
        const nameParts = formData.name.split(" ");
        const firstName = nameParts[0] || formData.name;
        const lastName = nameParts.slice(1).join(" ") || "";

        // Generate random Short ID
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
            skill_level: "beginner", // Default to beginner
            short_id: shortId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            total_games: 0,
            points: 0,
            is_verified: false,
            is_admin: false
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        let { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          const { data: loginData } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          });
          if (loginData.session) session = loginData.session;
        }

        if (session) {
          router.push("/");
          router.refresh();
        } else {
          setErrorMsg("กรุณาตรวจสอบ Email เพื่อยืนยันตัวตน");
          setTimeout(() => router.push("/login"), 3000);
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
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-[#F8FAFC] overflow-hidden">
      {/* Moving Purple Fire/Plasma Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.2s' }} />

        {/* Light Mesh Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8)_0%,rgba(248,250,252,1)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header/Logo Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-primary rounded-[24px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-16 h-16 rounded-[20px] bg-white flex items-center justify-center shadow-2xl shadow-primary/20 transform transition-all duration-500">
              <ShuttlecockIcon size={36} className="text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600">
              {step === 1 ? "สมัครสมาชิก" : "ข้อมูลส่วนตัว"}
            </h1>
            <p className="text-gray-500 font-medium text-sm">
              {step === 1 ? "เริ่มต้นเส้นทางแบดมินตันของคุณ" : "เราอยากรู้จักคุณให้มากขึ้น"}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center gap-2 px-10">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                s <= step ? "bg-primary shadow-[0_0_10px_rgba(255,149,0,0.3)]" : "bg-gray-200"
              )}
            />
          ))}
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 animate-shake">
              <ShieldCheck size={18} className="shrink-0" />
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email</Label>
                  <div className="relative group/field">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-primary transition-colors">
                      <Mail size={18} />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@email.com"
                      className="h-12 pl-11 rounded-2xl border-gray-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Password</Label>
                  <div className="relative group/field">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                      <Lock size={18} />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-12 pl-11 pr-12 rounded-2xl border-gray-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Confirm Password</Label>
                  <div className="relative group/field">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-primary transition-colors">
                      <ShieldCheck size={18} />
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 pl-11 rounded-2xl border-gray-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Display Name</Label>
                  <div className="relative group/field">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-primary transition-colors">
                      <User size={18} />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      placeholder="ชื่อที่ใช้ในแอป"
                      className="h-12 pl-11 rounded-2xl border-gray-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Phone Number</Label>
                  <div className="relative group/field">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                      <Phone size={18} />
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08X-XXX-XXXX"
                      className="h-12 pl-11 rounded-2xl border-gray-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังสมัคร...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{step === 2 ? "ยืนยันการสมัคร" : "ขั้นตอนถัดไป"}</span>
                    <ArrowRight size={18} />
                  </div>
                )}
              </Button>

              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="w-full h-12 rounded-2xl border border-gray-100 bg-white font-bold text-gray-400 hover:text-gray-600 transition-all text-sm"
                >
                  ย้อนกลับ
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col items-center space-y-6">
          <p className="text-gray-500 font-medium text-sm">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
              เข้าสู่ระบบเลย
            </Link>
          </p>

          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-300">
            <span className="cursor-pointer hover:text-primary transition-colors">Privacy</span>
            <div className="w-1 h-1 bg-gray-200 rounded-full" />
            <span className="cursor-pointer hover:text-primary transition-colors">Terms</span>
            <div className="w-1 h-1 bg-gray-200 rounded-full" />
            <span className="cursor-pointer hover:text-primary transition-colors">Safety</span>
          </div>
        </div>
      </div>
    </div>
  );
}
