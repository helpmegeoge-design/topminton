"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface ProductDetail {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  condition: string;
  conditionDetail: string;
  images: string[];
  category: string;
  brand: string;
  description: string;
  location: string;
  postedAt: string;
  views: number;
  isSold: boolean;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalSales: number;
    memberSince: string;
  };
}

export default function MarketplaceDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('market_products')
          .select(`
            *,
            profiles:user_id (
              id,
              display_name,
              avatar_url,
              created_at
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error("Error fetching detail:", error);
          setLoading(false);
          return;
        }

        if (data) {
          setProduct({
            id: data.id,
            title: data.title,
            price: data.price,
            originalPrice: data.original_price,
            condition: data.condition,
            conditionDetail: data.condition === 'new' ? 'สินค้าใหม่' : 'สินค้ามือสอง',
            images: data.images && data.images.length > 0 ? data.images : ["/placeholder.svg"],
            category: data.category,
            brand: data.brand || "ไม่ระบุยี่ห้อ",
            description: data.description || "",
            location: data.location || "กรุงเทพมหานคร",
            postedAt: formatDistanceToNow(new Date(data.created_at), { addSuffix: true, locale: th }),
            views: 0, // Mock or implement view counting later
            isSold: data.is_sold,
            seller: {
              id: data.profiles?.id,
              name: data.profiles?.display_name || "Unknown",
              avatar: data.profiles?.avatar_url || "/placeholder.svg",
              rating: 5.0, // Mock
              totalSales: 0, // Mock
              memberSince: data.profiles?.created_at
                ? formatDistanceToNow(new Date(data.profiles.created_at), { addSuffix: true, locale: th })
                : "-",
            }
          });
        }
      } catch (err) {
        console.error("Fetch detail error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p>ไม่พบสินค้า</p>
        <Link href="/marketplace">
          <Button variant="link">กลับสู่ตลาดซื้อขาย</Button>
        </Link>
      </div>
    );
  }

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/marketplace">
            <Button variant="ghost" size="icon" className="tap-highlight">
              <Icons.chevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Icons.heart
                className={cn(
                  "w-5 h-5",
                  isSaved && "fill-[#FA383E] text-[#FA383E]"
                )}
              />
            </Button>
            <Button variant="ghost" size="icon">
              <Icons.share className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-14">
        {/* Image Gallery */}
        <div className="relative aspect-square bg-muted">
          <img
            src={product.images[currentImageIndex]}
            alt={product.title}
            className="w-full h-full object-cover"
          />

          {/* Image Indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentImageIndex
                      ? "bg-white w-6"
                      : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}

          {/* Condition Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-[#F7B928] text-white text-sm font-medium rounded-full">
            {product.condition === 'new' ? 'ของใหม่' : 'มือสอง'}
          </div>

          {product.isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="px-6 py-2 bg-white rounded-full text-lg font-bold text-black transform -rotate-12 border-4 border-black">
                ขายแล้ว
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-4">
          {/* Title & Price */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-primary font-medium">
                {product.brand}
              </span>
              <span className="text-xs text-muted-foreground">
                {product.category}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                ฿{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ฿{product.originalPrice.toLocaleString()}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-sm text-[#FA383E] font-medium">
                  -{discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Condition Detail */}
          <GlassCard className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F7B928]/10 flex items-center justify-center">
                <Icons.info className="w-5 h-5 text-[#F7B928]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">สภาพสินค้า</p>
                <p className="text-sm text-muted-foreground">
                  {product.conditionDetail}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Description */}
          <div>
            <h2 className="font-semibold text-foreground mb-2">รายละเอียด</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icons.mapPin className="w-4 h-4" />
              <span>{product.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icons.clock className="w-4 h-4" />
              <span>{product.postedAt}</span>
            </div>
          </div>

          {/* Seller Info */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={product.seller.avatar}
                alt={product.seller.name}
                className="w-12 h-12 rounded-full object-cover bg-muted"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {product.seller.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>สมาชิกเมื่อ {product.seller.memberSince}</span>
                </div>
              </div>
              <Link href={`/profile/${product.seller.id}`}>
                <Button variant="outline" size="sm">
                  ดูโปรไฟล์
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-border p-4 safe-area-bottom">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" disabled={product.isSold}>
            <Icons.message className="w-4 h-4 mr-2" />
            แชท
          </Button>
          <Button className="flex-1" disabled={product.isSold}>
            <Icons.phone className="w-4 h-4 mr-2" />
            โทร
          </Button>
        </div>
      </div>
    </div>
  );
}
