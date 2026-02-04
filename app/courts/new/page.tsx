"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ArrowLeftIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CreateCourtPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        price_per_hour: "",
        court_count: "1",
        open_time: "09:00",
        close_time: "22:00",
        phone: "",
        amenities: [] as string[],
    });

    const availableAmenities = [
        { id: "ที่จอดรถ", label: "ที่จอดรถ" },
        { id: "ห้องอาบน้ำ", label: "ห้องอาบน้ำ" },
        { id: "Wi-Fi", label: "Free Wi-Fi" },
        { id: "ร้านขายอุปกรณ์", label: "ขายอุปกรณ์" },
        { id: "เครื่องดื่ม", label: "เครื่องดื่ม" },
        { id: "ผ้าเช็ดตัว", label: "เช่าผ้าเช็ดตัว" },
        { id: "แอร์", label: "ห้องแอร์" },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const adjustCourtCount = (amount: number) => {
        setFormData(prev => ({
            ...prev,
            court_count: String(Math.max(1, parseInt(prev.court_count || "1") + amount))
        }));
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => {
            const exists = prev.amenities.includes(amenity);
            if (exists) {
                return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
            } else {
                return { ...prev, amenities: [...prev.amenities, amenity] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const supabase = createClient();

        if (!supabase) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            setIsLoading(false);
            return;
        }

        try {
            if (!formData.name || !formData.price_per_hour) {
                toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
                return;
            }

            const { error } = await supabase
                .from('courts')
                .insert({
                    name: formData.name,
                    address: formData.address,
                    price_per_hour: parseFloat(formData.price_per_hour),
                    court_count: parseInt(formData.court_count) || 1,
                    phone: formData.phone,
                    amenities: formData.amenities,
                    open_time: formData.open_time,
                    close_time: formData.close_time,
                    images: [],
                    rating: 5,
                    province: 'Chonburi'
                });

            if (error) throw error;

            toast.success("เพิ่มสนามเรียบร้อยแล้ว!");
            router.push('/courts');
        } catch (error) {
            console.error("Error creating court:", error);
            toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppShell>
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 safe-area-top">
                <div className="flex items-center gap-3 px-4 py-3">
                    <Link href="/courts" className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center tap-highlight transition-colors">
                        <ArrowLeftIcon size={24} className="text-gray-900" />
                    </Link>
                    <h1 className="text-xl font-bold flex-1">ลงทะเบียนสนามใหม่</h1>
                </div>
            </header>

            <div className="px-4 py-6 space-y-6 max-w-lg mx-auto pb-32">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Section 1: Basic Info */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <h3 className="font-bold text-gray-900">ข้อมูลทั่วไป</h3>
                        </div>

                        <div className="space-y-3">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700 mb-2 block">
                                    ชื่อสนาม <span className="text-red-500">*</span>
                                </span>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="เช่น บีที แบดมินตัน"
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all placeholder:text-gray-400 text-base"
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-700 mb-2 block">
                                    ที่ตั้ง / จุดสังเกต
                                </span>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="รายละเอียดที่อยู่..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all placeholder:text-gray-400 resize-none text-base"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Section 2: Pricing & Schedule */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <h3 className="font-bold text-gray-900">รายละเอียดค่าบริการ</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700 mb-2 block">
                                    ราคา/ชั่วโมง <span className="text-red-500">*</span>
                                </span>
                                <div className="relative">
                                    <input
                                        name="price_per_hour"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={formData.price_per_hour}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setFormData(prev => ({ ...prev, price_per_hour: value }));
                                        }}
                                        placeholder="150"
                                        className="w-full h-12 pl-4 pr-14 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all text-lg font-bold text-center"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                                        บาท
                                    </span>
                                </div>
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-700 mb-2 block">
                                    จำนวนสนาม
                                </span>
                                <div className="flex items-center bg-gray-50 rounded-xl h-12 border-0 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:bg-white transition-all overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => adjustCourtCount(-1)}
                                        className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-gray-100 transition-colors text-xl font-bold"
                                    >
                                        −
                                    </button>
                                    <div className="flex-1 text-center font-bold text-lg text-gray-900">
                                        {formData.court_count}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => adjustCourtCount(1)}
                                        className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-gray-100 transition-colors text-xl font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </label>
                        </div>

                        <label className="block">
                            <span className="text-sm font-medium text-gray-700 mb-2 block">
                                เวลาเปิด - ปิด
                            </span>
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                                <input
                                    type="time"
                                    name="open_time"
                                    value={formData.open_time}
                                    onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all text-base text-center font-medium"
                                />
                                <span className="text-gray-400 text-sm">ถึง</span>
                                <input
                                    type="time"
                                    name="close_time"
                                    value={formData.close_time}
                                    onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all text-base text-center font-medium"
                                />
                            </div>
                        </label>
                    </div>

                    {/* Section 3: Facilities */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <h3 className="font-bold text-gray-900">สิ่งอำนวยความสะดวก</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {availableAmenities.map((item) => {
                                const isSelected = formData.amenities.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleAmenity(item.id)}
                                        className={cn(
                                            "h-12 px-4 rounded-xl text-sm font-medium transition-all border-2 flex items-center justify-center gap-2",
                                            isSelected
                                                ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                        )}
                                    >
                                        {isSelected && <span className="text-base">✓</span>}
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Button - Fixed at bottom */}
                    <div className="h-20"></div> {/* Spacer */}
                </form>
            </div>

            {/* Fixed Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-24 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-40">
                <div className="max-w-lg mx-auto pointer-events-auto">
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full h-14 bg-gradient-to-r from-[#FF9500] to-[#FF5E3A] text-white font-bold text-base rounded-2xl shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "กำลังบันทึกข้อมูล..." : "ยืนยันการเพิ่มสนาม"}
                    </button>
                </div>
            </div>
        </AppShell>
    );
}
