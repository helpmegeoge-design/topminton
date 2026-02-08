"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ReceiptPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const router = useRouter();

    const [party, setParty] = useState<any>(null);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Bill Data from URL
    const courtPrice = parseFloat(searchParams.get('court') || '0');
    const shuttlePrice = parseFloat(searchParams.get('shuttle') || '0');
    const total = parseFloat(searchParams.get('total') || '0');
    const perPerson = parseFloat(searchParams.get('perPerson') || '0');
    const memberCountValue = parseInt(searchParams.get('memberCount') || '1');
    const customItems = JSON.parse(searchParams.get('customItems') || '[]');
    const selectedIds = searchParams.get('selectedIds')?.split(',') || [];

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            if (!supabase) return;

            // 1. Fetch Party & Host
            const { data: partyData } = await supabase
                .from('parties')
                .select(`*, host:profiles!parties_host_id_fkey(*)`)
                .eq('id', id)
                .single();

            if (partyData) {
                setParty(partyData);
            }

            // 2. Fetch ALL members to filter by selectedIds
            const { data: membersData } = await supabase
                .from('party_members')
                .select(`
                    id,
                    guest_name,
                    user:profiles(*)
                `)
                .eq('party_id', id);

            if (membersData) {
                const filtered = membersData
                    .filter((m: any) => selectedIds.includes(m.id))
                    .map((m: any) => ({
                        id: m.id,
                        name: m.user ? (m.user.display_name || m.user.first_name) : (m.guest_name || "Guest"),
                        avatar_url: m.user?.avatar_url || null,
                        short_id: m.user?.short_id || "---"
                    }));
                setSelectedMembers(filtered);
            }

            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <AppShell hideNav>
            <div className="flex items-center justify-center min-h-[60vh]">
                <Icons.spinner className="w-8 h-8 animate-spin text-primary" />
            </div>
        </AppShell>
    );

    return (
        <AppShell hideNav>
            <div className="min-h-screen bg-muted/10 p-4 pb-32">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6 safe-area-top">
                    <button onClick={() => router.back()} className="p-3 rounded-2xl bg-background border border-white/5 shadow-xl transition-all active:scale-95">
                        <Icons.chevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="font-bold text-lg text-white">สรุปค่าใช้จ่าย</h1>
                    <button className="p-3 rounded-2xl bg-background border border-white/5 shadow-xl opacity-50">
                        <Icons.share className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Receipt Card */}
                <div className="relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 bg-primary/20 blur-[120px] -z-10 rounded-full scale-75" />

                    <GlassCard className="border-white/10 overflow-hidden relative shadow-2xl bg-white/5 backdrop-blur-2xl px-0 py-0 rounded-[32px]">
                        {/* Status Bar */}
                        <div className="h-2 bg-primary w-full shadow-[0_4px_20px_rgba(var(--primary),0.4)]" />

                        {/* Top Info */}
                        <div className="p-8 text-center space-y-4 border-b border-dashed border-white/10">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-primary/20 animate-in zoom-in duration-500">
                                <Icons.coins className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Receipt Summary</h2>
                                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-60 mt-1">{party?.title || 'Badminton Session'}</p>
                            </div>
                            <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                {new Date().toLocaleDateString('th-TH', {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                        </div>

                        {/* Bill Items */}
                        <div className="p-8 space-y-4">
                            <div className="space-y-3">
                                {courtPrice > 0 && (
                                    <div className="flex justify-between items-center group">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider group-hover:text-white transition-colors">ค่าคอร์ท</span>
                                        <span className="font-black text-white italic tracking-tighter text-lg">{courtPrice.toLocaleString()}.-</span>
                                    </div>
                                )}
                                {shuttlePrice > 0 && (
                                    <div className="flex justify-between items-center group">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider group-hover:text-white transition-colors">ค่าลูกแบด</span>
                                        <span className="font-black text-white italic tracking-tighter text-lg">{shuttlePrice.toLocaleString()}.-</span>
                                    </div>
                                )}
                                {customItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center group">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider group-hover:text-white transition-colors">{item.name}</span>
                                        <span className="font-black text-white italic tracking-tighter text-lg">{parseFloat(item.price).toLocaleString()}.-</span>
                                    </div>
                                ))}

                                <div className="pt-4 mt-2 border-t border-dashed border-white/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-black text-white uppercase italic tracking-tighter">ยอดรวมทั้งหมด</span>
                                        <span className="text-3xl font-black text-primary italic tracking-tighter underline underline-offset-8 decoration-primary/30">
                                            {total.toLocaleString()}.-
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-3xl p-6 text-center border border-white/5 mt-8 shadow-inner shadow-black/20">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-50">หารเฉลี่ยสำหรับ {memberCountValue} คน</p>
                                <p className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg flex items-center justify-center gap-2">
                                    {perPerson.toLocaleString()}
                                    <span className="text-sm not-italic font-bold text-muted-foreground uppercase tracking-widest">THB</span>
                                </p>
                            </div>
                        </div>

                        {/* Selected Members Breakdown */}
                        <div className="bg-black/20 p-8 border-t border-white/10 space-y-6">
                            <h3 className="font-black text-xs text-white/40 uppercase tracking-[0.2em]">Breakdown ({selectedMembers.length} Person)</h3>
                            <div className="space-y-4">
                                {selectedMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Image
                                                    src={member.avatar_url || "/placeholder.svg"}
                                                    alt={member.name}
                                                    width={40} height={40}
                                                    className="rounded-full bg-white/5 border border-white/10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-lg"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                                                    <Icons.check className="w-2 h-2 text-black" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{member.name}</span>
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">ID: {member.short_id}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-black text-white italic tracking-tighter">{perPerson.toLocaleString()}.-</span>
                                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Unpaid</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment QR Section (Mock) */}
                        <div className="p-8 border-t border-dashed border-white/10 text-center space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Scan to Pay</p>
                                <p className="text-sm font-bold text-white">พร้อมเพย์ / PromptPay</p>
                            </div>

                            <div className="relative group inline-block">
                                <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-48 h-48 bg-white rounded-[32px] p-4 flex items-center justify-center shadow-2xl relative transform transition-transform group-hover:scale-[1.02]">
                                    <Icons.qrCode className="w-full h-full text-black" />
                                </div>
                            </div>

                            <div className="space-y-1 pt-2">
                                <p className="text-base font-black text-primary tracking-tighter italic">08X-XXX-XXXX</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
                                    {party?.host?.display_name || party?.host?.first_name || 'HOST'}
                                </p>
                            </div>
                        </div>

                        {/* Cut Effect Bottom */}
                        <div className="h-4 bg-muted/20 relative">
                            <div className="absolute inset-x-0 -bottom-1 flex justify-around">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="w-4 h-4 bg-muted/10 rounded-full" />
                                ))}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Final Action */}
                <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-background to-transparent pt-12 safe-area-bottom z-50">
                    <Button
                        onClick={() => router.push(`/party/${id}`)}
                        className="w-full h-14 bg-primary text-black font-black text-lg italic uppercase tracking-tighter rounded-2xl shadow-2xl shadow-primary/20 transform transition-transform active:scale-[0.98]"
                    >
                        เสร็จสิ้น (Finish)
                        <Icons.check className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </AppShell>
    );
}
