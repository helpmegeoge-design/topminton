"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/icons";
import Link from "next/link";

export default function BillPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [party, setParty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Bill State
  const [courtPrice, setCourtPrice] = useState<string>('');
  const [shuttlePrice, setShuttlePrice] = useState<string>('');
  const [customItems, setCustomItems] = useState<{ name: string, price: string }[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  useEffect(() => {
    const fetchParty = async () => {
      const supabase = createClient();
      if (!supabase) return;
      const { data } = await supabase.from('parties').select('*').eq('id', id).single();
      if (data) {
        setParty(data);
        // Pre-fill if already saved (assuming we might save expense items later)
      }
      setLoading(false);
    };
    fetchParty();
  }, [id]);

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

  const calculateTotal = () => {
    const c = parseFloat(courtPrice) || 0;
    const s = parseFloat(shuttlePrice) || 0;
    const customs = customItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
    return c + s + customs;
  };

  const total = calculateTotal();
  // Assume we fetch members count dynamically, for now mock or simple assumption
  // In real app, we need to fetch party_members count
  const memberCount = party?.current_players || 1;
  const perPerson = memberCount > 0 ? Math.ceil(total / memberCount) : 0;

  const handleSave = async () => {
    // In a real app, we would save these expenses to the `expense_items` table in Supabase here.
    // For now, we will pass the data to the receipt page to display.

    const queryParams = new URLSearchParams({
      court: courtPrice || '0',
      shuttle: shuttlePrice || '0',
      total: total.toString(),
      perPerson: perPerson.toString(),
      memberCount: memberCount.toString(),
      // customItems could be passed as JSON string if not too long, or saved to context/db
      customItems: JSON.stringify(customItems)
    });

    router.push(`/party/${id}/receipt?${queryParams.toString()}`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <AppShell hideNav>
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border safe-area-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href={`/party/${id}`} className="p-2 -ml-2 tap-highlight">
            <Icons.chevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-semibold text-lg">คิดเงิน</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-32">
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold mb-3">ค่าใช้จ่ายพื้นฐาน</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">ค่าคอร์ท</label>
                <input
                  type="number"
                  className="w-full p-3 rounded-lg bg-background border border-border"
                  placeholder="0.00"
                  value={courtPrice}
                  onChange={e => setCourtPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">ค่าลูกแบด</label>
                <input
                  type="number"
                  className="w-full p-3 rounded-lg bg-background border border-border"
                  placeholder="0.00"
                  value={shuttlePrice}
                  onChange={e => setShuttlePrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold mb-3">รายการเพิ่มเติม</h2>
            <div className="space-y-2 mb-3">
              {customItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded-lg">
                  <span>{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span>{item.price}</span>
                    <button onClick={() => removeItem(idx)} className="text-destructive">
                      <Icons.close className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 p-2 rounded-lg bg-background border border-border text-sm"
                placeholder="ชื่อรายการ (เช่น น้ำดื่ม)"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
              />
              <input
                type="number"
                className="w-20 p-2 rounded-lg bg-background border border-border text-sm"
                placeholder="ราคา"
                value={newItemPrice}
                onChange={e => setNewItemPrice(e.target.value)}
              />
              <button
                onClick={handleAddItem}
                className="p-2 bg-primary text-primary-foreground rounded-lg"
                disabled={!newItemName || !newItemPrice}
              >
                <Icons.plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-bottom">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-muted-foreground">ยอดรวมทั้งหมด</span>
          <span className="font-semibold text-lg">{total.toFixed(2)} บาท</span>
        </div>
        <div className="flex justify-between mb-4 text-sm">
          <span className="text-muted-foreground">สมาชิก {memberCount} คน ตกคนละ</span>
          <span className="font-semibold text-primary text-xl">{perPerson.toFixed(2)} บาท</span>
        </div>
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
        >
          ยืนยันและเรียกเก็บเงิน
        </button>
      </div>
    </AppShell>
  );
}
