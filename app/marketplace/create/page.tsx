"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
// import { v4 as uuidv4 } from 'uuid'; // Removed to use crypto.randomUUID()

const categories = [
  { id: "racket", label: "ไม้แบดมินตัน", icon: "shuttlecock" },
  { id: "shoes", label: "รองเท้า", icon: "profile" },
  { id: "clothes", label: "เสื้อผ้า", icon: "profile" },
  { id: "shuttlecock", label: "ลูกขนไก่", icon: "shuttlecock" },
  { id: "bag", label: "กระเป๋า", icon: "profile" },
  { id: "accessories", label: "อุปกรณ์อื่นๆ", icon: "more" },
];

const conditions = [
  { id: "new", label: "ใหม่", description: "ยังไม่เคยใช้งาน มีแท็กติด" },
  { id: "likeNew", label: "เหมือนใหม่", description: "ใช้งาน 1-2 ครั้ง สภาพ 95%+" },
  { id: "good", label: "สภาพดี", description: "ใช้งานปกติ สภาพ 80-95%" },
  { id: "fair", label: "พอใช้", description: "มีร่องรอยการใช้งาน สภาพ 60-80%" },
  { id: "used", label: "มือสอง", description: "สภาพใช้งานทั่วไป" },
];

const brands = [
  "YONEX",
  "Victor",
  "LI-NING",
  "Kawasaki",
  "Apacs",
  "Fleet",
  "Felet",
  "อื่นๆ",
];

