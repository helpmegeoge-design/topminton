"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/icons";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

function ReceiptContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const router = useRouter();

    const [party, setParty] = useState<any>(null);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Bill Data from URL
    const total = parseFloat(searchParams.get('total') || '0');
    const regularPerPerson = parseFloat(searchParams.get('perPerson') || '0');
    const customItems = JSON.parse(searchParams.get('customItems') || '[]');
    const selectedIds = searchParams.get('selectedIds')?.split(',') || [];

    // OT Data
    const isOT = searchParams.get('isOT') === 'true';
    const otPerPerson = parseFloat(searchParams.get('otPerPerson') || '0');
    const otIds = searchParams.get('otIds')?.split(',') || [];

    // Proportional Share Data
    const individualShares = JSON.parse(searchParams.get('individualShares') || '[]');

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            if (!supabase) return;

            const { data: partyData } = await supabase
                .from('parties')
                .select(`*, host:profiles!parties_host_id_fkey(*)`)
                .eq('id', id)
                .single();

            if (partyData) setParty(partyData);

            const { data: membersData } = await supabase
                .from('party_members')
                .select(`
                    id,
                    guest_name,
                    user:profiles(*)
                `)
                .eq('party_id', id);

            if (membersData) {
                // Get all members that are in either Regular or OT list
                const allParticipantIds = Array.from(new Set([...selectedIds, ...otIds]));
                const filtered = membersData
                    .filter((m: any) => allParticipantIds.includes(m.id))
                    .map((m: any) => ({
                        id: m.id,
                        name: m.user ? (m.user.display_name || m.user.first_name) : (m.guest_name || "Guest"),
                        avatar_url: m.user?.avatar_url || null,
                        short_id: m.user?.short_id || "---",
                        isRegular: selectedIds.includes(m.id),
                        isOT: otIds.includes(m.id)
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
                <div className="flex items-center justify-between mb-6 safe-area-top">
                    <button onClick={() => router.back()} className="p-3 rounded-2xl bg-background border border-white/5 shadow-xl">
                        <Icons.chevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="font-bold text-lg text-white">สรุปค่าใช้จ่าย</h1>
                    <button className="p-3 rounded-2xl bg-background border border-white/5 shadow-xl opacity-50">
                        <Icons.share className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[120px] -z-10 rounded-full scale-75" />

                    <GlassCard className="border-white/10 overflow-hidden relative shadow-2xl bg-white/5 backdrop-blur-2xl px-0 py-0 rounded-[32px]">
                        <div className={cn("h-2 w-full", isOT ? "bg-blue-600" : "bg-primary")} />

                        <div className="p-8 text-center space-y-4 border-b border-dashed border-white/10">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-primary/20">
                                <Icons.coins className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Receipt Summary</h2>
                                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-60 mt-1">{party?.title || 'Badminton Session'}</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-4">
                            <div className="space-y-3">
                                {customItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center group">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{item.name}</span>
                                        <span className="font-black text-white italic tracking-tighter text-lg">{parseFloat(item.price).toLocaleString()}.-</span>
                                    </div>
                                ))}

                                <div className="pt-4 mt-2 border-t border-dashed border-white/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-black text-white uppercase italic tracking-tighter">ยอดรวมเรียกเก็บ</span>
                                        <span className="text-3xl font-black text-primary italic tracking-tighter">
                                            {total.toLocaleString()}.-
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/20 p-8 border-t border-white/10 space-y-6">
                            <h3 className="font-black text-xs text-white/40 uppercase tracking-[0.2em]">Breakdown ({selectedMembers.length} Person)</h3>
                            <div className="space-y-6">
                                {selectedMembers.map((member) => {
                                    const shareRecord = individualShares.find((s: any) => s.id === member.id);
                                    const memberTotal = shareRecord ? shareRecord.total : ((member.isRegular ? regularPerPerson : 0) + (member.isOT ? otPerPerson : 0));

                                    return (
                                        <div key={member.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Image
                                                        src={member.avatar_url || "/placeholder.svg"}
                                                        alt={member.name}
                                                        width={40} height={40}
                                                        className="rounded-full bg-white/5 border border-white/10"
                                                    />
                                                    {member.isRegular && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border border-background flex items-center justify-center text-[6px] font-black italic">R</div>}
                                                    {member.isOT && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 border border-background flex items-center justify-center text-[6px] font-black italic">OT</div>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white transition-colors">{member.name}</span>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                                        {member.isRegular && "REGULAR"}
                                                        {member.isRegular && member.isOT && " + "}
                                                        {member.isOT && "OT"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-lg font-black text-white italic tracking-tighter">{memberTotal.toLocaleString()}.-</span>
                                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Unpaid</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment QR Section (Mock) */}
                        <div className="p-8 border-t border-dashed border-white/10 text-center space-y-6">
                            <div className="w-48 h-48 bg-white rounded-[32px] p-4 flex items-center justify-center mx-auto">
                                <Icons.qrCode className="w-full h-full text-black" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-base font-black text-primary tracking-tighter italic">PROMPT PAY: 08X-XXX-XXXX</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50">
                                    {party?.host?.display_name || party?.host?.first_name || 'HOST'}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-background to-transparent pt-12 safe-area-bottom z-50">
                    <Button
                        onClick={() => router.push(`/party/${id}`)}
                        className="w-full h-14 bg-primary text-black font-black text-lg italic uppercase tracking-tighter rounded-2xl shadow-2xl shadow-primary/20"
                    >
                        เสร็จสิ้น (Finish)
                        <Icons.check className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </AppShell>
    );
}

export default function ReceiptPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Icons.spinner className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <ReceiptContent />
        </Suspense>
    );
}
