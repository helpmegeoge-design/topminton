import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MapPin,
  Star,
  Phone,
  MoreVertical,
  CheckCircle,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

async function getCourts(searchQuery?: string) {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from("courts")
      .select("*")
      .order("created_at", { ascending: false });

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Error fetching courts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching courts:", error);
    return [];
  }
}

export default async function AdminCourtsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const courts = await getCourts(params.q);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการสนาม</h1>
          <p className="text-muted-foreground">
            จัดการสนามแบดมินตันทั้งหมด ({courts.length} สนาม)
          </p>
        </div>
        <Link href="/admin/courts/create">
          <Button className="puffy-button text-white">
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มสนาม
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="puffy-card">
        <CardContent className="p-4">
          <form className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="ค้นหาสนาม..."
                defaultValue={params.q}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              ค้นหา
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Courts Grid */}
      {courts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((court) => (
            <Link key={court.id} href={`/admin/courts/${court.id}`}>
              <Card className="puffy-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="relative aspect-video bg-muted">
                  {court.images?.[0] ? (
                    <Image
                      src={court.images[0] || "/placeholder.svg"}
                      alt={court.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {court.is_verified && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        ยืนยันแล้ว
                      </Badge>
                    )}
                    {!court.is_active && (
                      <Badge variant="destructive">ปิดให้บริการ</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground truncate">
                    {court.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {court.district}, {court.province}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">
                        {court.rating || "0.0"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({court.review_count || 0} รีวิว)
                      </span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {court.price_per_hour
                        ? `${court.price_per_hour} บาท/ชม.`
                        : "ไม่ระบุราคา"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {court.court_count || 1} คอร์ท
                    </span>
                    {court.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {court.phone}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="puffy-card">
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {params.q ? "ไม่พบสนามที่ค้นหา" : "ยังไม่มีสนามในระบบ"}
            </p>
            <Link href="/admin/courts/create">
              <Button className="mt-4 puffy-button text-white">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มสนามแรก
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
