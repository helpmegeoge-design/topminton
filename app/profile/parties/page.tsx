"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { LoadingShuttlecock } from "@/components/ui/loading-shuttlecock";

interface Party {
    id: string;
    title: string;
    court_name: string;
    date: string;
    start_time: string;
    end_time: string;
    current_players: number;
    max_players: number;
    price_per_person: number;
    status: string;
    host_id: string;
    member_count: number;
    is_host: boolean;
}

export default function MyPartiesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [myParties, setMyParties] = useState<Party[]>([]);
    const [joinedParties, setJoinedParties] = useState<Party[]>([]);
    const [activeTab, setActiveTab] = useState<'hosting' | 'joined'>('hosting');

    useEffect(() => {
        fetchParties();
    }, []);

    const fetchParties = async () => {
        setLoading(true);
        const supabase = createClient();
        if (!supabase) {
            setLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        // Fetch parties I'm hosting
        const { data: hosted } = await supabase
            .from('parties')
            .select(`
                *,
                courts(name, location)
            `)
            .eq('host_id', user.id)
            .order('date', { ascending: true });

        // Fetch parties I joined
        // IMPORTANT: We want to see ALL parties we joined, excluding the ones we host (because they are in Hosting tab)
        const { data: joined } = await supabase
            .from('party_members')
            .select(`
                party:parties!inner(
                    *,
                    courts(name, location)
                )
            `)
            .eq('user_id', user.id)
            .neq('party.host_id', user.id)
            .order('created_at', { ascending: false });

        if (hosted) {
            const hostedParties = hosted.map((p: any) => ({
                ...p,
                court_name: p.courts?.name || 'ไม่ระบุสนาม',
                is_host: true,
                member_count: p.current_players || 0
            }));
            setMyParties(hostedParties);
        }

        if (joined) {
            const joinedParties = joined
                .map((item: any) => item.party)
                .filter(Boolean)
                .map((p: any) => ({
                    ...p,
                    court_name: p.courts?.name || 'ไม่ระบุสนาม',
                    is_host: false,
                    member_count: p.current_players || 0
                }))
                // Sort by party date locally
                .sort((a: any, b: any) => new Date(`${a.date}T${a.start_time}`).getTime() - new Date(`${b.date}T${b.start_time}`).getTime());

            setJoinedParties(joinedParties);
        }

        setLoading(false);
    };

    const getStatusBadge = (party: Party) => {
        const partyDate = new Date(`${party.date}T${party.start_time}`);
        const now = new Date();

        if (party.status === 'cancelled') {
            return <Badge variant="destructive">ยกเลิก</Badge>;
        }
        if (partyDate < now) {
            return <Badge variant="secondary">เสร็จสิ้น</Badge>;
        }
        if (party.member_count >= party.max_players) {
            return <Badge className="bg-green-500">เต็มแล้ว</Badge>;
        }
        return <Badge className="bg-blue-500">กำลังรับสมัคร</Badge>;
    };

    const PartyCard = ({ party }: { party: Party }) => {
        const partyDate = new Date(`${party.date}T${party.start_time}`);

        return (
            <Link href={`/party/${party.id}`}>
                <GlassCard className="p-4 hover:border-primary/50 transition-all cursor-pointer">
                    <div className="flex gap-3">
                        {/* Date Badge */}
                        <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                            <div className="text-2xl font-bold text-primary">
                                {format(partyDate, 'd', { locale: th })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {format(partyDate, 'MMM', { locale: th })}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-foreground truncate">
                                    {party.title}
                                </h3>
                                {getStatusBadge(party)}
                            </div>

                            <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Icons.mapPin size={14} />
                                    <span className="truncate">{party.court_name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Icons.clock size={14} />
                                    <span>{party.start_time} - {party.end_time}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Icons.users size={14} />
                                    <span>{party.member_count}/{party.max_players} คน</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                                <span className="text-sm font-semibold text-primary">
                                    ฿{party.price_per_person}/คน
                                </span>
                                {party.is_host && (
                                    <Link
                                        href={`/party/${party.id}/manage`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        จัดการก๊วน →
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </Link>
        );
    };

    return (
        <AppShell>
            <div className="min-h-screen bg-background pb-20">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
                    <div className="flex items-center gap-3 px-4 h-14">
                        <button onClick={() => router.back()} className="p-2 -ml-2">
                            <Icons.chevronLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-foreground">จัดการก๊วนของฉัน</h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setActiveTab('hosting')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'hosting'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground'
                                }`}
                        >
                            ก๊วนที่ฉันจัด ({myParties.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('joined')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'joined'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground'
                                }`}
                        >
                            ที่เข้าร่วม ({joinedParties.length})
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="p-4 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingShuttlecock />
                        </div>
                    ) : activeTab === 'hosting' ? (
                        myParties.length === 0 ? (
                            <div className="text-center py-12">
                                <Icons.users size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    ยังไม่มีก๊วนที่จัด
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    สร้างก๊วนแรกของคุณเพื่อชวนเพื่อนมาตีแบดกัน!
                                </p>
                                <Button onClick={() => router.push('/party/create')}>
                                    <Icons.plus size={18} className="mr-2" />
                                    สร้างก๊วนใหม่
                                </Button>
                            </div>
                        ) : (
                            myParties.map((party) => <PartyCard key={party.id} party={party} />)
                        )
                    ) : (
                        joinedParties.length === 0 ? (
                            <div className="text-center py-12">
                                <Icons.users size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    ยังไม่ได้เข้าร่วมก๊วนใด
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    ไปหาก๊วนที่สนใจและเข้าร่วมกันเลย!
                                </p>
                                <Button variant="outline" onClick={() => router.push('/')}>
                                    <Icons.search size={18} className="mr-2" />
                                    ค้นหาก๊วน
                                </Button>
                            </div>
                        ) : (
                            joinedParties.map((party) => <PartyCard key={party.id} party={party} />)
                        )
                    )}
                </main>
            </div>
        </AppShell>
    );
}
