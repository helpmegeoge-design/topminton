"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ArrowLeftIcon, Icons } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CompetitionRoomPage() {
    const params = useParams();
    const router = useRouter();
    const [room, setRoom] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRoom = async () => {
            if (!params.id) return;

            const supabase = createClient();
            if (!supabase) return;

            try {
                const { data, error } = await supabase
                    .from('competition_rooms')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;
                setRoom(data);
            } catch (e) {
                console.error(e);
                toast.error("ไม่พบข้อมูลห้องแข่งขัน");
                router.push('/courts');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoom();
    }, [params.id]);

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-muted-foreground">กำลังเข้าสู่ห้องแข่งขัน...</p>
                </div>
            </AppShell>
        );
    }

    if (!room) return null;

    return (
        <AppShell>
            <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border safe-area-top">
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full hover:bg-muted/50 flex items-center justify-center tap-highlight transition-colors"
                    >
                        <ArrowLeftIcon size={24} className="text-foreground" />
                    </button>
                    <div className="flex-1 text-center font-bold text-lg truncate pr-10">{room.name}</div>
                </div>
            </header>

            <div className="p-4 space-y-6">
                <div className="text-center py-10">
                    <Icons.trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-bold">ยินดีต้อนรับสู่ห้อง {room.name}</h2>
                    <p className="text-muted-foreground mt-2">จำนวนผู้เล่น {room.players?.length || 0} คน</p>
                    <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-dashed border-border">
                        <p className="text-sm text-muted-foreground">ส่วนการจัดตารางแข่งและบันทึกคะแนนจะอยู่ในหน้านี้</p>
                        <p className="text-xs text-muted-foreground mt-1">(กำลังพัฒนาต่อในขั้นตอนถัดไป)</p>
                    </div>
                </div>

                {/* Player List Preview */}
                <div>
                    <h3 className="font-semibold mb-3">รายชื่อผู้เล่น</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {room.players?.map((p: any, i: number) => (
                            <div key={i} className="bg-card border p-2 rounded-lg text-sm flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {i + 1}
                                </div>
                                {p.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
