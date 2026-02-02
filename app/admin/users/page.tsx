import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  Shield,
  ShieldCheck,
  MoreVertical,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";

async function getUsers(searchQuery?: string) {
  const supabase = await createClient();

  // Return empty if Supabase not configured
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (searchQuery) {
      query = query.or(
        `display_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const users = await getUsers(params.q);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการผู้ใช้</h1>
          <p className="text-muted-foreground">
            จัดการสมาชิกทั้งหมดในระบบ ({users.length} คน)
          </p>
        </div>
        <Button className="puffy-button text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          เพิ่มผู้ใช้
        </Button>
      </div>

      {/* Search */}
      <Card className="puffy-card">
        <CardContent className="p-4">
          <form className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือเบอร์โทร..."
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

      {/* Users List */}
      <Card className="puffy-card">
        <CardHeader>
          <CardTitle className="text-base">รายชื่อผู้ใช้</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors border border-border"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {user.display_name || "ไม่ระบุชื่อ"}
                      </p>
                      {user.is_admin && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {user.is_verified && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700"
                        >
                          ยืนยันแล้ว
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      {user.email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                      )}
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>
                        Level:{" "}
                        <span className="font-medium text-foreground">
                          {user.skill_level || "beginner"}
                        </span>
                      </span>
                      <span>
                        แต้ม:{" "}
                        <span className="font-medium text-foreground">
                          {user.points || 0}
                        </span>
                      </span>
                      <span>
                        เกม:{" "}
                        <span className="font-medium text-foreground">
                          {user.total_games || 0}
                        </span>
                      </span>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {params.q ? "ไม่พบผู้ใช้ที่ค้นหา" : "ยังไม่มีผู้ใช้ในระบบ"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
