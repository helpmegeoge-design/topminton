"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/community/post-card";
import { Icons } from "@/components/icons";
import Link from "next/link";

const filters = [
  { id: "all", label: "ทั้งหมด" },
  { id: "review", label: "รีวิว" },
  { id: "recommendation", label: "ป้ายยา" },
];

const mockPosts = [
  {
    id: "1",
    image: "/images/posts/post-3.jpg",
    category: "review" as const,
    title: "สนาม S.T. บางนา พื้นไม้ดีมาก ตีสนุกแนะนำ",
    author: { name: "สมชาย", avatar: "/images/avatars/avatar-1.jpg" },
    likes: 24,
    views: 156,
    comments: 8,
  },
  {
    id: "2",
    image: "/images/posts/post-2.jpg",
    category: "recommendation" as const,
    title: "ไม้ Yonex Astrox 99 Pro ตีดีมาก",
    author: { name: "วิชัย", avatar: "/images/avatars/avatar-3.jpg" },
    likes: 45,
    views: 320,
    comments: 12,
  },
  {
    id: "3",
    image: "/images/posts/post-1.jpg",
    category: "review" as const,
    title: "คอร์ทแบดมินตันบางนา สะอาดมาก",
    author: { name: "สุภาพ", avatar: "/images/avatars/avatar-2.jpg" },
    likes: 18,
    views: 89,
    comments: 3,
  },
  {
    id: "4",
    image: "/images/posts/post-4.jpg",
    category: "recommendation" as const,
    title: "รองเท้า Victor แนะนำสำหรับมือใหม่",
    author: { name: "ปรีชา", avatar: "/images/avatars/avatar-4.jpg" },
    likes: 32,
    views: 245,
    comments: 15,
  },
];

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = mockPosts.filter((post) => {
    if (activeFilter !== "all" && post.category !== activeFilter) return false;
    if (
      searchQuery &&
      !post.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">ชุมชน</h1>
            <Link href="/community/create">
              <Button
                size="icon"
                className="rounded-full bg-[#FF9500] hover:bg-[#FF9500]/90"
              >
                <Icons.plus className="h-5 w-5 text-white" />
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาโพสต์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary border-0 rounded-xl"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-full whitespace-nowrap ${
                  activeFilter === filter.id
                    ? "bg-[#FF9500] text-white hover:bg-[#FF9500]/90"
                    : "border-border hover:bg-accent"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="p-4 columns-2 gap-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Icons.post className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">ไม่พบโพสต์</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
