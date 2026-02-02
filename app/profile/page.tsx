"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/ui/level-badge";
import { Icons } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const menuItems = [
  { icon: Icons.edit, label: "แก้ไขโปรไฟล์", href: "/profile/edit" },
  { icon: Icons.users, label: "จัดการก๊วนของฉัน", href: "/profile/parties" },
  { icon: Icons.star, label: "สถิติของฉัน", href: "/profile/stats", badge: "ใหม่" },
  { icon: Icons.shuttlecock, label: "อุปกรณ์ของฉัน", href: "/profile/gear" },
  { icon: Icons.trophy, label: "ใบรับรองระดับมือ", href: "/assessment/certificates" },
  { icon: Icons.heart, label: "รายการโปรด", href: "/favorites" },
  { icon: Icons.ranking, label: "อันดับของฉัน", href: "/ranking" },
  { icon: Icons.bell, label: "การแจ้งเตือน", href: "/notifications" },
  { icon: Icons.settings, label: "ตั้งค่า", href: "/more" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorV, setErrorV] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorV(false);
      const supabase = createClient();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Profile Details
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.error("Fetch profile error:", error);
        setErrorV(true);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </AppShell>
    );
  }

  const handleRepairProfile = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Generate random Short ID
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const shortId =
      chars.charAt(Math.floor(Math.random() * chars.length)) +
      chars.charAt(Math.floor(Math.random() * chars.length)) +
      nums.charAt(Math.floor(Math.random() * nums.length)) +
      nums.charAt(Math.floor(Math.random() * nums.length)) +
      nums.charAt(Math.floor(Math.random() * nums.length));

    // Create default profile
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      display_name: user.email?.split('@')[0] || "User",
      first_name: "Member",
      short_id: shortId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) {
      alert("ไม่สามารถสร้างโปรไฟล์ได้: " + error.message);
      setLoading(false);
    } else {
      alert("สร้างข้อมูลโปรไฟล์สำเร็จ!");
      window.location.reload();
    }
  };

  // Fallback UI if profile not found
  if (!profile || errorV) {
    return (
      <AppShell>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-6 text-destructive bg-destructive/10 p-6 rounded-2xl max-w-xs">
            <p className="font-bold text-lg mb-2">ข้อมูลโปรไฟล์ไม่สมบูรณ์</p>
            <p className="text-sm opacity-90">บัญชีของคุณถูกสร้างแล้ว แต่ยังไม่มีข้อมูลส่วนตัว</p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={handleRepairProfile} size="lg" className="w-full bg-primary text-white shadow-lg">
              สร้างข้อมูลโปรไฟล์ (แก้ไขอัตโนมัติ)
            </Button>

            <Button onClick={handleLogout} variant="ghost" className="w-full text-muted-foreground">
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        {/* Header with gradient */}
        <div className="relative h-32 bg-gradient-to-br from-[#FF9500] to-[#F5A623]">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Card */}
        <div className="px-4 -mt-16 relative z-10">
          <GlassCard className="p-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/20`}
                >
                  <Image
                    src={profile.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"}
                    alt={profile.display_name || "User"}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <LevelBadge
                  level={profile.skill_level || 'beginner'}
                  size="sm"
                  className="absolute -bottom-1 -right-1"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {profile.display_name || `${profile.first_name} ${profile.last_name}`}
                  <span className="ml-2 text-sm text-muted-foreground font-normal">#{profile.short_id || "---"}</span>
                </h1>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {profile.bio || "ยังไม่มีข้อมูลแนะนำตัว"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {/* Placeholder for frequency until we have that data */}
                    เล่นสม่ำเสมอ
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-around mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#FF9500]">
                  -
                </p>
                <p className="text-xs text-muted-foreground">อันดับ</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {profile.total_games || 0}
                </p>
                <p className="text-xs text-muted-foreground">เกมที่เล่น</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Icons.coins className="h-5 w-5 text-[#F7B928]" />
                  <p className="text-2xl font-bold text-foreground">
                    {profile.points || 0}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">TB Points</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <Link href="/profile/edit" className="flex-1">
                <Button className="w-full rounded-xl bg-[#FF9500] hover:bg-[#FF9500]/90 text-white">
                  แก้ไขโปรไฟล์
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Premium Banner */}
        <div className="px-4 mt-4">
          <Link href="/shop">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FF9500] p-4">
              <div className="relative z-10">
                <h3 className="text-white font-semibold mb-1">
                  ร้านค้า TB Points
                </h3>
                <p className="text-white/80 text-sm">
                  แลกกรอบโปรไฟล์สุดเท่ด้วย TB Points
                </p>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Icons.chevronRight className="h-6 w-6 text-white/60" />
              </div>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <div className="px-4 mt-4 space-y-2 pb-24">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <GlassCard className="p-4 flex items-center gap-3 tap-highlight">
                <div className="w-10 h-10 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-[#FF9500]" />
                </div>
                <span className="flex-1 text-foreground">{item.label}</span>
                {item.badge && (
                  <Badge className="bg-[#FA383E] text-white text-[10px] px-1.5 py-0.5">
                    {item.badge}
                  </Badge>
                )}
                <Icons.chevronRight className="h-5 w-5 text-muted-foreground" />
              </GlassCard>
            </Link>
          ))}

          {/* Logout */}
          <button onClick={handleLogout} className="w-full text-left">
            <GlassCard className="p-4 flex items-center gap-3 tap-highlight">
              <div className="w-10 h-10 rounded-full bg-[#FA383E]/10 flex items-center justify-center">
                <Icons.logout className="h-5 w-5 text-[#FA383E]" />
              </div>
              <span className="flex-1 text-[#FA383E]">ออกจากระบบ</span>
            </GlassCard>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
