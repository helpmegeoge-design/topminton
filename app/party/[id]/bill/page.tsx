"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BillPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const router = useRouter();
  const [party, setParty] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bill State
  const [courtPrice, setCourtPrice] = useState<string>('');
  const [shuttlePrice, setShuttlePrice] = useState<string>('');
  const [customItems, setCustomItems] = useState<{ name: string, price: string }[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // Selection state
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      if (!supabase) return;

      // 1. Fetch Party
      const { data: partyData } = await supabase.from('parties').select('*').eq('id', id).single();
      if (partyData) {
        setParty(partyData);
      }

      // 2. Fetch Members
      const { data: membersData } = await supabase
        .from('party_members')
        .select(`
                    id,
                    user_id,
                    guest_name,
                    user:profiles!user_id(id, display_name, first_name, avatar_url, short_id)
                `)
        .eq('party_id', id);

      if (membersData) {
        setMembers(membersData);

        // Pre-selection from URL
        const preSelected = searchParams.get('players');
        if (preSelected) {
          const ids = preSelected.split(',');
          setSelectedMemberIds(new Set(ids));
        } else {
          // Default: Select all active members (participating)
          const activeIds = membersData.map((m: any) => m.id);
          setSelectedMemberIds(new Set(activeIds));
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [id, searchParams]);

  const handleAddItem = () => {
    if (newItemName && newItemPrice) {
      setCustomItems([...customItems, { name: newItemName, price: newItemPrice }]);
      setNewItemName('');
      setNewItemPrice('');
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...customItems];
    newItems.splice(index, 1);
    setCustomItems(newItems);
  };

  const toggleMember = (memberId: string) => {
    const next = new Set(selectedMemberIds);
    if (next.has(memberId)) {
      next.delete(memberId);
    } else {
      next.add(memberId);
    }
    setSelectedMemberIds(next);
  };

  const calculateTotal = () => {
    const c = parseFloat(courtPrice) || 0;
    const s = parseFloat(shuttlePrice) || 0;
    const customs = customItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
    return c + s + customs;
  };

  const total = calculateTotal();
  const memberCount = selectedMemberIds.size;
  const perPerson = memberCount > 0 ? Math.ceil(total / memberCount) : 0;

  const handleSave = async () => {
    const queryParams = new URLSearchParams({
      court: courtPrice || '0',
      shuttle: shuttlePrice || '0',
      total: total.toString(),
      perPerson: perPerson.toString(),
      memberCount: memberCount.toString(),
      customItems: JSON.stringify(customItems),
      selectedIds: Array.from(selectedMemberIds).join(',')
    });

    router.push(`/party/${id}/receipt?${queryParams.toString()}`);
  };

  if (loading) return (
    <AppShell hideNav>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icons.spinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    </AppShell>
  );

  return (
    <AppShell hideNav>
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 safe-area-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.back()} className="p-2 -ml-2 tap-highlight">
            <Icons.chevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-bold text-lg text-white">คำนวณค่าใช้จ่าย</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-48">
        {/* Costs Section */}
        <div className="space-y-4">
          <GlassCard className="p-4 space-y-4 border-white/5 bg-white/5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Icons.coins className="w-4 h-4 text-yellow-500" />
              สรุปยอดรวม
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ค่าคอร์ท</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="0"
                    value={courtPrice}
                    onChange={e => setCourtPrice(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase">THB</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ค่าลูกแบด</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold focus:ring-1 focus:ring-primary outline-none"
                    placeholder="0"
                    value={shuttlePrice}
                    onChange={e => setShuttlePrice(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase">THB</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-white/5 bg-white/5 space-y-4">
            <h2 className="font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Icons.plus className="w-4 h-4 text-primary" />
                รายการเพิ่มเติม
              </span>
              <span className="text-[10px] font-black opacity-30 uppercase">{customItems.length} รายการ</span>
            </h2>

            <div className="space-y-2">
              {customItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-black">Expense Item</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-primary">{parseFloat(item.price).toLocaleString()}.-</span>
                    <button onClick={() => removeItem(idx)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">
                      <Icons.close className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                className="flex-1 h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                placeholder="เช่น ค่าน้ำ, ค่าของกิน"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
              />
              <input
                type="number"
                className="w-24 h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white font-bold focus:ring-1 focus:ring-primary outline-none"
                placeholder="0"
                value={newItemPrice}
                onChange={e => setNewItemPrice(e.target.value)}
              />
              <button
                onClick={handleAddItem}
                className="w-11 h-11 bg-primary text-black rounded-xl flex items-center justify-center disabled:opacity-50 transition-all active:scale-95"
                disabled={!newItemName || !newItemPrice}
              >
                <Icons.plus className="w-5 h-5" />
              </button>
            </div>
          </GlassCard>

          {/* Member Selection Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Icons.users className="w-4 h-4 text-blue-500" />
                รายชื่อคนหาร ({memberCount})
              </h2>
              <button
                onClick={() => {
                  if (selectedMemberIds.size === members.length) {
                    setSelectedMemberIds(new Set());
                  } else {
                    setSelectedMemberIds(new Set(members.map(m => m.id)));
                  }
                }}
                className="text-[10px] font-black uppercase text-primary tracking-widest"
              >
                {selectedMemberIds.size === members.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98]",
                    selectedMemberIds.has(m.id)
                      ? "bg-primary/10 border-primary/20"
                      : "bg-white/5 border-white/5 opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={m.user?.avatar_url || "/placeholder.svg"}
                        alt=""
                        width={36} height={36}
                        className="rounded-full bg-muted border border-white/10"
                      />
                      {selectedMemberIds.has(m.id) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-black rounded-full flex items-center justify-center ring-2 ring-background">
                          <Icons.check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white">
                        {m.user?.display_name || m.user?.first_name || m.guest_name || "Guest"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-black uppercase">
                        ID: {m.user?.short_id || "---"}
                      </span>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedMemberIds.has(m.id)}
                    onCheckedChange={() => toggleMember(m.id)}
                    className="rounded-full data-[state=checked]:bg-primary w-5 h-5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-2xl border-t border-white/10 z-50 safe-area-bottom">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-baseline px-2">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">ยอดรวมทั้งหมด</span>
            <span className="text-2xl font-black text-white italic tracking-tighter">
              {total.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs not-italic font-bold text-muted-foreground ml-1">บาท</span>
            </span>
          </div>
          <GlassCard className="bg-primary p-4 border-none shadow-xl shadow-primary/20">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-black/40 uppercase tracking-tighter">หารเฉลี่ย {memberCount} คน</span>
                <span className="text-3xl font-black text-black tracking-tighter italic">
                  {perPerson.toLocaleString()}.-
                </span>
              </div>
              <Button
                onClick={handleSave}
                disabled={memberCount === 0 || total === 0}
                className="bg-black text-primary hover:bg-black/90 h-14 px-8 rounded-2xl font-black italic uppercase tracking-tighter shadow-lg disabled:opacity-50"
              >
                เก็บเงิน
                <Icons.chevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
