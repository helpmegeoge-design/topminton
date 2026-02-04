"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { ShuttlecockIcon, Icons } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const supabase = createClient();
    if (!supabase) {
      setErrorMsg("ระบบเชื่อมต่อขัดข้อง กรุณาลองใหม่");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get('next') || "/";
      router.push(next);
      router.refresh();

    } catch (err: any) {
      console.error("Login Check:", err);
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    const supabase = createClient();
    if (!supabase) return;

    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden flex flex-col justify-center items-center px-4 py-8">
      {/* Moving Purple Fire/Plasma Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/15 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2.5s' }} />
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.2s' }} />

      <div className="relative z-10 w-full max-w-[420px] space-y-8 animate-in fade-in duration-700">
        {/* Header/Logo Section (Original Redesign Style) */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-primary rounded-[24px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-20 h-20 rounded-[22px] bg-white flex items-center justify-center shadow-2xl shadow-primary/20 transform transition-all duration-500 hover:rotate-[10deg]">
              <ShuttlecockIcon size={44} className="text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600">
              ยินดีต้อนรับกลับมา
            </h1>
            <p className="text-gray-500 font-medium tracking-wide text-sm">
              เข้าสู่ระบบเพื่อเริ่มแมตช์ของคุณใน <span className="text-primary font-bold">Topminton</span>
            </p>
          </div>
        </div>

        {/* Login Card (Original Redesign Style) */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Icons.info size={18} className="shrink-0" />
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                  Email Address
                </Label>
                <div className="relative group/field">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-primary transition-colors">
                    <Icons.users size={18} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@email.com"
                    className="h-12 pl-11 rounded-2xl border-gray-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
                <div className="relative group/field">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-primary transition-colors">
                    <Icons.settings size={18} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pl-11 pr-12 rounded-2xl border-gray-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Icons.eyeOff size={18} /> : <Icons.eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </div>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </form>

          {/* Social Logins */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              <span className="bg-white/80 backdrop-blur-md px-4 py-1 rounded-full border border-gray-50 shadow-sm">
                เข้าสู่ระบบด้วย
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { provider: 'google', icon: 'google', color: 'hover:border-red-100 hover:bg-red-50' },
              { provider: 'facebook', icon: 'facebook', color: 'hover:border-blue-100 hover:bg-blue-50' },
              { provider: 'line', icon: 'line', color: 'hover:border-green-100 hover:bg-green-50' }
            ].map((social) => (
              <Button
                key={social.provider}
                type="button"
                variant="outline"
                className={`h-12 rounded-2xl bg-white border-gray-100 shadow-sm transition-all duration-300 ${social.color}`}
                onClick={() => social.provider !== 'line' ? handleSocialLogin(social.provider as 'google' | 'facebook') : null}
              >
                {social.icon === 'google' && (
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  </svg>
                )}
                {social.icon === 'facebook' && (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1877F2]" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                {social.icon === 'line' && (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#00B900]" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col items-center space-y-6">
          <p className="text-gray-500 font-medium text-sm">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
              สร้างบัญชีใหม่
            </Link>
          </p>

          <div className="w-12 h-1 bg-gray-200 rounded-full" />

          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <Link href="/support" className="hover:text-gray-600 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
