"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

type Category = "all" | "racket" | "shoes" | "shuttlecock" | "bag" | "others";
type Condition = "new" | "used";

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  condition: Condition;
  category: string;
  imageUrl: string;
  seller: {
    name: string;
    avatar: string;
    rating: number;
  };
  location: string;
  createdAt: string;
  isSold: boolean;
}

const categories: { key: Category; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "racket", label: "ไม้แบด" },
  { key: "shoes", label: "รองเท้า" },
  { key: "shuttlecock", label: "ลูกขนไก่" },
  { key: "bag", label: "กระเป๋า" },
  { key: "others", label: "อื่นๆ" },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [showOnlyNew, setShowOnlyNew] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      try {
        let query = supabase
          .from('market_products')
          .select(`
            *,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        if (showOnlyNew) {
          query = query.eq('condition', 'new');
        }

        // Search title client-side or use .ilike if simple, but filtering full list is ok for now 
        // if not huge. Or .ilike('title', `%${searchQuery}%`) if backend search preferred.
        // Let's use backend search if query exists.
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching products:", error);
          return;
        }

        if (data) {
          const map: Product[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            originalPrice: item.original_price,
            condition: item.condition as Condition,
            category: item.category,
            imageUrl: item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg",
            seller: {
              name: item.profiles?.display_name || "Unknown",
              avatar: item.profiles?.avatar_url || "/placeholder.svg",
              rating: 5.0, // Mock rating for now as we don't have table
            },
            location: item.location || "Bangkok",
            createdAt: formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: th }),
            isSold: item.is_sold
          }));
          setProducts(map);
        }
      } catch (err) {
        console.error("Fetch market error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, showOnlyNew, searchQuery]); // Re-fetch on filter change

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center tap-highlight"
              >
                <ArrowLeftIcon size={20} className="text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">
                ตลาดซื้อขาย
              </h1>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/marketplace/create")}
            >
              <PlusIcon size={16} className="mr-1" />
              ลงขาย
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </header>

        {/* Category Filter */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === cat.key
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Filter */}
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {products.length} รายการ
          </span>
          <button
            onClick={() => setShowOnlyNew(!showOnlyNew)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
              showOnlyNew
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                showOnlyNew
                  ? "bg-primary border-primary"
                  : "border-muted-foreground"
              )}
            >
              {showOnlyNew && <CheckIcon size={10} className="text-white" />}
            </div>
            เฉพาะของใหม่
          </button>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 pb-24">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square rounded-xl bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBagIcon size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">ไม่พบสินค้า</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <GlassCard
                  key={product.id}
                  className={cn(
                    "overflow-hidden cursor-pointer tap-highlight",
                    product.isSold && "opacity-60"
                  )}
                  onClick={() => router.push(`/marketplace/${product.id}`)}
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Condition Badge */}
                    <div
                      className={cn(
                        "absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium",
                        product.condition === "new"
                          ? "bg-green-100/90 text-green-700"
                          : "bg-orange-100/90 text-orange-700"
                      )}
                    >
                      {product.condition === "new" ? "มือ 1" : "มือ 2"}
                    </div>
                    {/* Sold Badge */}
                    {product.isSold && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-foreground">
                          ขายแล้ว
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1 h-10">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-bold text-primary">
                        {product.price.toLocaleString()}.-
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={product.seller.avatar}
                          alt={product.seller.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                        {product.seller.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto truncate max-w-[60px]">
                        {product.location}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
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

function PlusIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShoppingBagIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
