"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/icons";
import Link from "next/link";
import Image from "next/image";

export default function ReceiptPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const router = useRouter();

    const [party, setParty] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Bill Data from URL
    const courtPrice = parseFloat(searchParams.get('court') || '0');
    const shuttlePrice = parseFloat(searchParams.get('shuttle') || '0');
    const total = parseFloat(searchParams.get('total') || '0');
    const perPerson = parseFloat(searchParams.get('perPerson') || '0');
    const memberCount = parseInt(searchParams.get('memberCount') || '1');
    const customItems = JSON.parse(searchParams.get('customItems') || '[]');

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            if (!supabase) return;

            // Fetch Party & Host
            const { data: partyData } = await supabase
                .from('parties')
                .select(`*, host:profiles(*)`)
                .eq('id', id)
                .single();

            if (partyData) {
                setParty(partyData);
            }

            // Fetch Members
            const { data: membersData } = await supabase
                .from('party_members')
                .select(`
            user:profiles(*)
        `)
                .eq('party_id', id);

            if (membersData) {
                setMembers(membersData.map((m: any) => m.user));
            }

            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center">กำลังสร้างใบเสร็จ...</div>;

    return (
        <AppShell hideNav>
            <div className="min-h-screen bg-muted/30 p-4 pb-24">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-4 safe-area-top">
                    <button onClick={() => router.back()} className="p-2 rounded-full bg-background shadow-sm border border-border">
                        <Icons.close className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full bg-background shadow-sm border border-border">
                        <Icons.share className="w-5 h-5" />
                    </button>
                </div>

                {/* Receipt Card */}
                <div className="bg-background rounded-2xl shadow-lg border border-border overflow-hidden relative">
                    {/* Rip effect top (visual) */}
                    <div className="h-2 bg-primary/80 w-full" />

                    <div className="p-6 text-center border-b border-dashed border-border">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Icons.document className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-xl font-bold mb-1">สรุปค่าใช้จ่าย</h1>
                        <p className="text-sm text-muted-foreground">{party?.title || 'รายการตีแบด'}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                            {new Date().toLocaleDateString('th-TH', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </div>
                    </div>

                    {/* Bill Details */}
                    <div className="p-6 space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ค่าคอร์ท</span>
                                <span>{courtPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ค่าลูกแบด</span>
                                <span>{shuttlePrice.toFixed(2)}</span>
                            </div>
                            {customItems.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between">
                                    <span className="text-muted-foreground">{item.name}</span>
                                    <span>{parseFloat(item.price).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t border-dashed border-border my-2 pt-2 flex justify-between font-bold text-lg">
                                <span>ยอดรวม</span>
                                <span>{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-muted/50 rounded-xl p-4 text-center">
                            <p className="text-sm text-muted-foreground mb-1">หารเฉลี่ย {memberCount} คน</p>
                            <p className="text-3xl font-bold text-primary">{perPerson.toFixed(2)} <span className="text-sm text-foreground font-normal">บาท/คน</span></p>
                        </div>
                    </div>

                    {/* Member Breakdown */}
                    <div className="bg-muted/30 p-6 border-t border-border">
                        <h3 className="font-semibold mb-4 text-sm">รายการเรียกเก็บ ({members.length} คน)</h3>
                        <div className="space-y-3">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={member.avatar_url || "/placeholder.svg"}
                                            alt={member.first_name}
                                            width={32} height={32}
                                            className="rounded-full bg-gray-200"
                                        />
                                        <span className="text-sm font-medium">{member.display_name || member.first_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">{perPerson.toFixed(0)}.-</span>
                                        <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center">
                                            {/* Status Icon (e.g. pending/paid) */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment QR (Mock) */}
                    <div className="p-6 border-t border-border text-center">
                        <p className="text-sm font-semibold mb-3">สแกนจ่ายเงิน</p>
                        <div className="w-40 h-40 bg-white border border-border mx-auto rounded-xl p-2 flex items-center justify-center">
                            <Icons.qrCode className="w-full h-full text-black" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">พร้อมเพย์: 08x-xxx-xxxx</p>
                        <p className="text-xs text-muted-foreground">{party?.host?.first_name} {party?.host?.last_name}</p>
                    </div>
                </div>

                {/* Action Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 safe-area-bottom">
                    <Link
                        href={`/party/${id}`}
                        className="block w-full py-3 bg-primary text-primary-foreground font-bold text-center rounded-xl shadow-lg"
                    >
                        เสร็จสิ้น
                    </Link>
                </div>
            </div>
        </AppShell>
    );
}
