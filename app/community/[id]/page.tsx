"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";

const mockPost = {
  id: "1",
  author: {
    name: "Wasatorn Pakdee",
    avatar: "/images/avatars/avatar-1.jpg",
    badge: "นักเขียนมือใหม่",
  },
  content: "คอร์ทดี พื้นไม้ ตีสนุก แนะนำ",
  hashtags: ["#รีวิวคอร์ทแบด"],
  court: {
    id: "1",
    name: "สนามแบตมินตันเอส.ที.",
    address: "45 ถนน วุฒากาศ แขวงตลาดพลู เขตธนบุรี",
    rating: 4.0,
    hours: "0 - 24 น.",
    price: 120,
    image: "/images/courts/court-1.jpg",
  },
  timestamp: "1 สัปดาห์ที่แล้ว",
  likes: 0,
  views: 7,
  comments: 0,
  images: ["/images/posts/post-3.jpg"],
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(mockPost.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full"
              >
                <Icons.chevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">
                รีวิวคอร์ทแบดมินตัน S.T.
              </h1>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Icons.share className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Author */}
          <div className="flex items-center gap-3">
            <Image
              src={mockPost.author.avatar || "/placeholder.svg"}
              alt={mockPost.author.name}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {mockPost.author.name}
                </span>
                <Badge className="bg-[#31A24C] text-white text-xs px-2 py-0.5">
                  {mockPost.author.badge}
                </Badge>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Post Content */}
          <p className="text-foreground">{mockPost.content}</p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2">
            {mockPost.hashtags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-[#FF9500] text-[#FF9500]"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Court Card */}
          <GlassCard className="p-3">
            <h3 className="font-medium text-foreground mb-3">
              คอร์ทแบดที่กล่าวถึง
            </h3>
            <Link href={`/courts/${mockPost.court.id}`}>
              <div className="flex gap-3">
                <Image
                  src={mockPost.court.image || "/placeholder.svg"}
                  alt={mockPost.court.name}
                  width={100}
                  height={80}
                  className="rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {mockPost.court.name}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {mockPost.court.address}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icons.star className="h-3 w-3 text-[#F7B928]" />
                      {mockPost.court.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.clock className="h-3 w-3" />
                      {mockPost.court.hours}
                    </span>
                  </div>
                  <Badge className="mt-2 bg-[#F5793A] text-white text-xs">
                    {mockPost.court.price}.-/ชม
                  </Badge>
                </div>
              </div>
            </Link>
          </GlassCard>

          {/* Timestamp */}
          <p className="text-sm text-muted-foreground">{mockPost.timestamp}</p>

          {/* Comments Section */}
          <div className="h-px bg-border" />

          <div>
            <h3 className="font-medium text-foreground mb-4">
              ความคิดเห็น ({mockPost.comments})
            </h3>
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Icons.message className="h-12 w-12 mb-2 opacity-30" />
              <p className="text-sm">ยังไม่มีความคิดเห็น</p>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
          <div className="flex items-center gap-2 mb-3">
            <Input
              placeholder="แสดงความคิดเห็น..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 bg-secondary border-0 rounded-full"
            />
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10"
              >
                <Icons.shuttlecock className="h-5 w-5 text-[#FF9500]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10"
              >
                <Icons.heart className="h-5 w-5 text-[#31A24C] fill-[#31A24C]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10"
              >
                <Icons.thumbsUp className="h-5 w-5 text-[#F7B928]" />
              </Button>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 tap-highlight"
            >
              <Icons.heart
                className={`h-4 w-4 ${liked ? "text-[#FA383E] fill-[#FA383E]" : ""}`}
              />
              {likes}
            </button>
            <span className="flex items-center gap-1">
              <Icons.eye className="h-4 w-4" />
              {mockPost.views}
            </span>
            <span className="flex items-center gap-1">
              <Icons.message className="h-4 w-4" />
              {mockPost.comments}
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
