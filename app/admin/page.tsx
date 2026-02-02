import { createClient } from "@/lib/supabase/server";
import {
  Users,
  MapPin,
  Calendar,
  Trophy,
  TrendingUp,
  CreditCard,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

async function getStats() {
  const supabase = await createClient();

  // If Supabase is not configured, return empty stats
  if (!supabase) {
    return {
      usersCount: 0,
      courtsCount: 0,
      partiesCount: 0,
      tournamentsCount: 0,
      recentParties: [],
      pendingPaymentsCount: 0,
      isConfigured: false,
    };
  }

  try {
    const [
      usersResult,
      courtsResult,
      partiesResult,
      tournamentsResult,
      recentPartiesResult,
      pendingPaymentsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).then(r => r).catch(() => ({ count: 0 })),
      supabase.from("courts").select("*", { count: "exact", head: true }).then(r => r).catch(() => ({ count: 0 })),
      supabase.from("parties").select("*", { count: "exact", head: true }).then(r => r).catch(() => ({ count: 0 })),
      supabase.from("tournaments").select("*", { count: "exact", head: true }).then(r => r).catch(() => ({ count: 0 })),
      supabase
        .from("parties")
        .select("*, host:profiles!parties_host_id_fkey(display_name)")
        .order("created_at", { ascending: false })
        .limit(5)
        .then(r => r)
        .catch(() => ({ data: [] })),
      supabase
        .from("payment_slips")
        .select("*")
        .eq("status", "pending")
        .limit(10)
        .then(r => r)
        .catch(() => ({ data: [] })),
    ]);

    return {
      usersCount: usersResult.count || 0,
      courtsCount: courtsResult.count || 0,
      partiesCount: partiesResult.count || 0,
      tournamentsCount: tournamentsResult.count || 0,
      recentParties: recentPartiesResult.data || [],
      pendingPaymentsCount: pendingPaymentsResult.data?.length || 0,
      isConfigured: true,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      usersCount: 0,
      courtsCount: 0,
      partiesCount: 0,
      tournamentsCount: 0,
      recentParties: [],
      pendingPaymentsCount: 0,
      isConfigured: true,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  // Show setup message if not configured
  if (!stats.isConfigured) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">ภาพรวมระบบ Topminton</p>
        </div>
        <Card className="puffy-card border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              ยังไม่ได้ตั้งค่า Supabase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-600">
              กรุณาเชื่อมต่อ Supabase integration และรัน migration script เพื่อเริ่มใช้งานระบบ
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: "ผู้ใช้ทั้งหมด",
      value: stats.usersCount,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      href: "/admin/users",
    },
    {
      title: "สนามแบดมินตัน",
      value: stats.courtsCount,
      icon: MapPin,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      href: "/admin/courts",
    },
    {
      title: "ก๊วนทั้งหมด",
      value: stats.partiesCount,
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      href: "/admin/parties",
    },
    {
      title: "ทัวร์นาเมนต์",
      value: stats.tournamentsCount,
      icon: Trophy,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      href: "/admin/tournaments",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          ภาพรวมระบบ Topminton
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="puffy-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Payments Alert */}
        {stats.pendingPaymentsCount > 0 && (
          <Card className="puffy-card border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-5 w-5" />
                รอตรวจสอบการชำระเงิน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-600 mb-3">
                มี {stats.pendingPaymentsCount} รายการรอการยืนยัน
              </p>
              <Link
                href="/admin/payments"
                className="inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:underline"
              >
                ตรวจสอบเลย
                <TrendingUp className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="puffy-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">การดำเนินการด่วน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="p-2 rounded-lg bg-blue-500/10">
                <UserCheck className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">จัดการผู้ใช้</p>
                <p className="text-xs text-muted-foreground">
                  ดูและแก้ไขข้อมูลสมาชิก
                </p>
              </div>
            </Link>
            <Link
              href="/admin/courts"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="p-2 rounded-lg bg-green-500/10">
                <MapPin className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">เพิ่มสนามใหม่</p>
                <p className="text-xs text-muted-foreground">
                  เพิ่มสนามแบดมินตันในระบบ
                </p>
              </div>
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="p-2 rounded-lg bg-orange-500/10">
                <CreditCard className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium">ตรวจสอบสลิป</p>
                <p className="text-xs text-muted-foreground">
                  ยืนยันการชำระเงิน
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Parties */}
      <Card className="puffy-card">
        <CardHeader>
          <CardTitle className="text-base">ก๊วนล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentParties.length > 0 ? (
            <div className="space-y-3">
              {stats.recentParties.map((party: any) => (
                <Link
                  key={party.id}
                  href={`/admin/parties/${party.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{party.title}</p>
                    <p className="text-xs text-muted-foreground">
                      โดย {party.host?.display_name || "Unknown"} -{" "}
                      {new Date(party.date).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      party.status === "open"
                        ? "bg-green-100 text-green-700"
                        : party.status === "completed"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {party.status === "open"
                      ? "เปิดรับ"
                      : party.status === "completed"
                        ? "จบแล้ว"
                        : party.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              ยังไม่มีก๊วน
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
