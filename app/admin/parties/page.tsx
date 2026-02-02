import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Calendar,
  Clock,
  Users,
  MapPin,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";

async function getParties(searchQuery?: string, status?: string) {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from("parties")
      .select(
        `
        *,
        host:profiles!parties_host_id_fkey(id, display_name, avatar_url),
        court:courts(id, name)
      `
      )
      .order("date", { ascending: false });

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Error fetching parties:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching parties:", error);
    return [];
  }
}

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  full: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  open: "เปิดรับ",
  full: "เต็มแล้ว",
  in_progress: "กำลังเล่น",
  completed: "จบแล้ว",
  cancelled: "ยกเลิก",
};

export default async function AdminPartiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const parties = await getParties(params.q, params.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการก๊วน</h1>
          <p className="text-muted-foreground">
            จัดการก๊วนแบดมินตันทั้งหมด ({parties.length} ก๊วน)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="puffy-card">
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="ค้นหาก๊วน..."
                defaultValue={params.q}
                className="pl-9"
              />
            </div>
            <select
              name="status"
              defaultValue={params.status || "all"}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="open">เปิดรับ</option>
              <option value="full">เต็มแล้ว</option>
              <option value="in_progress">กำลังเล่น</option>
              <option value="completed">จบแล้ว</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
            <Button type="submit" variant="secondary">
              กรอง
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Parties List */}
      <Card className="puffy-card">
        <CardHeader>
          <CardTitle className="text-base">รายการก๊วน</CardTitle>
        </CardHeader>
        <CardContent>
          {parties.length > 0 ? (
            <div className="space-y-3">
              {parties.map((party: any) => (
                <Link
                  key={party.id}
                  href={`/admin/parties/${party.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors border border-border"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={party.host?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {party.host?.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {party.title}
                      </p>
                      <Badge className={statusColors[party.status] || ""}>
                        {statusLabels[party.status] || party.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(party.date).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {party.start_time?.slice(0, 5)} -{" "}
                        {party.end_time?.slice(0, 5)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {party.current_players}/{party.max_players} คน
                      </span>
                      {party.court && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {party.court.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      โดย {party.host?.display_name || "Unknown"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-primary">
                      {party.price_per_person
                        ? `${party.price_per_person} บาท`
                        : "ฟรี"}
                    </p>
                    <Button variant="ghost" size="icon" className="mt-1">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {params.q || params.status
                  ? "ไม่พบก๊วนที่ค้นหา"
                  : "ยังไม่มีก๊วนในระบบ"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
