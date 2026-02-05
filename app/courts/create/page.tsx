"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon, Icons } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Player {
    id: string;
    name: string;
}

export default function CreateCompetitionRoomPage() {
    const router = useRouter();
    const [roomName, setRoomName] = useState("");
    const [playerInput, setPlayerInput] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Parse Player Names Logic (Reused from Cost Calculator)
    const parsePlayerNames = (input: string) => {
        const lines = input.split("\n").map(l => l.trim()).filter(l => l);
        const newPlayers: Player[] = [];

        // Strict Numbered Mode Detection
        const strictPattern = /^(\d+)[\.\)\-\s]+\s*(.*)/;
        const numberedLines = lines.filter(l => strictPattern.test(l));
        const useStrictMode = numberedLines.length > 0;

        const addPlayer = (name: string) => {
            // Avoid duplicates in the same batch
            if (name && !newPlayers.some(p => p.name === name)) {
                newPlayers.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: name.replace(/[\u200B-\u200D\uFEFF]/g, ''), // Remove zero width chars
                });
            }
        };

        if (useStrictMode) {
            for (const line of lines) {
                const match = line.match(strictPattern);
                if (match) {
                    const name = match[2].trim();
                    if (name && name.length > 0) addPlayer(name);
                }
            }
        } else {
            const excludePatterns = [
                /^[🧡📍🏸❌]/, /[🧡📍🏸❌]$/, /^https?:\/\//,
                /^(ปิด|คอร์ท|สนาม|เวลา|วันที่|ลงชื่อ|@)/,
                /(กติก|พรุ่งนี้|วันนี้|พบกัน|นัด|คอนเท้น|แรง|จบบ่แฮง)/,
            ];
            for (const line of lines) {
                const isHeaderFooter = excludePatterns.some(pattern => pattern.test(line));
                if (!isHeaderFooter && line.length < 50) addPlayer(line);
            }
        }

        setPlayers(newPlayers);
    };

    const handlePlayerInputChange = (val: string) => {
        setPlayerInput(val);
        parsePlayerNames(val);
    };

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            toast.error("กรุณาตั้งชื่อห้องแข่งขัน");
            return;
        }

        setIsLoading(true);
        const supabase = createClient();
        if (!supabase) {
            toast.error("ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้");
            setIsLoading(false);
            return;
        }

        // Check Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("กรุณาเข้าสู่ระบบก่อนสร้างห้อง");
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('competition_rooms')
                .insert({
                    name: roomName,
                    created_by: user.id,
                    players: players,
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("สร้างห้องแข่งขันเรียบร้อย!");
            router.push('/courts'); // Go back to list as requested
        } catch (error) {
            console.error("Error creating room:", error);
            toast.error("เกิดข้อผิดพลาดในการสร้างห้อง");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppShell>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full hover:bg-muted/50 flex items-center justify-center tap-highlight transition-colors"
                    >
                        <ArrowLeftIcon size={24} className="text-foreground" />
                    </button>
                    <div className="flex-1 text-center font-bold text-lg">สร้างห้องแข่งขัน</div>
                    <div className="w-10"></div>
                </div>
            </header>

            <div className="p-4 space-y-6 pb-32">
                {/* Room Info */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">ชื่อห้องแข่งขัน</label>
                        <Input
                            placeholder="Ex. ก๊วนวันอังคาร, สนามแบด..."
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="h-12 bg-white"
                        />
                    </div>
                </div>

                {/* Player Parser */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Icons.users className="w-4 h-4 text-primary" /> รายชื่อผู้เล่น (จาก Line)
                        </label>
                        <Textarea
                            placeholder={`วางรายชื่อที่นี่... ระบบจะดึงชื่อให้อัตโนมัติ\n1. แสตมป์\n2. เต้ย\n3. พี่นัท`}
                            value={playerInput}
                            onChange={(e) => handlePlayerInputChange(e.target.value)}
                            rows={6}
                            className="bg-white resize-none font-medium text-sm border-dashed border-2"
                        />
                    </div>
                </div>

                {/* Parsed Result */}
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <Icons.checkCircle className="w-5 h-5 text-green-500" /> ตรวจพบ {players.length} คน
                        </h3>
                    </div>

                    {players.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {players.map((p, i) => (
                                <div key={i} className="bg-muted/50 p-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold shrink-0">
                                        {i + 1}
                                    </div>
                                    <span className="truncate">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            ยังไม่มีรายชื่อผู้เล่น
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-20 pb-safe">
                <Button
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                    onClick={handleCreateRoom}
                    disabled={isLoading || !roomName.trim()}
                >
                    {isLoading ? (
                        <Icons.loader className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        <Icons.plus className="w-5 h-5 mr-2" />
                    )}
                    {isLoading ? "กำลังสร้าง..." : "สร้างห้องแข่งขัน"}
                </Button>
            </div>
        </AppShell>
    );
}