export default function CreateListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    brand: "",
    condition: "",
    price: "",
    originalPrice: "",
    description: "",
    location: "กรุงเทพมหานคร",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger file input
  const handleImageAdd = () => {
    if (images.length >= 5) return;
    fileInputRef.current?.click();
  };

  // Upload to Supabase Storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again if needed (though unlikely here)
    e.target.value = "";

    setUploading(true);
    const supabase = createClient();
    if (!supabase) {
      setUploading(false);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('market-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('market-images')
        .getPublicUrl(filePath);

      setImages([...images, publicUrl]);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("อัปโหลดรูปภาพล้มเหลว");
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const supabase = createClient();
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("กรุณาเข้าสู่ระบบก่อนลงขาย");
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase
        .from('market_products')
        .insert({
          user_id: user.id,
          title: formData.title,
          category: formData.category,
          brand: formData.brand,
          condition: formData.condition,
          price: Number(formData.price),
          original_price: formData.originalPrice ? Number(formData.originalPrice) : null,
          description: formData.description,
          location: formData.location,
          images: images,
          is_sold: false
        });

      if (error) throw error;

      toast.success("ลงขายสินค้าสำเร็จ!");
      router.push("/marketplace?success=1");

    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("เกิดข้อผิดพลาดในการลงขาย");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = images.length > 0 && formData.category && formData.condition;
  const canProceedStep2 = formData.title && formData.price;

  return (
    <div className="min-h-screen bg-background pb-24">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/marketplace">
            <Button variant="ghost" size="icon" className="tap-highlight">
              <Icons.chevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-foreground">ลงขายสินค้า</h1>
          <div className="w-10" />
        </div>

        {/* Progress */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-primary" />
            <div
              className={cn(
                "flex-1 h-1 rounded-full transition-colors",
                step >= 2 ? "bg-primary" : "bg-muted"
              )}
            />
            <div
              className={cn(
                "flex-1 h-1 rounded-full transition-colors",
                step >= 3 ? "bg-primary" : "bg-muted"
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ขั้นตอน {step}/3:{" "}
            {step === 1 && "รูปภาพและหมวดหมู่"}
            {step === 2 && "รายละเอียดสินค้า"}
            {step === 3 && "ตรวจสอบและยืนยัน"}
          </p>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Step 1: Images & Category */}
        {step === 1 && (
          <>
            {/* Images */}
            <div>
              <h2 className="font-semibold text-foreground mb-3">
                รูปภาพสินค้า <span className="text-destructive">*</span>
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden bg-muted"
                  >
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <Icons.close className="w-4 h-4 text-white" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] text-center py-0.5">
                        ภาพหลัก
                      </div>
                    )}
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    disabled={uploading}
                    onClick={handleImageAdd}
                    className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icons.camera className="w-6 h-6" />
                    )}
                    <span className="text-xs">{images.length}/5</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                รูปแรกจะเป็นรูปหลัก แนะนำให้ใช้รูปที่ชัดเจน
              </p>
            </div>

            {/* Category */}
            <div>
              <h2 className="font-semibold text-foreground mb-3">
                หมวดหมู่ <span className="text-destructive">*</span>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setFormData({ ...formData, category: cat.id })
                    }
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-center",
                      formData.category === cat.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {cat.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <h2 className="font-semibold text-foreground mb-3">
                สภาพสินค้า <span className="text-destructive">*</span>
              </h2>
              <div className="space-y-2">
                {conditions.map((cond) => (
                  <button
                    key={cond.id}
                    onClick={() =>
                      setFormData({ ...formData, condition: cond.id })
                    }
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all text-left",
                      formData.condition === cond.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    )}
                  >
                    <p className="font-medium text-foreground">{cond.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {cond.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <>
            {/* Title */}
            <div>
              <label className="block font-semibold text-foreground mb-2">
                ชื่อสินค้า <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="เช่น Yonex Astrox 99 Pro"
                className="h-12"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block font-semibold text-foreground mb-2">
                ยี่ห้อ
              </label>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setFormData({ ...formData, brand })}
                    className={cn(
                      "px-4 py-2 rounded-full border transition-all text-sm",
                      formData.brand === brand
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-foreground mb-2">
                  ราคาขาย <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0"
                    className="h-12 pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ฿
                  </span>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-foreground mb-2">
                  ราคาเต็ม (ถ้ามี)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: e.target.value })
                    }
                    placeholder="0"
                    className="h-12 pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ฿
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-foreground mb-2">
                รายละเอียดเพิ่มเติม
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="อธิบายสภาพสินค้า สเปค หรือข้อมูลที่ผู้ซื้อควรรู้..."
                className="min-h-[120px]"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block font-semibold text-foreground mb-2">
                พื้นที่
              </label>
              <Button variant="outline" className="w-full justify-between h-12 bg-transparent">
                <span>{formData.location}</span>
                <Icons.chevronRight className="w-5 h-5" />
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <>
            <GlassCard className="overflow-hidden">
              {/* Preview Image */}
              <div className="aspect-video bg-muted">
                <img
                  src={images[0] || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {categories.find((c) => c.id === formData.category)?.label}
                  </span>
                  <span className="px-2 py-0.5 bg-[#F7B928]/10 text-[#F7B928] text-xs rounded-full">
                    {conditions.find((c) => c.id === formData.condition)?.label}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-foreground">
                  {formData.title || "ชื่อสินค้า"}
                </h2>

                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">
                    ฿{Number(formData.price || 0).toLocaleString()}
                  </span>
                  {formData.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ฿{Number(formData.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>

                {formData.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {formData.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                  <Icons.mapPin className="w-4 h-4" />
                  <span>{formData.location}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <h3 className="font-semibold text-foreground mb-3">
                หมายเหตุ
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icons.check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>สินค้าจะแสดงบน Marketplace ทันทีหลังจากลงขาย</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>ผู้ซื้อสามารถติดต่อคุณผ่านแชทในแอป</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.info className="w-4 h-4 text-primary mt-0.5" />
                  <span>คุณสามารถแก้ไขหรือลบประกาศได้ตลอดเวลา</span>
                </li>
              </ul>
            </GlassCard>
          </>
        )}
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-border p-4 safe-area-bottom">
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              className="flex-1 h-12 bg-transparent"
              onClick={() => setStep(step - 1)}
            >
              ย้อนกลับ
            </Button>
          )}
          {step < 3 ? (
            <Button
              className="flex-1 h-12"
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              onClick={() => setStep(step + 1)}
            >
              ถัดไป
            </Button>
          ) : (
            <Button
              className="flex-1 h-12"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  กำลังลงขาย...
                </>
              ) : (
                "ลงขายสินค้า"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
