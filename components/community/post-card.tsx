"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

interface PostCardProps {
  id: string;
  image: string;
  category: "review" | "recommendation" | "general";
  title?: string;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  views: number;
  comments: number;
}

const categoryLabels = {
  review: "รีวิว",
  recommendation: "ป้ายยา",
  general: "ทั่วไป",
};

const categoryColors = {
  review: "bg-[#1877F2] text-white",
  recommendation: "bg-[#31A24C] text-white",
  general: "bg-[#65676B] text-white",
};

export function PostCard({
  id,
  image,
  category,
  title,
  author,
  likes,
  views,
  comments,
}: PostCardProps) {
  return (
    <Link href={`/community/${id}`}>
      <GlassCard className="overflow-hidden tap-highlight break-inside-avoid mb-4">
        <div className="relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={title || "Post image"}
            width={300}
            height={200}
            className="w-full h-auto object-cover"
          />
          <Badge
            className={`absolute bottom-2 left-2 ${categoryColors[category]} text-xs px-2 py-0.5`}
          >
            {categoryLabels[category]}
          </Badge>
        </div>

        {title && (
          <div className="p-3">
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {title}
            </p>
          </div>
        )}

        <div className="px-3 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={author.avatar || "/placeholder.svg"}
              alt={author.name}
              width={20}
              height={20}
              className="rounded-full"
            />
            <span className="text-xs text-muted-foreground">{author.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{likes}</span>
            <span>{views}</span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
