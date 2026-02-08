"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
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
  const [courtTotal, setCourtTotal] = useState<string>('');
  const [courtCount, setCourtCount] = useState<string>('');
  const [courtHours, setCourtHours] = useState<string>('');

  const [shuttleCount, setShuttleCount] = useState<string>('');
  const [shuttlePricePerUnit, setShuttlePricePerUnit] = useState<string>('');

  const [otherExpenses, setOtherExpenses] = useState<string>('');
  const [deductions, setDeductions] = useState<string>('');

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

        // Pre-selection from URL (Ranking page sends 'players' as member IDs)
        const preSelected = searchParams.get('players');
        if (preSelected) {
          const ids = preSelected.split(',');
          setSelectedMemberIds(new Set(ids));
        } else {
          // Default: Select all active members
          const activeIds = membersData.map((m: any) => m.id);
          setSelectedMemberIds(new Set(activeIds));
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [id, searchParams]);

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
    const court = parseFloat(courtTotal) || 0;
    const shuttle = (parseFloat(shuttleCount) || 0) * (parseFloat(shuttlePricePerUnit) || 0);
    const other = parseFloat(otherExpenses) || 0;
    const ded = parseFloat(deductions) || 0;
    return court + shuttle + other - ded;
  };

  const total = calculateTotal();
  const memberCount = selectedMemberIds.size;
  const perPerson = memberCount > 0 ? Math.ceil(total / memberCount) : 0;

  const handleSave = async () => {
    const queryParams = new URLSearchParams({
      court: courtTotal || '0',
      shuttle: ((parseFloat(shuttleCount) || 0) * (parseFloat(shuttlePricePerUnit) || 0)).toString(),
      total: total.toString(),
      perPerson: perPerson.toString(),
      memberCount: memberCount.toString(),
      customItems: JSON.stringify([
        { name: 'ค่าน้ำ / อื่นๆ', price: otherExpenses || '0' },
        { name: 'หักออก / รับเงินสด', price: `-${deductions || '0'}` }
      ].filter(i => parseFloat(i.price) !== 0)),
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
    <AppShell hideNav className="bg-[#f8f9fa]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 tap-highlight">
              <Icons.chevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="font-bold text-gray-800">หารค่าคอร์ท (ปกติ)</h1>
          </div>
          <button className="p-2 tap-highlight">
            <Icons.clock className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-20">
        {/* Visual Summary Card */}
        <div className="relative overflow-hidden group">
          <div className="bg-[#2e9d48] rounded-[2rem] p-8 text-white relative z-10 transition-transform active:scale-[0.99] shadow-lg shadow-green-900/10">
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-xs font-medium opacity-80">ยอดหารต่อคน</span>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black tracking-tighter">{perPerson.toLocaleString()}</span>
                <span className="text-2xl font-bold opacity-80 italic">฿</span>
              </div>
            </div>

            {/* Abstract background graphic mock */}
            <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
              <div className="w-32 h-32 border-[12px] border-white rounded-full"></div>
              <div className="w-32 h-32 border-[12px] border-white rounded-full translate-x-12 -translate-y-8"></div>
            </div>
          </div>

          {/* Summary Bar - Overlapping the green card base */}
          <div className="bg-white rounded-[1.5rem] mt-[-20px] mx-4 p-4 shadow-xl border border-gray-100 relative z-20 space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm font-bold text-gray-400">ยอดรวมทั้งหมด</span>
              <span className="text-xl font-black text-gray-800 italic">{total.toLocaleString()} ฿</span>
            </div>
            <Button
              onClick={handleSave}
              disabled={memberCount === 0 || total <= 0}
              className="w-full h-14 bg-[#ff9500] hover:bg-[#ff9500]/90 text-white font-black italic text-lg uppercase tracking-tighter rounded-2xl shadow-lg shadow-orange-500/20"
            >
              <Icons.document className="w-5 h-5 mr-2" />
              ออกบิล
            </Button>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <h2 className="font-black text-gray-800 uppercase tracking-tighter">รายละเอียดค่าใช้จ่าย</h2>
          </div>

          {/* Court Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#ff9500] px-1">
              <Icons.mapPin size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">ค่าเช่าคอร์ท</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-[3] bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
                <input
                  type="number"
                  className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none placeholder:text-gray-300 placeholder:font-normal"
                  placeholder="ใส่ยอดเต็มของค่าคอร์ททั้งหมดที่จ่ายไป"
                  value={courtTotal}
                  onChange={e => setCourtTotal(e.target.value)}
                />
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                <span className="absolute top-2 right-3 text-[8px] font-black text-gray-300 uppercase">คอร์ท</span>
                <input
                  type="number"
                  className="w-full h-14 px-3 bg-transparent font-bold text-gray-700 text-center outline-none"
                  value={courtCount}
                  onChange={e => setCourtCount(e.target.value)}
                />
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                <span className="absolute top-2 right-3 text-[8px] font-black text-gray-300 uppercase">ชม.</span>
                <input
                  type="number"
                  className="w-full h-14 px-3 bg-transparent font-bold text-gray-700 text-center outline-none"
                  value={courtHours}
                  onChange={e => setCourtHours(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Shuttle Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#ff9500] px-1">
              <Icons.shuttlecock size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">ค่าลูกแบด</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-bold text-gray-300">ลูก</span>
                <input
                  type="number"
                  className="w-full h-14 px-4 pr-10 bg-transparent font-bold text-gray-700 outline-none text-center"
                  value={shuttleCount}
                  onChange={e => setShuttleCount(e.target.value)}
                />
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-bold text-gray-300">บาท/ลูก</span>
                <input
                  type="number"
                  className="w-full h-14 px-4 pr-16 bg-transparent font-bold text-gray-700 outline-none text-center"
                  value={shuttlePricePerUnit}
                  onChange={e => setShuttlePricePerUnit(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end px-2">
              <span className="text-xs font-bold text-[#ff9500] uppercase italic tracking-tighter">
                รวม {((parseFloat(shuttleCount) || 0) * (parseFloat(shuttlePricePerUnit) || 0)).toLocaleString()} บาท
              </span>
            </div>
          </div>

          {/* Others Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#ff9500] px-1">
              <Icons.coins size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">ค่าน้ำ / อื่นๆ</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
              <input
                type="number"
                className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none"
                placeholder="0.00"
                value={otherExpenses}
                onChange={e => setOtherExpenses(e.target.value)}
              />
            </div>
          </div>

          {/* Deductions Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-500 px-1">
              <Icons.minus size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">หักออก / รับเงินสด</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
              <input
                type="number"
                className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none"
                placeholder="0.00"
                value={deductions}
                onChange={e => setDeductions(e.target.value)}
              />
            </div>
          </div>

          {/* Participants Section */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold flex items-center gap-2 text-gray-800">
                <Icons.users className="w-4 h-4 text-[#ff9500]" />
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
                className="text-[10px] font-black uppercase text-[#ff9500] tracking-widest"
              >
                {selectedMemberIds.size === members.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
              </button>
            </div>

            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                    selectedMemberIds.has(m.id)
                      ? "bg-white border-white shadow-md scale-[1.01]"
                      : "bg-white/40 border-transparent opacity-60 scale-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={m.user?.avatar_url || "/placeholder.svg"}
                        alt=""
                        width={40} height={40}
                        className="rounded-full bg-gray-100 border border-gray-100 shadow-sm"
                      />
                      {selectedMemberIds.has(m.id) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center ring-2 ring-white">
                          <Icons.check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-800">
                        {m.user?.display_name || m.user?.first_name || m.guest_name || "Guest"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                        ID: {m.user?.short_id || "---"}
                      </span>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedMemberIds.has(m.id)}
                    onCheckedChange={() => toggleMember(m.id)}
                    className="rounded-full data-[state=checked]:bg-[#2e9d48] border-gray-200 w-6 h-6"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
