"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export default function CompetitionSetupPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // State
    const [queueFormat, setQueueFormat] = useState<'winner_stays' | 'all_leave'>('winner_stays');
    const [courtCount, setCourtCount] = useState<number>(2);
    const [autoFill, setAutoFill] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);

    // const handleStart = () => {
    //   // TODO: Save settings and redirect to active competition view
    //   console.log("Settings:", { queueFormat, courtCount, autoFill });
    //   router.push(`/party/${id}/competition/active`); 
    // };

    return (
        <AppShell hideNav>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border safe-area-top">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 tap-highlight">
                            <Icons.chevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="font-semibold text-lg">ตั้งค่าการแข่งขัน</h1>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-8 pb-32">

                {/* 1. Queue Format Selection */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        <Icons.shuffle className="w-5 h-5" />
                        <h2>รูปแบบการรันคิว</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Option 1: Winner Stays */}
                        <button
                            onClick={() => setQueueFormat('winner_stays')}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 gap-3",
                                queueFormat === 'winner_stays'
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                    : "border-muted bg-card hover:bg-muted/50 text-muted-foreground"
                            )}
                        >
                            <Icons.star className={cn("w-8 h-8", queueFormat === 'winner_stays' ? "text-primary" : "text-muted-foreground")} />
                            <div className="text-center">
                                <p className={cn("font-bold", queueFormat === 'winner_stays' ? "text-foreground" : "")}>ชนวนต่อ</p>
                                <p className="text-xs text-muted-foreground opacity-80">ออกทีละคู่</p>
                            </div>

                            {/* Active Indicator */}
                            {queueFormat === 'winner_stays' && (
                                <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full animate-pulse" />
                            )}
                        </button>

                        {/* Option 2: All Leave */}
                        <button
                            onClick={() => setQueueFormat('all_leave')}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 gap-3",
                                queueFormat === 'all_leave'
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                    : "border-muted bg-card hover:bg-muted/50 text-muted-foreground"
                            )}
                        >
                            <Icons.users className={cn("w-8 h-8", queueFormat === 'all_leave' ? "text-primary" : "text-muted-foreground")} />
                            <div className="text-center">
                                <p className={cn("font-bold", queueFormat === 'all_leave' ? "text-foreground" : "")}>ออกยกก๊วน</p>
                                <p className="text-xs text-muted-foreground opacity-80">ออก 4 คนยกสนาม</p>
                            </div>

                            {/* Active Indicator */}
                            {queueFormat === 'all_leave' && (
                                <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full animate-pulse" />
                            )}
                        </button>
                    </div>

                    {/* Description Box */}
                    <div className="bg-muted/30 border border-dashed border-border rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
                        {queueFormat === 'winner_stays'
                            ? "• รอบแรกคัดผู้ชนะอยู่ต่อ พอเข้าสู่เกมที่ 2 จะต้องสลับคิวออกเพื่อให้คู่ใหม่ได้เล่น (จำกัดคู่ละ 2 เกมต่อเนื่อง)"
                            : "• แข่งขันจบเกม 1 รอบ เปลี่ยนผู้เล่นใหม่ทั้งหมด 4 คน เพื่อให้ทุกคนได้เล่นอย่างทั่วถึง"
                        }
                    </div>
                </section>

                {/* 2. General Settings */}
                <section className="space-y-6">
                    <h2 className="text-lg font-semibold">การตั้งค่าทั่วไป</h2>

                    {/* Court Count Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="font-medium">จำนวนคอร์ท</label>
                            <span className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm">
                                {courtCount}
                            </span>
                        </div>

                        <div className="px-2">
                            <Slider
                                value={[courtCount]}
                                onValueChange={(val) => setCourtCount(val[0])}
                                min={1}
                                max={10}
                                step={1}
                                className="py-4"
                            />
                        </div>

                        <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                            <span>1 Court</span>
                            <span>10 Courts</span>
                        </div>
                    </div>

                    {/* Auto Fill Toggle */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="space-y-1">
                            <label className="font-medium">โหมดเติมคนอัตโนมัติ</label>
                            <p className="text-xs text-muted-foreground max-w-[250px]">
                                จัดคนให้เต็มทุกคอร์ทโดยการสุ่มจากคนที่พักอยู่
                            </p>
                        </div>
                        <Switch
                            checked={autoFill}
                            onCheckedChange={setAutoFill}
                        />
                    </div>
                </section>
            </div>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-50 safe-area-bottom">
                <Button
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                    size="lg"
                    onClick={() => router.push(`/party/${id}/competition/active?courts=${courtCount}&mode=${queueFormat}&auto=${autoFill}`)}
                >
                    บันทึกและเริ่มการแข่งขัน
                </Button>
            </div>
        </AppShell>
    );
}
