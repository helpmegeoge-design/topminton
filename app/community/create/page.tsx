"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";

const suggestedHashtags = [
  "#รีวิวคอร์ทแบด",
  "#ป้ายยาอุปกรณ์",
  "#เทคนิคแบด",
  "#ก๊วนแบด",
  "#แบดมินตัน",
];

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddImage = () => {
    // Mock image upload
    if (images.length < 10) {
      setImages([...images, `/placeholder.svg?height=200&width=200`]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Handle submit logic
    router.push("/community");
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
                สร้างโพสต์
              </h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="rounded-full bg-[#FF9500] hover:bg-[#FF9500]/90 text-white"
            >
              โพสต์
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Image Upload */}
          <GlassCard className="p-4">
            <h3 className="font-medium text-foreground mb-3">
              รูปภาพ (สูงสุด 10 รูป)
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#FA383E] rounded-full flex items-center justify-center"
                  >
                    <Icons.close className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <button
                  onClick={handleAddImage}
                  className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-[#FF9500] transition-colors"
                >
                  <Icons.plus className="h-6 w-6 text-muted-foreground" />
                </button>
              )}
            </div>
          </GlassCard>

          {/* Content Input */}
          <GlassCard className="p-4">
            <h3 className="font-medium text-foreground mb-3">เนื้อหา</h3>
            <Textarea
              placeholder="เขียนเรื่องราวของคุณ..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="bg-secondary border-0 resize-none"
            />
            <div className="flex justify-end mt-2">
              <span className="text-xs text-muted-foreground">
                {content.length}/500
              </span>
            </div>
          </GlassCard>

          {/* Hashtags */}
          <GlassCard className="p-4">
            <h3 className="font-medium text-foreground mb-3">แฮชแท็ก</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedHashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedTags.includes(tag)
                      ? "bg-[#FF9500] text-white hover:bg-[#FF9500]/90"
                      : "border-border hover:bg-accent"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </GlassCard>

          {/* Gamification Notice */}
          <div className="bg-[#F7B928]/10 border border-[#F7B928]/30 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F7B928] flex items-center justify-center">
                <Icons.coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">รับ 2 TB Points</p>
                <p className="text-sm text-muted-foreground">
                  เมื่อโพสต์ได้รับการอนุมัติ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
