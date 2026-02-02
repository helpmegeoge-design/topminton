"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";

type Review = {
  id: string;
  author: {
    name: string;
    avatar: string;
    level: string;
  };
  rating: number;
  content: string;
  date: string;
  likes: number;
  images?: string[];
};

const mockReviews: Review[] = [
  {
    id: "1",
    author: { name: "สมชาย ใจดี", avatar: "/images/avatars/avatar-1.jpg", level: "S" },
    rating: 5,
    content: "สนามดีมาก พื้นไม้คุณภาพ แสงสว่างเพียงพอ มีแอร์เย็นสบาย ที่จอดรถกว้าง แนะนำเลยครับ",
    date: "2 วันที่แล้ว",
    likes: 12,
    images: ["/images/courts/court-1.jpg"],
  },
  {
    id: "2",
    author: { name: "นัท สุวรรณ", avatar: "/images/avatars/avatar-2.jpg", level: "N" },
    rating: 4,
    content: "สนามโอเค ราคาไม่แพง แต่ห้องน้ำควรปรับปรุงนิดนึง",
    date: "1 สัปดาห์ที่แล้ว",
    likes: 5,
  },
  {
    id: "3",
    author: { name: "กิม จิตรา", avatar: "/images/avatars/avatar-3.jpg", level: "BG" },
    rating: 5,
    content: "เจ้าของใจดี บริการดีเยี่ยม มีน้ำดื่มฟรี",
    date: "2 สัปดาห์ที่แล้ว",
    likes: 8,
  },
];

const ratingStats = {
  average: 4.5,
  total: 156,
  breakdown: [
    { stars: 5, count: 98 },
    { stars: 4, count: 42 },
    { stars: 3, count: 12 },
    { stars: 2, count: 3 },
    { stars: 1, count: 1 },
  ],
};

export default function CourtReviewsPage() {
  const params = useParams();
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  return (
    <AppShell title="รีวิวทั้งหมด" showBack backHref={`/courts/${params.id}`}>
      <div className="p-4 pb-24 space-y-6">
        {/* Rating Summary */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">{ratingStats.average}</p>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icons.star
                    key={star}
                    size={14}
                    className={star <= Math.floor(ratingStats.average) ? "text-yellow-500 fill-yellow-500" : "text-muted"}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{ratingStats.total} รีวิว</p>
            </div>
            <div className="flex-1 space-y-1">
              {ratingStats.breakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-3">{item.stars}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${(item.count / ratingStats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Write Review Button */}
        <Button 
          className="w-full" 
          variant={showWriteReview ? "outline" : "default"}
          onClick={() => setShowWriteReview(!showWriteReview)}
        >
          <Icons.edit size={16} className="mr-2" />
          {showWriteReview ? "ยกเลิก" : "เขียนรีวิว"}
        </Button>

        {/* Write Review Form */}
        {showWriteReview && (
          <GlassCard className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">ให้คะแนน</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Icons.star
                      size={28}
                      className={star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">เขียนรีวิว</p>
              <Textarea
                placeholder="แชร์ประสบการณ์ของคุณ..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">เพิ่มรูปภาพ (ไม่บังคับ)</p>
              <button
                type="button"
                className="w-full h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Icons.image size={20} />
                <span className="text-sm">เพิ่มรูปภาพ</span>
              </button>
            </div>

            <Button className="w-full" disabled={rating === 0 || !content.trim()}>
              ส่งรีวิว
            </Button>
          </GlassCard>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">รีวิวทั้งหมด</h3>
          {mockReviews.map((review) => (
            <GlassCard key={review.id} className="p-4">
              <div className="flex items-start gap-3">
                <img
                  src={review.author.avatar || "/images/avatars/default-avatar.jpg"}
                  alt={review.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">{review.author.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary">
                        {review.author.level}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icons.star
                        key={star}
                        size={12}
                        className={star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-foreground mt-2">{review.content}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img || "/placeholder.svg"}
                          alt={`Review ${idx + 1}`}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                    <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                      <Icons.thumbsUp size={14} />
                      <span>เป็นประโยชน์ ({review.likes})</span>
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
