"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, UsersIcon, CalendarIcon, ClockIcon, CameraIcon, InfoIcon, CourtIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { CounterInput } from "@/components/ui/counter-input";
import type { Level } from "@/components/ui/level-badge";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type PartyType = "find-partner" | "party";

const partyTypes = [
  {
    id: "find-partner" as const,
    label: "หาเพื่อนตี",
    description: "หาเพื่อนมาตีแบดด้วยกัน",
  },
  {
    id: "party" as const,
    label: "ก๊วน",
    description: "สร้างก๊วนรับสมาชิก",
  },
];

const paymentTypes = [
  { id: "split", label: "หารเท่า" },
  { id: "general", label: "ทั่วไป" },
  { id: "buffet", label: "บุฟเฟต์" },
  { id: "free", label: "ฟรี" },
];

const levelOptions: { id: Level; label: string }[] = [
  { id: "beginner", label: "หน้าบ้าน" },
  { id: "intermediate", label: "BG" },
  { id: "advanced", label: "N" },
  { id: "strong", label: "S" },
  { id: "pro", label: "P" },
  { id: "champion", label: "B-A" },
];

export default function CreatePartyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [partyType, setPartyType] = useState<PartyType>("party");
  const [creating, setCreating] = useState(false);

  // Data State
  const [courts, setCourts] = useState<any[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState("18:00");
  const [duration, setDuration] = useState("2");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [courtInfo, setCourtInfo] = useState(""); // extra info like court number
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [requireLevel, setRequireLevel] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<Level[]>([]);
  const [noWalkIn, setNoWalkIn] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [paymentType, setPaymentType] = useState("split");
  const [price, setPrice] = useState<number>(0);

  // Fetch courts and user profile
  useEffect(() => {
    const initData = async () => {
      const supabase = createClient();
      if (!supabase) return;

      // Fetch courts
      const { data: courtsData } = await supabase.from('courts').select('id, name');
      if (courtsData) setCourts(courtsData);

      // Fetch user profile for default name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('display_name, first_name').eq('id', user.id).single();
        if (profile) {
          const userName = profile.display_name || profile.first_name || "ฉัน";
          setName(`ก๊วนของ ${userName}`);
        }
      }
    };
    initData();
  }, []);

  const toggleLevel = (level: Level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleCreate = async () => {
    setCreating(true);
    const supabase = createClient();
    if (!supabase) {
      alert("Supabase not configured");
      setCreating(false);
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนสร้างก๊วน");
      router.push("/login"); // Redirect to login
      setCreating(false);
      return;
    }

    // Ensure Profile Exists (Auto-Repair for new users)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile || profileError) {
      console.log("Profile missing, auto-creating...");
      // Generate random Short ID
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const nums = "0123456789";
      const shortId =
        chars.charAt(Math.floor(Math.random() * chars.length)) +
        chars.charAt(Math.floor(Math.random() * chars.length)) +
        nums.charAt(Math.floor(Math.random() * nums.length)) +
        nums.charAt(Math.floor(Math.random() * nums.length)) +
        nums.charAt(Math.floor(Math.random() * nums.length));

      const { error: createProfileError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        display_name: user.email?.split('@')[0] || "User",
        first_name: "Member",
        short_id: shortId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (createProfileError) {
        console.error("Failed to auto-create profile:", createProfileError);
        alert("เกิดข้อผิดพลาดในการยืนยันตัวตน: " + createProfileError.message);
        setCreating(false);
        return;
      }
      // Continue flow after creating profile
    }

    // Calculate End Time
    const [startH, startM] = startTime.split(':').map(Number);
    const endH = startH + parseInt(duration);
    const endTime = `${String(endH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

    // Calculate court hours
    const courtHours = parseFloat(duration);

    const { data: party, error: partyError } = await supabase
      .from('parties')
      .insert({
        title: name,
        description: description || "",
        court_id: selectedCourt || null,
        host_id: user.id, // Real Host ID
        date: date,
        start_time: startTime + ":00",
        end_time: endTime + ":00",
        max_players: maxParticipants,
        current_players: 1, // Start with 1 (the host)
        skill_level: requireLevel && selectedLevels.length > 0 ? selectedLevels[0] : 'all',
        price_per_person: price,
        status: 'open',
        is_public: true,
        court_hours: courtHours
      })
      .select()
      .single();

    if (partyError) {
      console.error("Error creating party:", partyError);
      alert("เกิดข้อผิดพลาดในการสร้างก๊วน: " + partyError.message);
      setCreating(false);
      return;
    }

    if (party) {
      // Add host as a member
      const { error: memberError } = await supabase
        .from('party_members')
        .insert({
          party_id: party.id,
          user_id: user.id,
          status: 'confirmed', // Use standard enum value
          payment_status: 'paid'
        });

      if (memberError) {
        console.error("Error adding host as member:", memberError);
        // Fallback: try to delete the party if member addition fails to avoid zombie parties? 
        // For now just alert
        alert("สร้างก๊วนสำเร็จ แต่ไม่สามารถเพิ่มคุณเป็นสมาชิกได้ กรุณาติดต่อผุ้ดูแล");
      }

      router.push("/party"); // Go back to party list
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/party" className="tap-highlight">
            <ArrowLeftIcon size={24} className="text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground flex-1">
            สร้าง{partyType === "party" ? "ก๊วน" : "หาเพื่อนตี"}
          </h1>
          <span className="text-sm text-muted-foreground">
            {step}/3
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="p-4 space-y-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <>
            {/* Party Type */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-3">
                ประเภท
              </label>
              <div className="grid grid-cols-2 gap-3">
                {partyTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPartyType(type.id)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all tap-highlight text-left",
                      partyType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <UsersIcon size={24} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{type.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Court Selection */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                สถานที่ (สนาม)
              </label>
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>เลือกสนาม</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>{court.name}</option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  วันที่
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  เวลาเริ่ม
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                จำนวนชั่วโมง
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="1">1 ชั่วโมง</option>
                <option value="2">2 ชั่วโมง</option>
                <option value="3">3 ชั่วโมง</option>
                <option value="4">4 ชั่วโมง</option>
              </select>
            </div>
          </>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <>
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                ชื่อ{partyType === "party" ? "ก๊วน" : "ปาร์ตี้"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 200))}
                  placeholder="ตั้งชื่อให้จำง่าย"
                  className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {name.length}/200
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                รายละเอียด
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  placeholder="บอกรายละเอียดเพิ่มเติม..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                  {description.length}/500
                </span>
              </div>
            </div>

            {/* Court Number / Info */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                หมายเลขคอร์ท / รายละเอียดสนาม
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={courtInfo}
                  onChange={(e) => setCourtInfo(e.target.value.slice(0, 50))}
                  placeholder="เช่น คอร์ท 3-4"
                  className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <>
            {/* Max Participants */}
            <div>
              <CounterInput
                label="จำนวนคนสูงสุด"
                value={maxParticipants}
                onChange={setMaxParticipants}
                min={2}
                max={50}
                helperText={`ต้องการเพิ่มอีก ${maxParticipants} คน`}
              />
            </div>

            {/* Require Level */}
            <div className="p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">
                  ต้องการระดับฝีมือ
                </label>
                <button
                  type="button"
                  onClick={() => setRequireLevel(!requireLevel)}
                  className={cn(
                    "w-12 h-7 rounded-full transition-all duration-200",
                    requireLevel ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                      requireLevel ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {requireLevel && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                  {levelOptions.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => toggleLevel(level.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all tap-highlight",
                        selectedLevels.includes(level.id)
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Type */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-3">
                รูปแบบการเก็บเงิน
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {paymentTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPaymentType(type.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all tap-highlight",
                      paymentType === type.id
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-foreground block mb-2">
                  ราคาต่อคน (บาท)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border safe-area-bottom">
        <div className="flex items-center gap-3 px-4 py-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-xl border border-border font-medium text-foreground tap-highlight"
            >
              ย้อนกลับ
            </button>
          )}
          <button
            type="button"
            disabled={creating}
            onClick={async () => {
              if (step < 3) {
                setStep(step + 1);
              } else {
                await handleCreate();
              }
            }}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold tap-highlight disabled:opacity-50"
          >
            {creating ? "กำลังสร้าง..." : step < 3 ? "ถัดไป" : `สร้าง${partyType === "party" ? "ก๊วน" : "ปาร์ตี้"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
