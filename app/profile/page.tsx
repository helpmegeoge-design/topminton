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
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";

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
  const [loadingStatus, setLoadingStatus] = useState("กำลังเชื่อมต่อระบบ...");

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setErrorV(false);
      setLoadingStatus("กำลังเริ่มต้น...");

      try {
        // Global Timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 30000)
        );

        const executionPromise = (async () => {
          const supabase = createClient();
          if (!supabase) throw new Error("Supabase client init failed");

          setLoadingStatus("กำลังตรวจสอบชื่อผู้ใช้...");
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError) throw authError;
          if (!user) {
            router.push("/login");
            return;
          }

          setLoadingStatus("กำลังดึงข้อมูลโปรไฟล์...");
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            // Ignore 'PGRST116' (no rows found) as we handle it by showing the repair UI
            if (error.code !== 'PGRST116') {
              console.error("Profile fetch error:", JSON.stringify(error, null, 2));
            }
            return null;
          }
          return data;
        })();

        // Race between execution and timeout
        const result = await Promise.race([executionPromise, timeoutPromise]);

        if (mounted) {
          if (result === null || result === undefined) {
            // Profile missing or fetch error
            setErrorV(true);
          } else {
            setProfile(result);
          }
        }

      } catch (err: any) {
        if (mounted) {
          console.error("Profile page critical error:", err);
          setLoadingStatus(`เกิดข้อผิดพลาด: ${err.message}`);
          setErrorV(true); // Force show repair UI
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { mounted = false };
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <LoadingShuttlecock className="mb-4" />
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
      <div className="min-h-screen bg-[#F5F5F7]"> {/* Cleaner light gray background like iOS */}

        {/* Modern Header */}
        <div className="relative h-56 bg-gradient-to-br from-[#FF9500] to-[#FF5E00] overflow-hidden">
          {/* Abstract blobs for depth */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none mix-blend-overlay" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

          <div className="absolute top-4 right-4">
            <Link href="/profile/edit">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 hover:text-white rounded-full">
                <Icons.edit className="w-4 h-4 mr-2" />
                แก้ไข
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-4 -mt-20 relative z-10 space-y-6 pb-24">

          {/* Main Profile Card */}
          <GlassCard className="p-0 overflow-visible shadow-xl border-white/40 bg-white/95 backdrop-blur-3xl">
            <div className="relative flex flex-col items-center pt-16 pb-6 px-6">
              {/* Avatar (Floating halfway out) */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full p-1 bg-white ring-4 ring-white/30 shadow-2xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-muted relative">
                      <Image
                        src={profile.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"}
                        alt={profile.display_name || "User"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <LevelBadge
                    level={profile.skill_level || 'beginner'}
                    size="md"
                    className="absolute bottom-1 right-1 shadow-lg scale-110 border-2 border-white text-sm py-1 px-3"
                  />
                </div>
              </div>

              {/* Info */}
              <h1 className="text-2xl font-bold text-foreground mt-2 text-center">
                {profile.display_name || `${profile.first_name} ${profile.last_name}`}
              </h1>
              <p className="text-sm font-mono text-muted-foreground/80 mt-1 mb-3">
                #{profile.short_id || "---"}
              </p>
              <div className="px-3 py-1 bg-muted/50 rounded-full text-xs text-muted-foreground mb-4 max-w-[240px] truncate">
                "{profile.bio || "ยังไม่มีข้อมูลแนะนำตัว"}"
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-0 w-full mt-2 divide-x divide-border/60">
                <div className="flex flex-col items-center justify-center px-2">
                  <span className="text-lg font-bold text-foreground">{profile.points || 0}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    TB Points <Icons.coins className="w-3 h-3 text-yellow-500" />
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center px-2">
                  <span className="text-lg font-bold text-foreground">{profile.total_games || 0}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">แมตช์</span>
                </div>
                <div className="flex flex-col items-center justify-center px-2">
                  <span className="text-lg font-bold text-foreground">-</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">อันดับ</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* TB Points Banner */}
          <Link href="/shop" className="block transform transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 p-5 shadow-lg shadow-orange-500/20">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                    <Icons.store className="w-5 h-5" />
                    ร้านค้า
                  </h3>
                  <p className="text-white/90 text-xs font-medium">
                    แลกกรอบโปรไฟล์และไอเท็มพิเศษ
                  </p>
                </div>
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <Icons.chevronRight className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            </div>
          </Link>

          {/* Menu Group 1: Activites */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 ml-1">เกี่ยวกับฉัน</h3>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm border border-white/50">
              {[
                { icon: Icons.users, label: "จัดการก๊วนของฉัน", href: "/profile/parties", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Icons.star, label: "สถิติการเล่น", href: "/profile/stats", badge: "ละเอียด", color: "text-purple-500", bg: "bg-purple-500/10" },
                { icon: Icons.trophy, label: "ใบรับรองระดับมือ", href: "/assessment/certificates", color: "text-yellow-500", bg: "bg-yellow-500/10" },
                { icon: Icons.shuttlecock, label: "อุปกรณ์ของฉัน", href: "/profile/gear", color: "text-gray-500", bg: "bg-gray-500/10" },
              ].map((item, index, arr) => (
                <Link key={item.label} href={item.href} className={`flex items-center gap-3 p-4 hover:bg-black/5 transition-colors ${index !== arr.length - 1 ? 'border-b border-border/50' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="flex-1 font-medium text-sm text-foreground">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                  <Icons.chevronRight className="h-4 w-4 text-muted-foreground/50" />
                </Link>
              ))}
            </div>
          </div>

          {/* Menu Group 2: System */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 ml-1">ทั่วไป</h3>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm border border-white/50">
              {[
                { icon: Icons.heart, label: "รายการโปรด", href: "/favorites", color: "text-pink-500", bg: "bg-pink-500/10" },
                { icon: Icons.ranking, label: "อันดับของฉัน", href: "/ranking", color: "text-orange-500", bg: "bg-orange-500/10" },
                { icon: Icons.bell, label: "การแจ้งเตือน", href: "/notifications", color: "text-red-500", bg: "bg-red-500/10" },
                { icon: Icons.settings, label: "ตั้งค่าเพิ่มเติม", href: "/more", color: "text-gray-600", bg: "bg-gray-600/10" },
              ].map((item, index, arr) => (
                <Link key={item.label} href={item.href} className={`flex items-center gap-3 p-4 hover:bg-black/5 transition-colors ${index !== arr.length - 1 ? 'border-b border-border/50' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="flex-1 font-medium text-sm text-foreground">{item.label}</span>
                  <Icons.chevronRight className="h-4 w-4 text-muted-foreground/50" />
                </Link>
              ))}

              {/* Logout Separate but inside List */}
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 p-4 hover:bg-red-50 transition-colors border-t border-border/50 group"
              >
                <div className="w-9 h-9 rounded-xl bg-red-100/80 flex items-center justify-center group-hover:bg-red-200 transaction-colors">
                  <Icons.logout className="h-5 w-5 text-red-600" />
                </div>
                <span className="flex-1 font-medium text-sm text-red-600">ออกจากระบบ</span>
              </button>
            </div>
          </div>

          <div className="text-center pb-8 pt-4">
            <p className="text-[10px] text-muted-foreground/60">Topminton v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</p>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
