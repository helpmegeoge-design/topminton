"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

  // --- Regular Session State ---
  const [courtTotal, setCourtTotal] = useState<string>('');
  const [courtCount, setCourtCount] = useState<string>('');
  const [courtHours, setCourtHours] = useState<string>('');
  const [shuttleCount, setShuttleCount] = useState<string>('');
  const [shuttlePricePerUnit, setShuttlePricePerUnit] = useState<string>('');
  const [otherExpenses, setOtherExpenses] = useState<string>('');
  const [deductions, setDeductions] = useState<string>('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

  // --- OT Session State ---
  const [isOTEnabled, setIsOTEnabled] = useState(false);
  const [otCourtTotal, setOtCourtTotal] = useState<string>('');
  const [otCourtCount, setOtCourtCount] = useState<string>('');
  const [otCourtHours, setOtCourtHours] = useState<string>('');
  const [otShuttleCount, setOtShuttleCount] = useState<string>('');
  const [otShuttlePricePerUnit, setOtShuttlePricePerUnit] = useState<string>('');
  const [otOtherExpenses, setOtOtherExpenses] = useState<string>('');
  const [otDeductions, setOtDeductions] = useState<string>('');
  const [otMemberIds, setOtMemberIds] = useState<Set<string>>(new Set());
  const [memberHours, setMemberHours] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data: partyData } = await supabase.from('parties').select('*').eq('id', id).single();
      if (partyData) setParty(partyData);

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

        const preSelected = searchParams.get('players');
        if (preSelected) {
          const ids = preSelected.split(',');
          setSelectedMemberIds(new Set(ids));
        } else {
          setSelectedMemberIds(new Set(membersData.map((m: any) => m.id)));
        }

        // Initialize Hours to 1 for everyone
        const initialHours: Record<string, string> = {};
        membersData.forEach((m: any) => {
          initialHours[m.id] = "1";
        });
        setMemberHours(initialHours);
      }

      setLoading(false);
    };
    fetchData();
  }, [id, searchParams]);

  // --- Calculations ---
  const getRegularTotal = () => {
    const court = parseFloat(courtTotal) || 0;
    const shuttle = (parseFloat(shuttleCount) || 0) * (parseFloat(shuttlePricePerUnit) || 0);
    const other = parseFloat(otherExpenses) || 0;
    const ded = parseFloat(deductions) || 0;
    return court + shuttle + other - ded;
  };

  const getOTTotal = () => {
    if (!isOTEnabled) return 0;
    const court = parseFloat(otCourtTotal) || 0;
    const shuttle = (parseFloat(otShuttleCount) || 0) * (parseFloat(otShuttlePricePerUnit) || 0);
    const other = parseFloat(otOtherExpenses) || 0;
    const ded = parseFloat(otDeductions) || 0;
    return court + shuttle + other - ded;
  };

  const regularTotal = getRegularTotal();
  const totalRegularHours = Array.from(selectedMemberIds).reduce((acc, mid) => acc + (parseFloat(memberHours[mid]) || 0), 0);
  const regularRatePerHour = totalRegularHours > 0 ? (regularTotal / totalRegularHours) : 0;
  // Placeholder average for card
  const regularAvgPerPerson = selectedMemberIds.size > 0 ? (regularTotal / selectedMemberIds.size) : 0;

  const otTotal = getOTTotal();
  const otPerPerson = otMemberIds.size > 0 ? Math.ceil(otTotal / otMemberIds.size) : 0;

  const handleSave = async () => {
    // Calculate individual shares
    const shares = members.map(m => {
      const isNormal = selectedMemberIds.has(m.id);
      const isOT = otMemberIds.has(m.id);
      const hours = parseFloat(memberHours[m.id]) || 0;
      const regShare = isNormal ? (regularRatePerHour * hours) : 0;
      const otShare = isOT ? otPerPerson : 0;
      return {
        id: m.id,
        total: Math.ceil(regShare + otShare)
      };
    });

    const queryParams = new URLSearchParams({
      court: courtTotal || '0',
      shuttle: ((parseFloat(shuttleCount) || 0) * (parseFloat(shuttlePricePerUnit) || 0)).toString(),
      total: (regularTotal + otTotal).toString(),
      perPerson: regularAvgPerPerson.toFixed(0),
      memberCount: selectedMemberIds.size.toString(),
      customItems: JSON.stringify([
        { name: 'ค่าน้ำ / อื่นๆ', price: otherExpenses || '0' },
        { name: 'หักออก / รับเงินสด', price: `-${deductions || '0'}` },
        ...(isOTEnabled ? [{ name: 'ยอดต่อเวลาคงเหลือ', price: otTotal.toString() }] : [])
      ].filter(i => parseFloat(i.price) !== 0)),
      selectedIds: Array.from(selectedMemberIds).join(','),
      isOT: isOTEnabled.toString(),
      otTotal: otTotal.toString(),
      otIds: Array.from(otMemberIds).join(','),
      otPerPerson: otPerPerson.toString(),
      individualShares: JSON.stringify(shares)
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
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 tap-highlight">
              <Icons.chevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="font-bold text-gray-800">หารค่าคอร์ท</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const names = members.map(m => m.user?.display_name || m.user?.first_name || m.guest_name || "Guest");
                const query = new URLSearchParams({
                  players: names.join(','),
                  fromParty: id
                });
                router.push(`/tools/cost-calculator?${query.toString()}`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100 transition-all active:scale-95"
            >
              <Icons.calculator className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase">ใช้เครื่องคิดเลข (Manual)</span>
            </button>
            <div className="flex items-center gap-2">
              <Label htmlFor="ot-mode" className="text-[10px] font-black uppercase text-gray-400">โหมดต่อเวลา</Label>
              <Switch id="ot-mode" checked={isOTEnabled} onCheckedChange={setIsOTEnabled} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-32">
        {/* Summary Card */}
        <div className="relative overflow-hidden">
          <div className={cn(
            "rounded-[2rem] p-8 text-white relative z-10 transition-colors duration-500 shadow-xl",
            isOTEnabled ? "bg-blue-600" : "bg-[#2e9d48]"
          )}>
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-xs font-medium opacity-80">
                {isOTEnabled ? "ยอดหารประมาณ (ปกติ + OT)" : "ยอดหารโดยเฉลี่ย"}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black tracking-tighter">
                  {(regularAvgPerPerson + otPerPerson).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-2xl font-bold opacity-80 italic">฿</span>
              </div>
              {isOTEnabled && (
                <div className="text-[10px] font-bold opacity-70 bg-white/10 px-3 py-1 rounded-full mt-2">
                  ปกติเฉลี่ย {regularAvgPerPerson.toFixed(0)}.- | OT {otPerPerson}.-
                </div>
              )}
            </div>
            <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
              <div className="w-32 h-32 border-[12px] border-white rounded-full"></div>
              <div className="w-32 h-32 border-[12px] border-white rounded-full translate-x-12 -translate-y-8"></div>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] mt-[-20px] mx-4 p-4 shadow-xl border border-gray-100 relative z-20 space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">ยอดรวมทั้งหมด</span>
              <span className="text-xl font-black text-gray-800 italic">{(regularTotal + otTotal).toLocaleString()} ฿</span>
            </div>
            <Button
              onClick={handleSave}
              disabled={selectedMemberIds.size === 0 || (regularTotal + otTotal) <= 0}
              className={cn(
                "w-full h-14 text-white font-black italic text-lg uppercase tracking-tighter rounded-2xl shadow-lg transition-colors",
                isOTEnabled ? "bg-orange-500 shadow-orange-500/20" : "bg-[#ff9500] shadow-orange-500/20"
              )}
            >
              <Icons.document className="w-5 h-5 mr-2" />
              ออกบิล
            </Button>
          </div>
        </div>

        {/* Section: Normal Costs */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <h2 className="font-black text-gray-800 uppercase tracking-tighter">รายละเอียดค่าใช้จ่าย (ปกติ)</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#2e9d48] px-1 font-bold">
              <Icons.mapPin size={14} />
              <span className="text-[10px] uppercase tracking-wider">ค่าเช่าคอร์ท (ปกติ)</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-[3] bg-white rounded-2xl border border-gray-100 p-1 shadow-sm focus-within:ring-2 focus-within:ring-[#2e9d48]/20 transition-all">
                <input
                  type="number"
                  className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none placeholder:text-gray-300"
                  placeholder="ยอดค่าคอร์ททั้งหมด"
                  value={courtTotal}
                  onChange={e => setCourtTotal(e.target.value)}
                />
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                <span className="absolute top-2 right-3 text-[7px] font-black text-gray-300 uppercase">คอร์ท</span>
                <input type="number" className="w-full h-14 px-3 bg-transparent font-bold text-gray-700 text-center outline-none" value={courtCount} onChange={e => setCourtCount(e.target.value)} />
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                <span className="absolute top-2 right-3 text-[7px] font-black text-gray-300 uppercase">ชม.</span>
                <input type="number" className="w-full h-14 px-3 bg-transparent font-bold text-gray-700 text-center outline-none" value={courtHours} onChange={e => setCourtHours(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#2e9d48] px-1 font-bold">
              <Icons.shuttlecock size={14} />
              <span className="text-[10px] uppercase tracking-wider">ค่าลูกแบด (ปกติ)</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-bold text-gray-300 italic">ลูก</span>
                <input type="number" className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none text-center" value={shuttleCount} onChange={e => setShuttleCount(e.target.value)} />
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-bold text-gray-300 italic">฿/ลูก</span>
                <input type="number" className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none text-center" value={shuttlePricePerUnit} onChange={e => setShuttlePricePerUnit(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Section: OT Costs (Only visible if OT mode active) */}
        {isOTEnabled && (
          <div className="space-y-6 pt-6 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="font-black text-blue-600 uppercase tracking-tighter">รายละเอียดค่าใช้จ่าย (ต่อเวลา)</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600 px-1 font-bold">
                <Icons.mapPin size={14} />
                <span className="text-[10px] uppercase tracking-wider">ค่าเช่าคอร์ท (OT)</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-[3] bg-white rounded-2xl border border-blue-100 p-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-600/20">
                  <input
                    type="number"
                    className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none"
                    placeholder="ยอดค่าคอร์ทช่วง OT"
                    value={otCourtTotal}
                    onChange={e => setOtCourtTotal(e.target.value)}
                  />
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                  <span className="absolute top-2 right-3 text-[7px] font-black text-gray-300 uppercase">คอร์ท</span>
                  <input type="number" className="w-full h-14 px-3 bg-transparent font-bold text-gray-700 text-center outline-none" value={otCourtCount} onChange={e => setOtCourtCount(e.target.value)} />
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                  <span className="absolute top-2 right-3 text-[7px] font-black text-gray-300 uppercase">ชม.</span>
                  <input type="number" className="w-full h-14 px-3 bg-transparent font-bold text-gray-700 text-center outline-none" value={otCourtHours} onChange={e => setOtCourtHours(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600 px-1 font-bold">
                <Icons.shuttlecock size={14} />
                <span className="text-[10px] uppercase tracking-wider">ค่าลูกแบด (OT)</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-bold text-gray-300 italic">ลูก</span>
                  <input type="number" className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none text-center" value={otShuttleCount} onChange={e => setOtShuttleCount(e.target.value)} />
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative">
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-bold text-gray-300 italic">฿/ลูก</span>
                  <input type="number" className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none text-center" value={otShuttlePricePerUnit} onChange={e => setOtShuttlePricePerUnit(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Extra items (shared) */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-400 px-1 font-bold">
              <Icons.coins size={14} />
              <span className="text-[10px] uppercase tracking-wider">ค่าน้ำ / อื่นๆ</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
              <input type="number" className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none" placeholder="0.00" value={otherExpenses} onChange={e => setOtherExpenses(e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-400 px-1 font-bold">
              <Icons.minus size={14} />
              <span className="text-[10px] uppercase tracking-wider">หักออก / รับเงินสด</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
              <input type="number" className="w-full h-14 px-4 bg-transparent font-bold text-gray-700 outline-none" placeholder="0.00" value={deductions} onChange={e => setDeductions(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section: Participants with OT Toggles */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold flex items-center gap-2 text-gray-800">
              <Icons.users className="w-4 h-4 text-[#ff9500]" />
              รายชื่อคนหาร
            </h2>
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest text-center">ชม. ที่เล่น / เลือก OT</span>
              <span className="text-[10px] font-black uppercase text-green-600 tracking-widest text-center">หารปกติ</span>
            </div>
          </div>

          <div className="space-y-2">
            {members.map((m) => {
              const isOT = otMemberIds.has(m.id);
              const isNormal = selectedMemberIds.has(m.id);
              const hours = parseFloat(memberHours[m.id]) || 0;
              const individualTotal = Math.ceil((isNormal ? (regularRatePerHour * hours) : 0) + (isOT ? otPerPerson : 0));

              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex items-center justify-between p-3 py-4 rounded-2xl border transition-all",
                    isNormal || isOT ? "bg-white border-white shadow-md scale-[1.01]" : "bg-white/40 border-transparent opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image src={m.user?.avatar_url || "/placeholder.svg"} alt="" width={40} height={40} className="rounded-full bg-gray-100 border border-gray-100 shadow-sm" />
                      {isNormal && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center ring-2 ring-white font-black text-[8px]">✓</div>}
                      {isOT && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center ring-2 ring-white font-black text-[8px]">OT</div>}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-800 truncate w-32">
                        {m.user?.display_name || m.user?.first_name || m.guest_name || "Guest"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] font-black text-gray-800 italic">
                          {individualTotal.toLocaleString()}.-
                        </span>
                        {(isNormal || isOT) && (
                          <span className="text-[8px] text-gray-400 font-bold uppercase">
                            ({isNormal ? "R" : ""}{isNormal && isOT ? "+" : ""}{isOT ? "OT" : ""})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className={cn(
                          "w-10 h-10 rounded-xl border text-center font-black text-sm outline-none transition-colors",
                          isOT || isNormal ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-gray-50 border-gray-100 text-gray-300"
                        )}
                        value={memberHours[m.id] || "1"}
                        onChange={(e) => setMemberHours({ ...memberHours, [m.id]: e.target.value })}
                      />
                      <Checkbox
                        checked={isOT}
                        onCheckedChange={(checked) => {
                          const next = new Set(otMemberIds);
                          checked ? next.add(m.id) : next.delete(m.id);
                          setOtMemberIds(next);
                        }}
                        className="rounded-lg data-[state=checked]:bg-blue-600 border-gray-200 w-6 h-6"
                      />
                    </div>
                    <Checkbox
                      checked={isNormal}
                      onCheckedChange={(checked) => {
                        const next = new Set(selectedMemberIds);
                        checked ? next.add(m.id) : next.delete(m.id);
                        setSelectedMemberIds(next);
                      }}
                      className="rounded-lg data-[state=checked]:bg-[#2e9d48] border-gray-200 w-6 h-6"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
