"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface FavoriteCourt {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  rating: number;
  distance: string;
  pricePerHour: number;
  isFollowing: boolean;
}

const mockFavorites: FavoriteCourt[] = [
  {
    id: "1",
    name: "สนามแบดมินตัน S.T.",
    address: "45 ถนน วุฒากาศ แขวงตลาดพลู เขตธนบุรี",
    imageUrl: "/images/courts/court-1.jpg",
    rating: 4.5,
    distance: "2.3 กม.",
    pricePerHour: 120,
    isFollowing: true,
  },
  {
    id: "2",
    name: "Smash! Badminton & Pickleball",
    address: "123 ถนน สุขุมวิท แขวงคลองเตย",
    imageUrl: "/images/courts/court-2.jpg",
    rating: 4.8,
    distance: "3.5 กม.",
    pricePerHour: 180,
    isFollowing: false,
  },
  {
    id: "3",
    name: "สนามแบดมินตันบางนา",
    address: "456 ถนน บางนา-ตราด แขวงบางนา",
    imageUrl: "/images/courts/court-3.jpg",
    rating: 4.2,
    distance: "5.1 กม.",
    pricePerHour: 100,
    isFollowing: true,
  },
];

export default function FavoritesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"liked" | "following">("liked");
  const [favorites, setFavorites] = useState(mockFavorites);

  const likedCourts = favorites;
  const followingCourts = favorites.filter((c) => c.isFollowing);

  const displayCourts = activeTab === "liked" ? likedCourts : followingCourts;

  const toggleFollow = (id: string) => {
    setFavorites((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isFollowing: !c.isFollowing } : c
      )
    );
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight"
            >
              <ArrowLeftIcon size={20} className="text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              คอร์ทที่บันทึก
            </h1>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("liked")}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === "liked"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <HeartIcon size={16} />
              ถูกใจ ({likedCourts.length})
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === "following"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <BellIcon size={16} />
              ติดตาม ({followingCourts.length})
            </button>
          </div>
        </div>

        {/* Courts List */}
        <div className="flex-1 p-4 space-y-3 pb-24">
          {displayCourts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                {activeTab === "liked" ? (
                  <HeartIcon size={32} className="text-muted-foreground" />
                ) : (
                  <BellIcon size={32} className="text-muted-foreground" />
                )}
              </div>
              <p className="text-muted-foreground text-center">
                {activeTab === "liked"
                  ? "ยังไม่มีคอร์ทที่ถูกใจ"
                  : "ยังไม่ได้ติดตามคอร์ทใดๆ"}
              </p>
              <button
                onClick={() => router.push("/courts")}
                className="mt-4 text-sm text-primary font-medium"
              >
                ตีเกม
              </button>
            </div>
          ) : (
            displayCourts.map((court) => (
              <GlassCard
                key={court.id}
                className="overflow-hidden tap-highlight"
              >
                <div
                  className="flex gap-3 p-3 cursor-pointer"
                  onClick={() => router.push(`/courts/${court.id}`)}
                >
                  {/* Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={court.imageUrl || "/images/courts/court-1.jpg"}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {court.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {court.address}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <StarIcon size={14} className="text-yellow-500" />
                        <span className="text-xs text-foreground font-medium">
                          {court.rating}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {court.distance}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-primary">
                        {court.pricePerHour}.-/ชม.
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollow(court.id);
                          }}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            court.isFollowing
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <BellIcon size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(court.id);
                          }}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

// Icons
function ArrowLeftIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20.84 4.61C20.3292 4.09924 19.7228 3.69387 19.0554 3.4172C18.3879 3.14054 17.6725 2.99805 16.95 2.99805C16.2275 2.99805 15.5121 3.14054 14.8446 3.4172C14.1772 3.69387 13.5708 4.09924 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.3508 11.8792 21.7561 11.2728 22.0328 10.6053C22.3095 9.93789 22.4519 9.22249 22.4519 8.5C22.4519 7.77751 22.3095 7.0621 22.0328 6.39464C21.7561 5.72718 21.3508 5.12075 20.84 4.61Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

function TrashIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
