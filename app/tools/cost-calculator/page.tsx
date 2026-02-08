"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import html2canvas from "html2canvas";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function CostCalculatorPage() {
    const searchParams = useSearchParams();
    const [courtPrice, setCourtPrice] = useState<string>("");
    const [shuttlePrice, setShuttlePrice] = useState<string>("");
    const [otherPrice, setOtherPrice] = useState<string>("");
    const [playerCount, setPlayerCount] = useState<string>("6");
    const [isCopied, setIsCopied] = useState(false);

    // Advanced Mode (Detailed calculation)
    const [showAdvanced, setShowAdvanced] = useState(false);
    // Bill View Mode
    const [showBill, setShowBill] = useState(false);
    const billRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [useTag, setUseTag] = useState(false); // Toggle for adding @ after names

    // Persistence & History State
    const supabase = createClient();
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [historyItems, setHistoryItems] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isViewingHistory, setIsViewingHistory] = useState(false);

    // Player List Mode
    interface PlayerItem {
        id: string;
        name: string;
        hours: string; // Changed to string to support "1.5" typing without state conflicts
        matchCount: number;
        isOvertime?: boolean;
        otHours?: string;
    }
    const [players, setPlayers] = useState<PlayerItem[]>([]);
    const [playerInput, setPlayerInput] = useState("");

    // Detailed Inputs
    const [hours, setHours] = useState<string>(""); // Session Default Hours
    const [courtCount, setCourtCount] = useState<string>("");
    // const [hourlyRate, setHourlyRate] = useState<string>("150"); // Removed as per request
    const [shuttleCount, setShuttleCount] = useState<string>("");
    const [shuttleRate, setShuttleRate] = useState<string>("");
    const [discount, setDiscount] = useState<string>("");

    // Overtime Inputs
    const [otCourtPrice, setOtCourtPrice] = useState<string>("");
    const [otHours, setOtHours] = useState<string>("");
    const [otCourtCount, setOtCourtCount] = useState<string>("");
    const [otShuttlePrice, setOtShuttlePrice] = useState<string>("");
    const [otShuttleCount, setOtShuttleCount] = useState<string>("");
    const [otShuttleRate, setOtShuttleRate] = useState<string>("");
    const [otOtherPrice, setOtOtherPrice] = useState<string>("");
    const [otDiscount, setOtDiscount] = useState<string>("");

    // Settings for Shuttle Mode (Simple Mode)
    const [shuttlePerMatchDivisor, setShuttlePerMatchDivisor] = useState<string>("4"); // Usually 4 people share 1 shuttle

    // Individual Bill Feature (Simple Mode)
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]); // Array of player IDs selected for individual bills
    const [showIndividualBill, setShowIndividualBill] = useState(false);
    const [selectedPlayerForBill, setSelectedPlayerForBill] = useState<PlayerItem | null>(null);

    // Mode Selection
    type CalculatorMode = 'menu' | 'standard' | 'simple';
    const [mode, setMode] = useState<CalculatorMode>('menu');

    // Handle initial players from query params
    useEffect(() => {
        const playersParam = searchParams.get('players');
        if (playersParam) {
            const names = playersParam.split(',').map(n => n.trim()).filter(n => n);
            if (names.length > 0) {
                const formattedInput = names.join('\n');
                setPlayerInput(formattedInput);
                parsePlayerNames(formattedInput);
                setMode('standard');
            }
        }
    }, [searchParams]);

    // --- HISTORY & PERSISTENCE LOGIC ---

    // Fetch History
    useEffect(() => {
        if (isHistoryOpen) {
            fetchHistory();
        }
    }, [isHistoryOpen]);

    const fetchHistory = async () => {
        if (!supabase) return;
        setIsLoadingHistory(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('cost_calculator_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setHistoryItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const loadHistoryItem = (item: any) => {
        const s = item.summary;
        if (!s) return;

        // Prevent auto-save from running while we load history
        setIsViewingHistory(true);

        if (s.courtPrice !== undefined) setCourtPrice(s.courtPrice);
        if (s.shuttlePrice !== undefined) setShuttlePrice(s.shuttlePrice);
        if (s.otherPrice !== undefined) setOtherPrice(s.otherPrice);
        if (s.playerCount !== undefined) setPlayerCount(s.playerCount);
        if (s.players !== undefined) {
            const defaultHours = s.hours || "1";
            setPlayers(s.players.map((p: any) => ({
                ...p,
                hours: (p.hours || defaultHours).toString(),
                matchCount: p.matchCount || 0,
                isOvertime: p.isOvertime || false,
                otHours: (p.otHours || "1").toString()
            })));
        }
        if (s.playerInput !== undefined) setPlayerInput(s.playerInput);
        if (s.hours !== undefined) setHours(s.hours);
        if (s.courtCount !== undefined) setCourtCount(s.courtCount);
        if (s.shuttleCount !== undefined) setShuttleCount(s.shuttleCount);
        if (s.shuttleRate !== undefined) setShuttleRate(s.shuttleRate);
        if (s.discount !== undefined) setDiscount(s.discount);
        if (s.shuttlePerMatchDivisor !== undefined) setShuttlePerMatchDivisor(s.shuttlePerMatchDivisor);
        if (s.mode !== undefined) setMode(s.mode);

        // OT Load
        if (s.otCourtPrice !== undefined) setOtCourtPrice(s.otCourtPrice);
        if (s.otHours !== undefined) setOtHours(s.otHours);
        if (s.otCourtCount !== undefined) setOtCourtCount(s.otCourtCount);
        if (s.otShuttlePrice !== undefined) setOtShuttlePrice(s.otShuttlePrice);
        if (s.otShuttleCount !== undefined) setOtShuttleCount(s.otShuttleCount);
        if (s.otShuttleRate !== undefined) setOtShuttleRate(s.otShuttleRate);
        if (s.otOtherPrice !== undefined) setOtOtherPrice(s.otOtherPrice);
        if (s.otDiscount !== undefined) setOtDiscount(s.otDiscount);

        toast.success("กำลังดูประวัติการคิดเงิน (โหมดอ่านอย่างเดียว)");
        setIsHistoryOpen(false);
        setShowBill(true);
    };

    const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!supabase) return;
        try {
            await supabase.from('cost_calculator_history').delete().eq('id', id);
            setHistoryItems(prev => prev.filter(i => i.id !== id));
            toast.success("ลบรายการเรียบร้อย");
        } catch (err) {
            toast.error("ลบรายการล้มเหลว");
        }
    };

    const saveHistorySnapshotNew = async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const state = getCurrentState();
        let currentTotal = 0;

        if (state.mode === 'simple') {
            const sv = parseInt(state.shuttlePerMatchDivisor) || 4;
            const sr = parseFloat(state.shuttleRate) || 0;
            const cp = parseFloat(state.courtPrice) || 0;

            // Simple mode total summation
            currentTotal = (state.players || []).reduce((sum: number, p: any) => {
                const ph = parseFloat(p.hours) || 0;
                const courtFee = Math.ceil((cp * ph) / sv);
                const shuttleFee = (p.matchCount || 0) * Math.ceil(sr / sv);
                return sum + courtFee + shuttleFee;
            }, 0);
        } else {
            currentTotal = total;
        }

        const { data: insertedData, error } = await supabase.from('cost_calculator_history').insert({
            user_id: user.id,
            summary: {
                ...state,
                // Optional: Inject calculated total into summary if needed for future use
                calculated_total_cost: currentTotal
            }
            // total_cost: currentTotal // Removed because column does not exist
        }).select();

        if (error) {
            console.error("Save history error details:", JSON.stringify(error, null, 2));
            toast.error("เกิดข้อผิดพลาดในการบันทึกประวัติ");
            return;
        }

        if (insertedData && insertedData.length > 0) {
            setHistoryItems(prev => [insertedData[0], ...prev]);
        } else {
            // Fallback: If select failed to return data (e.g. RLS pending), fetch latest
            fetchHistory();
        }
    };

    const saveHistorySnapshot = async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const state = getCurrentState();
        // Calculate total for history meta
        let currentTotal = 0;
        if (state.mode === 'simple') {
            state.players.forEach((p) => {
                // Duplicate simple logic here or use helper if standard
                // Re-calculating cost here to be safe or just use pre-calculated total state if available
                // Let's use the UI total logic
                const sv = parseInt(state.shuttlePerMatchDivisor) || 4;
                const sr = parseFloat(state.shuttleRate) || 0;
                const cp = parseFloat(state.courtPrice) || 0;
                const discount = parseFloat(state.discount) || 0; // Usually discount is global, but per player logic varies

                // Simple cost per player re-calc
                const ph = parseFloat(p.hours) || 0;
                const courtFee = Math.ceil((cp * ph) / sv);
                const shuttleFee = (p.matchCount || 0) * Math.ceil(sr / sv);
                let cost = courtFee + shuttleFee;
                currentTotal += cost;
            });
        } else {
            // Standard logic fallback (just approximate or use global total variable from component scope if accessible)
            // Since this running inside component, we can use 'total' state variable directly?
            // No, total state variable might be stale or from render cycle. Better to use current vars.
            // But 'total' is a derived variable in this component based on state. 
            // We can pass total as argument or let's just stick to saving with 0 or rely on what's available.
            // Actually, 'total' is available in scope.
        }

        // To be safe and simple, let's use the 'total' from component state, assuming it's up to date with 'players' state
        // But wait, 'players' in getCurrentState() are current. 'total' is derived from valid players.

        await supabase.from('cost_calculator_history').insert({
            user_id: user.id,
            summary: state,
            total_cost: 0 // We let the backend or UI handle total display, or just save 0 for now as it's optional
        });
    };

    // State Bundle for Persistence
    const getCurrentState = () => ({
        courtPrice, shuttlePrice, otherPrice, playerCount,
        players, playerInput,
        hours, courtCount, shuttleCount, shuttleRate, discount,
        shuttlePerMatchDivisor, mode,
        otCourtPrice, otHours, otCourtCount,
        otShuttlePrice, otShuttleCount, otShuttleRate, otOtherPrice, otDiscount
    });

    // Load Session
    useEffect(() => {
        const loadSession = async () => {
            if (!supabase) {
                setIsLoadingSession(false);
                return;
            }
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoadingSession(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('cost_calculator_sessions')
                    .select('state')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (data?.state) {
                    const s = data.state;

                    // Only restore if the session has meaningful data (not just a menu state)
                    const hasData = (s.players && s.players.length > 0) ||
                        (s.courtPrice || s.shuttlePrice || s.otherPrice);

                    if (hasData && s.mode && s.mode !== 'menu') {
                        if (s.courtPrice !== undefined) setCourtPrice(s.courtPrice);
                        if (s.shuttlePrice !== undefined) setShuttlePrice(s.shuttlePrice);
                        if (s.otherPrice !== undefined) setOtherPrice(s.otherPrice);
                        if (s.playerCount !== undefined) setPlayerCount(s.playerCount);
                        if (s.players !== undefined) setPlayers(s.players);
                        if (s.playerInput !== undefined) setPlayerInput(s.playerInput);
                        if (s.hours !== undefined) setHours(s.hours);
                        if (s.courtCount !== undefined) setCourtCount(s.courtCount);
                        if (s.shuttleCount !== undefined) setShuttleCount(s.shuttleCount);
                        if (s.shuttleRate !== undefined) setShuttleRate(s.shuttleRate);
                        if (s.discount !== undefined) setDiscount(s.discount);
                        if (s.shuttlePerMatchDivisor !== undefined) setShuttlePerMatchDivisor(s.shuttlePerMatchDivisor);
                        if (s.mode !== undefined) setMode(s.mode);

                        if (s.otCourtPrice !== undefined) setOtCourtPrice(s.otCourtPrice);
                        if (s.otHours !== undefined) setOtHours(s.otHours);
                        if (s.otCourtCount !== undefined) setOtCourtCount(s.otCourtCount);
                        if (s.otShuttlePrice !== undefined) setOtShuttlePrice(s.otShuttlePrice);
                        if (s.otShuttleCount !== undefined) setOtShuttleCount(s.otShuttleCount);
                        if (s.otShuttleRate !== undefined) setOtShuttleRate(s.otShuttleRate);
                        if (s.otOtherPrice !== undefined) setOtOtherPrice(s.otOtherPrice);
                        if (s.otDiscount !== undefined) setOtDiscount(s.otDiscount);

                        toast.success("เรียกคืนข้อมูลล่าสุดเรียบร้อย");
                    }
                }
            } catch (error) {
                console.error("Error loading session:", error);
            } finally {
                setIsLoadingSession(false);
            }
        };
        loadSession();
    }, []);

    // Sync selectedPlayers with players list (Cleanup)
    useEffect(() => {
        if (selectedPlayers.length > 0) {
            setSelectedPlayers(prev => prev.filter(id => players.some(p => p.id === id)));
        }
    }, [players]);

    // Auto-Save Session (Debounced)
    useEffect(() => {
        if (isLoadingSession) return;
        if (isViewingHistory) return;
        if (mode === 'menu' && players.length === 0) return;

        const saveToDB = async () => {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const state = getCurrentState();
            await supabase.from('cost_calculator_sessions').upsert({
                user_id: user.id,
                state: state,
                updated_at: new Date().toISOString()
            });
        };

        const timer = setTimeout(saveToDB, 1000); // 1 sec debounce
        return () => clearTimeout(timer);
    }, [
        courtPrice, shuttlePrice, otherPrice, playerCount,
        players, playerInput,
        hours, courtCount, shuttleCount, shuttleRate, discount,
        shuttlePerMatchDivisor, mode, isLoadingSession, isViewingHistory,
        otCourtPrice, otHours, otCourtCount,
        otShuttlePrice, otShuttleCount, otShuttleRate, otOtherPrice, otDiscount
    ]);

    // Effects for Auto-Calculation
    useEffect(() => {
        // Shuttle calc is always active now since UI is exposed in both modes
        const s = (parseFloat(shuttleCount) || 0) * (parseFloat(shuttleRate) || 0);
        setShuttlePrice(s > 0 ? s.toString() : "");

        // Court price auto-calc only makes sense if we were in a mode that used hours*rate
        // But since we switched to manual court price, we don't overwrite it here unless needed.
        // Actually, previous logic only calculated if showAdvanced was true.
    }, [shuttleCount, shuttleRate]);

    // Auto-calc OT Shuttle Price
    useEffect(() => {
        const s = (parseFloat(otShuttleCount) || 0) * (parseFloat(otShuttleRate) || 0);
        setOtShuttlePrice(s > 0 ? s.toString() : "");
    }, [otShuttleCount, otShuttleRate]);

    const resetAllState = () => {
        setMode('menu');
        setPlayers([]);
        setPlayerInput("");
        setCourtPrice("");
        setShuttlePrice("");
        setOtherPrice("");
        setDiscount("");
        setHours("");
        setCourtCount("");
        setShuttleCount("");
        setShuttleRate("");
        setShowBill(false);
        setOtCourtPrice("");
        setOtHours("");
        setOtCourtCount("");
        setOtShuttlePrice("");
        setOtShuttleCount("");
        setOtShuttleRate("");
        setOtOtherPrice("");
        setOtDiscount("");
        setSelectedPlayers([]);
        setShowIndividualBill(false);
    };

    const handleFinish = async () => {
        setIsDownloading(true);
        try {
            if (!supabase) {
                resetAllState();
                setIsDownloading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();

            // 1. Save to History if logged in and not viewing history
            if (user && !isViewingHistory) {
                const currentState = getCurrentState();
                await supabase.from('cost_calculator_history').insert({
                    user_id: user.id,
                    summary: currentState
                });

                // 2. Clear Session in DB - Using upsert with empty state to be sure
                await supabase.from('cost_calculator_sessions').upsert({
                    user_id: user.id,
                    state: { mode: 'menu' }, // Reset to menu state
                    updated_at: new Date().toISOString()
                });

                toast.success("บันทึกประวัติและล้างข้อมูลเรียบร้อย");
            }

            // 3. Always Reset Local State if not viewing history
            if (!isViewingHistory) {
                resetAllState();
            }

        } catch (err) {
            console.error("Finish error:", err);
            toast.error("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsDownloading(false);
        }
    };

    // Parse Player Names Logic
    const parsePlayerNames = (input: string) => {
        const lines = input.split("\n").map(l => l.trim()).filter(l => l);
        const newPlayers: PlayerItem[] = [];
        // Default new players to the session hours (as string)
        const defaultHours = hours || "1";

        // Strict Numbered Mode Detection
        const strictPattern = /^(\d+)[\.\)\-\s]+\s*(.*)/;
        const numberedLines = lines.filter(l => strictPattern.test(l));
        const useStrictMode = numberedLines.length > 0;

        const addPlayer = (name: string) => {
            // Avoid duplicates in the same batch
            if (name && !newPlayers.some(p => p.name === name)) {
                newPlayers.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name,
                    hours: defaultHours,
                    matchCount: 0,
                    isOvertime: false,
                    otHours: "1"
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

        // Replace existing players with new parsed list
        setPlayers(newPlayers);
        setPlayerCount(newPlayers.length > 0 ? newPlayers.length.toString() : "1");
    };

    const handlePlayerInputChange = (val: string) => {
        setPlayerInput(val);
        parsePlayerNames(val);
    };

    const removePlayer = (idToRemove: string) => {
        setPlayers(prev => {
            const newPlayers = prev.filter(p => p.id !== idToRemove);
            setPlayerCount(newPlayers.length > 0 ? newPlayers.length.toString() : "1");
            return newPlayers;
        });
    };

    const updatePlayerHours = (id: string, newHours: string) => {
        // Allow any string input to prevent cursor jumping/validation issues while typing decimals
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, hours: newHours } : p));
    };

    const updatePlayerMatches = (id: string, delta: number) => {
        setPlayers(prev => prev.map(p => {
            if (p.id === id) {
                const newCount = Math.max(0, (p.matchCount || 0) + delta);
                return { ...p, matchCount: newCount };
            }
            return p;
        }));
    };

    const updatePlayerOvertime = (id: string, isOvertime: boolean) => {
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, isOvertime, otHours: isOvertime ? (otHours || "1") : p.otHours } : p));
    };

    const updatePlayerOtHours = (id: string, newOtHours: string) => {
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, otHours: newOtHours } : p));
    };

    const hasOtPlayers = players.some(p => p.isOvertime);

    const total =
        (parseFloat(courtPrice) || 0) +
        (parseFloat(shuttlePrice) || 0) +
        (parseFloat(otherPrice) || 0) -
        (parseFloat(discount) || 0) +
        (hasOtPlayers ? (
            (parseFloat(otCourtPrice) || 0) +
            (parseFloat(otShuttlePrice) || 0) +
            (parseFloat(otOtherPrice) || 0) -
            (parseFloat(otDiscount) || 0)
        ) : 0);

    // Fair Share Calculation
    // Helper: Any .5 fraction is weighted as .7 to reduce burden on full-time players
    // e.g. 0.5 -> 0.7, 1.5 -> 1.7, 2.5 -> 2.7
    const getWeightedHours = (h: number) => {
        const integerPart = Math.floor(h);
        const decimalPart = h - integerPart;
        // Check if roughly 0.5 (allow small float error)
        if (Math.abs(decimalPart - 0.5) < 0.01) {
            return integerPart + 0.7;
        }
        return h;
    };

    // 1. Calculate Total "Man-Hours" (Weighted)
    const totalWeightedManHours = players.reduce((sum, p) => sum + getWeightedHours(parseFloat(p.hours) || 0), 0);

    // 2. Cost Per Weighted-Man-Hour
    const effectiveTotalManHours = totalWeightedManHours > 0 ? totalWeightedManHours : 1;
    const costPerWeightedHour = ((parseFloat(courtPrice) || 0) + (parseFloat(shuttlePrice) || 0) + (parseFloat(otherPrice) || 0) - (parseFloat(discount) || 0)) / effectiveTotalManHours;

    // 3. Helper to get cost for a player
    const getPlayerCost = (p: PlayerItem) => {
        if (mode === 'simple') {
            const courtFeeRate = (parseFloat(courtPrice) || 0);
            const ratePerShuttle = parseFloat(shuttleRate) || 0;
            const splitDivisor = parseFloat(shuttlePerMatchDivisor) || 4;
            const costPerMatch = splitDivisor > 0 ? ratePerShuttle / splitDivisor : 0;

            const pHours = parseFloat(p.hours) || 0;
            const courtCost = courtFeeRate * pHours; // Per Person * Hours
            const shuttleCost = (p.matchCount || 0) * costPerMatch;

            return Math.ceil(courtCost + shuttleCost);
        }

        // Standard Mode
        // If no players, or totalManHours is 0, avoid division by zero issues
        if (players.length === 0) return 0;

        const h = parseFloat(p.hours) || 0;
        const weightedH = getWeightedHours(h);

        const rawCost = costPerWeightedHour * weightedH;

        let otCostPerPerson = 0;
        if (p.isOvertime) {
            const otPrice = (parseFloat(otCourtPrice) || 0) +
                (parseFloat(otShuttlePrice) || 0) +
                (parseFloat(otOtherPrice) || 0) -
                (parseFloat(otDiscount) || 0);

            // Weighted OT Logic
            const totalOtParticipation = players
                .filter(pl => pl.isOvertime)
                .reduce((sum, pl) => sum + (parseFloat(pl.otHours || "0") || 0), 0);

            if (totalOtParticipation > 0) {
                const costPerOtHour = otPrice / totalOtParticipation;
                const playerOtHours = parseFloat(p.otHours || "0") || 0;
                otCostPerPerson = costPerOtHour * playerOtHours;
            }
        }

        return Math.ceil(rawCost + otCostPerPerson); // Round up per person
    };

    // Calculate Average per person for display if everyone played equal
    const simpleAvg = Math.ceil(total / (players.length || 1));

    const handleCopy = () => {
        let text = "";

        if (mode === 'simple') {
            // Simple Mode: Detailed breakdown per person
            text = `🏸 สรุปยอดค่าลูกแบด 🏸\n------------------\n`;

            // Calculate totals for summary (keep it minimal as requested, but maybe still useful)
            // User requested pattern: "Change pattern to emphasize individual breakdown, no need for total summary"
            // But usually a header is good. Let's list individuals immediately.

            let totalCollection = 0;

            players.forEach((p, i) => {
                const cost = getPlayerCost(p);
                totalCollection += cost;

                // Calculate breakdown
                const courtFee = Math.ceil((parseFloat(courtPrice || "0") * (parseFloat(p.hours) || 0)) / (parseInt(shuttlePerMatchDivisor) || 4));
                const shuttleFee = (p.matchCount || 0) * Math.ceil(parseFloat(shuttleRate || "0") / (parseInt(shuttlePerMatchDivisor) || 4));

                text += `${i + 1}. ${p.name}${useTag ? " @" : ""} : ${cost} บาท\n`;
                text += `   (ค่าสนาม ${courtFee} + ค่าลูก ${shuttleFee})\n`;
            });

            text += `\n------------------\n💰 ยอดรวมทั้งหมด: ${totalCollection.toLocaleString()} บาท\n`;
            text += `\nขอบคุณครับ 🙏`;

        } else {
            // Standard Mode (Original Logic)
            const h = parseFloat(hours) || 0;
            const cCount = parseFloat(courtCount) || 1;
            const sCount = parseFloat(shuttleCount) || 0;
            const d = parseFloat(discount) || 0;

            text = `
🏸 สรุปยอดค่าคอร์ท 🏸
------------------
🏟️ ค่าคอร์ท: ${parseFloat(courtPrice) || 0} บ.
   (${cCount} คอร์ท x ${h} ชม.)
🏸 ค่าลูกแบด: ${parseFloat(shuttlePrice) || 0} บ.
   (${sCount} ลูก)
${parseFloat(otherPrice) > 0 ? `🥤 ค่าน้ำ/อื่นๆ: ${parseFloat(otherPrice)} บ.\n` : ""}${d > 0 ? `💵 หักออก/รับเงินสด: -${d} บ.\n` : ""}------------------
💰 ยอดรวมทั้งหมด: ${total.toLocaleString()} บาท
👥 จำนวนคนหาร: ${players.length} คน
`.trim();

            if (players.length > 0) {
                text += `\n------------------\n📋 รายละเอียด:\n`;

                const grouped = new Map<number, PlayerItem[]>();
                players.forEach(p => {
                    const cost = getPlayerCost(p);
                    if (!grouped.has(cost)) grouped.set(cost, []);
                    grouped.get(cost)?.push(p);
                });

                const sortedCosts = Array.from(grouped.keys()).sort((a, b) => b - a);

                let globalIndex = 1;
                for (const cost of sortedCosts) {
                    const groupPlayers = grouped.get(cost) || [];
                    const p = groupPlayers[0];
                    const normalH = parseFloat(p.hours) || 0;
                    const otH = (p.isOvertime) ? (parseFloat(p.otHours || "0") || 0) : 0;
                    const totalH = normalH + otH;
                    const isOt = otH > 0;

                    text += `\n💸 ยอด ${cost} บาท (${totalH} ชม.${isOt ? " +OT" : ""})\n`;
                    groupPlayers.forEach((p) => {
                        text += `${globalIndex}. ${p.name}${useTag ? " @" : ""}\n`;
                        globalIndex++;
                    });
                }
            } else {
                text += `------------------\n💸 ตกคนละ: ${simpleAvg} บาท\n`;
            }

            text += `\n------------------\nขอบคุณครับ 🙏`;
        }

        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownloadImage = async () => {
        if (!billRef.current) return;
        setIsDownloading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 300)); // Increased wait time

            const canvas = await html2canvas(billRef.current, {
                useCORS: true,
                backgroundColor: "#ffffff", // Force white background for the image
                scale: 2, // Higher resolution
                logging: false, // Reduce console noise
            });

            const link = document.createElement("a");
            link.download = `topminton-bill-${new Date().getTime()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Failed to generate image", err);
            // Fallback: alert the user if it fails
            alert("ขออภัย เกิดข้อผิดพลาดในการบันทึกรูป โปรดลองใหม่อีกครั้ง");
        } finally {
            setIsDownloading(false);
        }
    };

    // Mode Selection (Moved up)
    // type CalculatorMode = 'menu' | 'standard' | 'simple';
    // const [mode, setMode] = useState<CalculatorMode>('menu');

    return (
        <AppShell hideNav>
            {/* History Sheet */}
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetContent side="bottom" className="h-[80vh]">
                    <SheetHeader>
                        <SheetTitle>📜 ประวัติการคิดเงิน</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-full mt-4 pr-4 pb-12">
                        {isLoadingHistory ? (
                            <div className="text-center py-10 text-muted-foreground animate-pulse">กำลังโหลด...</div>
                        ) : historyItems.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">ไม่มีประวัติการคิดเงิน</div>
                        ) : (
                            <div className="space-y-3">
                                {historyItems.map((item) => {
                                    const s = item.summary || {};
                                    const dateStr = format(new Date(item.created_at), "d MMM yy HH:mm", { locale: th });
                                    const pCount = (s.players || []).length || s.playerCount || 0;

                                    return (
                                        <div
                                            key={item.id}
                                            className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 cursor-pointer transition-colors relative group"
                                            onClick={() => loadHistoryItem(item)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-sm">{dateStr}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {s.mode === 'simple' ? 'คิดตามลูก' : 'หารเท่า'} • {pCount} คน
                                                    </div>
                                                    {s.players && s.players.length > 0 && (
                                                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px] opacity-75">
                                                            {s.players.map((p: any) => p.name).join(", ")}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 -mt-1 -mr-1"
                                                    onClick={(e) => deleteHistoryItem(e, item.id)}
                                                >
                                                    <Icons.close className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </SheetContent>
            </Sheet>
            <div className="min-h-screen bg-background pb-24">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="px-4 py-3 flex items-center gap-3">
                        {showBill ? (
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                                if (isViewingHistory) {
                                    setIsViewingHistory(false);
                                    setMode('menu');
                                    setPlayers([]);
                                    setCourtPrice("");
                                    setShuttlePrice("");
                                    setOtherPrice("");
                                    setShowBill(false);
                                    toast.info("ออกจากโหมดดูประวัติ");
                                    return;
                                }
                                setShowBill(false);
                            }}>
                                <Icons.chevronLeft className="h-5 w-5" />
                            </Button>
                        ) : mode !== 'menu' ? (
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                                if (isViewingHistory) {
                                    setIsViewingHistory(false);
                                    setMode('menu');
                                    setPlayers([]);
                                    setCourtPrice("");
                                    setShuttlePrice("");
                                    setOtherPrice("");
                                    setShowBill(false);
                                    toast.info("ออกจากโหมดดูประวัติ");
                                    return;
                                }
                                setMode('menu');
                            }}>
                                <Icons.chevronLeft className="h-5 w-5" />
                            </Button>
                        ) : (
                            <Link href="/more">
                                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                                    <span><Icons.chevronLeft className="h-5 w-5" /></span>
                                </Button>
                            </Link>
                        )}
                        <h1 className="text-lg font-semibold text-foreground">
                            {showBill ? "สรุปบิลค่าคอร์ท" : mode === 'menu' ? "โปรคิดเงิน" : mode === 'standard' ? "หารค่าคอร์ท (ปกติ)" : "คิดตามจำนวนลูก"}
                        </h1>
                        <div className="ml-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-orange-600 font-medium"
                                onClick={() => setIsHistoryOpen(true)}
                            >
                                <Icons.clock className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* MODE SELECTION MENU */}
                {mode === 'menu' && (
                    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center py-6 space-y-2">
                            <h2 className="text-2xl font-black text-foreground">เลือกวิธีการคำนวณ</h2>
                            <p className="text-muted-foreground">เลือกรูปแบบการคิดเงินที่คุณต้องการ</p>
                        </div>

                        <button
                            onClick={() => setMode('standard')}
                            className="w-full relative group overflow-hidden bg-white p-6 rounded-3xl border-2 border-transparent hover:border-[#FF9500] shadow-sm transition-all duration-300 transform active:scale-[0.98]"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Icons.receipt className="w-32 h-32 rotate-12" />
                            </div>
                            <div className="relative z-10 flex flex-col items-start text-left gap-3">
                                <div className="p-3 bg-[#FFF5E6] rounded-2xl text-[#FF9500]">
                                    <Icons.users className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">หารค่าคอร์ท</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        ระบบหารเท่าค่าคอร์ดตามจำนวนผู้เล่น
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('simple')}
                            className="w-full relative group overflow-hidden bg-white p-6 rounded-3xl border-2 border-transparent hover:border-[#31A24C] shadow-sm transition-all duration-300 transform active:scale-[0.98]"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Icons.shuttlecock className="w-32 h-32 -rotate-12" />
                            </div>
                            <div className="relative z-10 flex flex-col items-start text-left gap-3">
                                <div className="p-3 bg-[#E6F4EA] rounded-2xl text-[#31A24C]">
                                    <Icons.coins className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">คิดตามจำนวนลูก</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        คิดค่าใช้จ่ายตามจำนวนลูกเป็นรายคน
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {/* CALCULATOR VIEWS */}
                {mode !== 'menu' && (
                    <>
                        {showIndividualBill ? (
                            // ---------------- INDIVIDUAL BILL VIEW ----------------
                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-center mb-2 px-2">
                                    <h2 className="font-bold text-lg">บิลรายบุคคล ({selectedPlayers.length} คน)</h2>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setShowIndividualBill(false);
                                        setShowBill(false); // Go back to input view directly
                                    }}>
                                        <Icons.close className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Scrollable container for bills */}
                                <div className="space-y-8 pb-20">
                                    {players.filter(p => selectedPlayers.includes(p.id)).map((p, index) => {
                                        const cost = getPlayerCost(p);
                                        return (
                                            <div key={p.id} className="relative">
                                                <div id={`bill-${p.id}`} style={{ padding: '0', backgroundColor: '#fff', fontFamily: "'Prompt', sans-serif", width: '100%', maxWidth: '350px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                                                    {/* Header */}
                                                    <div style={{ background: '#22c55e', padding: '20px', color: 'white', textAlign: 'center' }}>
                                                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{p.name}</h3>
                                                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>ค่าคอร์ทแบดมินตัน</p>
                                                    </div>

                                                    {/* QR Code Section */}
                                                    <div style={{ padding: '20px', textAlign: 'center', borderBottom: '2px dashed #e2e8f0' }}>
                                                        <div style={{ width: '180px', height: '180px', margin: '0 auto 10px auto', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {/* Mockup QR Code using the generated image or a placeholder */}
                                                            {/* In a real app, this would be a real PromptPay QR generation */}
                                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                                <img
                                                                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                                                                    alt="PromptPay QR"
                                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }}
                                                                />
                                                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '2px' }}>
                                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/PromptPay-logo.png" alt="PromptPay" style={{ height: '20px' }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>สแกนเพื่อจ่ายเงิน</p>
                                                    </div>

                                                    {/* Details */}
                                                    <div style={{ padding: '20px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                                                            <span>ค่าสนาม ({courtPrice || 0} บาท/ชม.)</span>
                                                            <span>{Math.ceil((parseFloat(courtPrice || "0") * (parseFloat(p.hours) || 0)) / (parseInt(shuttlePerMatchDivisor) || 4))}.-</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                                                            <span>ค่าลูก ({Math.ceil((p.matchCount || 0) / (parseInt(shuttlePerMatchDivisor) || 4))} ลูก)</span>
                                                            <span>{(p.matchCount || 0) * Math.ceil(parseFloat(shuttleRate || "0") / (parseInt(shuttlePerMatchDivisor) || 4))}.-</span>
                                                        </div>
                                                        <div style={{ borderTop: '1px solid #e2e8f0', margin: '12px 0' }}></div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>ยอดชำระ</span>
                                                            <span style={{ fontWeight: '900', fontSize: '24px', color: '#22c55e' }}>{cost}.-</span>
                                                        </div>
                                                    </div>

                                                    {/* Footer */}
                                                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                                                        <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>POWERED BY TOPMINTON</p>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="mt-3 flex gap-2">
                                                    <Button
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md rounded-xl h-12"
                                                        onClick={async () => {
                                                            try {
                                                                toast.info("กำลังบันทึกประวัติ...");
                                                                await saveHistorySnapshotNew();

                                                                // Remove from both lists
                                                                setSelectedPlayers(prev => prev.filter(id => id !== p.id));
                                                                setPlayers(prev => prev.filter(player => player.id !== p.id));
                                                                toast.success(`💰 บันทึกรับเงินจาก ${p.name} เรียบร้อย!`);

                                                                // If no players are left selected, close the view
                                                                if (selectedPlayers.length <= 1) {
                                                                    setShowIndividualBill(false);
                                                                    setShowBill(false);
                                                                }
                                                            } catch (error) {
                                                                console.error(error);
                                                                toast.error("เกิดข้อผิดพลาดในการบันทึก แต่จะดำเนินการต่อ");
                                                                // Allow proceeding even if save fails? Yes, to avoid locking user.
                                                                setSelectedPlayers(prev => prev.filter(id => id !== p.id));
                                                                setPlayers(prev => prev.filter(player => player.id !== p.id));
                                                            }
                                                        }}
                                                    >
                                                        <Icons.check className="w-5 h-5 mr-2" /> จ่ายแล้ว
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="bg-white hover:bg-gray-50 text-gray-700 font-bold shadow-sm rounded-xl h-12 w-12 p-0 flex-shrink-0"
                                                        onClick={() => {
                                                            // Logic to download specific bill
                                                            const element = document.getElementById(`bill-${p.id}`);
                                                            if (element) {
                                                                html2canvas(element, { useCORS: true, scale: 2 }).then(canvas => {
                                                                    const link = document.createElement("a");
                                                                    link.download = `bill-${p.name}-${new Date().getTime()}.png`;
                                                                    link.href = canvas.toDataURL("image/png");
                                                                    link.click();
                                                                    toast.success("บันทึกรูปบิลสำเร็จ");
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <Icons.download className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : showBill ? (
                            // ---------------- BILL VIEW (Shared for both modes) ----------------
                            // Reusing the existing Bill View code
                            <div className="p-4 space-y-4">
                                {/* Wrapper for capture - PURE INLINE STYLES to avoid Tailwind 4 oklab/lab colors causing html2canvas errors */}
                                <div ref={billRef} style={{ padding: '0', backgroundColor: '#f8fafc', fontFamily: "'Prompt', sans-serif", width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                                    {/* Modern Header with Gradient */}
                                    <div style={{ background: 'linear-gradient(135deg, #FF9500 0%, #FF5F1F 100%)', padding: '30px 20px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', color: 'white', boxShadow: '0 4px 15px rgba(255, 95, 31, 0.2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <div>
                                                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                                                    {mode === 'simple' ? 'สรุปบิล' : 'ใบสรุปค่าคอร์ท'}
                                                </h1>
                                                <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>{new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>
                                                <Icons.shuttlecock size={32} className="text-white fill-current" />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                                                    {mode === 'simple' ? 'จำนวนผู้เล่น' : 'หารทั้งหมด'}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{players.length} คน</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>ยอดรวมสุทธิ</p>
                                                <p style={{ margin: 0, fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>{mode === 'simple' ? players.reduce((sum, p) => sum + getPlayerCost(p), 0).toLocaleString() : total.toLocaleString()}<span style={{ fontSize: '16px', fontWeight: 'normal', marginLeft: '4px' }}>บาท</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '20px' }}>
                                        {/* Cost Details Card - Standard Mode */}
                                        {mode !== 'simple' && (
                                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                                                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '4px', height: '16px', backgroundColor: '#FF9500', borderRadius: '2px' }}></div>
                                                    รายละเอียดค่าใช้จ่าย
                                                </h3>
                                                <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ color: '#64748b' }}>ค่าคอร์ท ({courtCount} คอร์ท/{hours} ชม.)</td>
                                                            <td style={{ textAlign: 'right', fontWeight: '600', color: '#334155' }}>{parseFloat(courtPrice) || 0}.-</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ color: '#64748b' }}>ค่าลูกแบด ({shuttleCount} ลูก)</td>
                                                            <td style={{ textAlign: 'right', fontWeight: '600', color: '#334155' }}>{parseFloat(shuttlePrice) || 0}.-</td>
                                                        </tr>
                                                        {hasOtPlayers && (
                                                            <tr>
                                                                <td style={{ color: '#64748b' }}>
                                                                    <span style={{ color: '#3b82f6', fontWeight: 'bold', marginRight: '4px' }}>[OT]</span>
                                                                    ค่าคอร์ท+ลูก ({players.filter(p => p.isOvertime).length} คน)
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: '600', color: '#3b82f6' }}>
                                                                    {((parseFloat(otCourtPrice) || 0) + (parseFloat(otShuttlePrice) || 0) + (parseFloat(otOtherPrice) || 0)).toLocaleString()}.-
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {parseFloat(otherPrice) > 0 && (
                                                            <tr>
                                                                <td style={{ color: '#64748b' }}>ค่าน้ำ / อื่นๆ</td>
                                                                <td style={{ textAlign: 'right', fontWeight: '600', color: '#334155' }}>{parseFloat(otherPrice)}.-</td>
                                                            </tr>
                                                        )}
                                                        {parseFloat(discount) > 0 && (
                                                            <tr>
                                                                <td style={{ color: '#ef4444' }}>หักออก / รับเงินสด</td>
                                                                <td style={{ textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>-{parseFloat(discount)}.-</td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td colSpan={2} style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '12px', marginTop: '4px' }}></td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>ยอดรวมทั้งหมด</td>
                                                            <td style={{ textAlign: 'right', fontWeight: '900', fontSize: '20px', color: '#FF9500' }}>{total.toLocaleString()}.-</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Cost Details Card - Simple Mode (Shuttle) */}
                                        {mode === 'simple' && (
                                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', marginBottom: '8px' }}>
                                                    <span style={{ color: '#64748b' }}>ราคาลูกแบด</span>
                                                    <span style={{ fontWeight: 'bold', color: '#334155' }}>{shuttleRate} บาท/ลูก</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                                                    <span style={{ color: '#64748b' }}>ใช้ลูกไป</span>
                                                    <span style={{ fontWeight: 'bold', color: '#334155' }}>
                                                        {Math.ceil(players.reduce((sum, p) => sum + (p.matchCount || 0), 0) / (parseInt(shuttlePerMatchDivisor) || 4))} ลูก
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Player List Card */}
                                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                                            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '4px', height: '16px', backgroundColor: '#FF9500', borderRadius: '2px' }}></div>
                                                สรุปรายคน
                                            </h3>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                {players.map((p, i) => {
                                                    const cost = getPlayerCost(p);
                                                    const normalH = parseFloat(p.hours) || 0;
                                                    const otH = (p.isOvertime) ? (parseFloat(p.otHours || "0") || 0) : 0;
                                                    const totalH = normalH + otH;
                                                    const isOt = otH > 0;

                                                    return (
                                                        <div key={p.id} style={{
                                                            backgroundColor: isOt ? '#eff6ff' : '#f8fafc',
                                                            borderRadius: '10px',
                                                            padding: '10px',
                                                            border: isOt ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                                                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                                                                    {i + 1}. {p.name}
                                                                </div>
                                                                {isOt && <div style={{ fontSize: '8px', fontWeight: 'bold', backgroundColor: '#3b82f6', color: 'white', padding: '1px 4px', borderRadius: '4px' }}>OT</div>}
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                                                    {mode === 'simple' ? (
                                                                        <>
                                                                            สนาม {Math.ceil((parseFloat(courtPrice || "0") * (parseFloat(p.hours) || 0)) / (parseInt(shuttlePerMatchDivisor) || 4))} +
                                                                            ลูก {(p.matchCount || 0) * Math.ceil(parseFloat(shuttleRate || "0") / (parseInt(shuttlePerMatchDivisor) || 4))}
                                                                            {/* ({p.matchCount || 0} เกม) */}
                                                                        </>
                                                                    ) : (
                                                                        <>{totalH} ชม.</>
                                                                    )}
                                                                </div>
                                                                <div style={{ fontSize: '16px', fontWeight: '900', color: isOt ? '#2563eb' : '#FF9500', lineHeight: 1 }}>{cost}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>


                                        {/* Footer / Watermark */}
                                        <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ width: '40px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginBottom: '8px' }}></div>
                                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', letterSpacing: '1px' }}>POWERED BY</p>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#94a3b8', letterSpacing: '-0.5px' }}>TOPMINTON</h4>
                                        </div>
                                    </div>
                                </div>

                                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-20">
                                    {!isViewingHistory && (
                                        <Button
                                            variant="default"
                                            className="w-full mb-3 h-12 font-bold shadow-lg bg-red-600 hover:bg-red-700 text-white"
                                            onClick={handleFinish}
                                            disabled={isDownloading}
                                        >
                                            <Icons.check className="w-5 h-5 mr-2" /> จบการคิดเงิน (บันทึก & ล้างค่า)
                                        </Button>
                                    )}
                                    <div className="flex gap-3 max-w-md mx-auto">
                                        <Button
                                            variant="outline"
                                            className="h-12 w-12 shrink-0 p-0"
                                            onClick={() => {
                                                if (isViewingHistory) {
                                                    setIsViewingHistory(false);
                                                    setMode('menu');
                                                    setPlayers([]);
                                                    setCourtPrice("");
                                                    setShuttlePrice("");
                                                    setOtherPrice("");
                                                    setShowBill(false);
                                                    toast.info("ออกจากโหมดดูประวัติ");
                                                } else {
                                                    setShowBill(false);
                                                }
                                            }}
                                        >
                                            <Icons.chevronLeft className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="flex-1 h-12 font-bold"
                                            onClick={handleDownloadImage}
                                            disabled={isDownloading}
                                        >
                                            {isDownloading ? (
                                                <Icons.loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <><Icons.image className="w-5 h-5 mr-2" /> บันทึกรูป</>
                                            )}
                                        </Button>
                                        <Button
                                            className={cn(
                                                "flex-[2] h-12 font-bold text-md transition-all",
                                                isCopied ? "bg-[#31A24C] text-white" : "bg-primary text-white"
                                            )}
                                            onClick={handleCopy}
                                        >
                                            {isCopied ? (
                                                <><Icons.check className="w-5 h-5 mr-2" /> คัดลอกแล้ว</>
                                            ) : (
                                                <><Icons.copy className="w-5 h-5 mr-2" /> ส่ง Line</>
                                            )}
                                        </Button>
                                    </div>
                                    <div className="mt-3 flex items-center justify-center gap-2">
                                        <div className="flex items-center space-x-2 bg-secondary/50 px-3 py-2 rounded-lg">
                                            <Checkbox
                                                id="use-tag"
                                                checked={useTag}
                                                onCheckedChange={(c) => setUseTag(c === true)}
                                            />
                                            <Label
                                                htmlFor="use-tag"
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                ใส่ @ หลังชื่อ (เพื่อแท็กใน Line)
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // ---------------- INPUT VIEW ----------------
                            <div className="p-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                {mode === 'standard' && (
                                    <>
                                        {/* Result Card (Simpler in Input View) */}
                                        <GlassCard className="p-0 overflow-hidden border-[#31A24C] shadow-lg shadow-[#31A24C]/10">
                                            <div className="bg-gradient-to-br from-[#31A24C] to-[#2B8A3E] p-6 text-white text-center relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <Icons.coins className="w-32 h-32" />
                                                </div>
                                                <p className="text-sm font-medium opacity-90 mb-1">
                                                    {mode === 'standard' && players.length > 0 ? "เฉลี่ยคนละ (ประมาณ)" : "ยอดหารต่อคน"}
                                                </p>
                                                <h2 className="text-6xl font-black tracking-tighter drop-shadow-sm flex items-center justify-center gap-1">
                                                    {mode === 'standard' ? simpleAvg : Math.ceil(total / (parseInt(playerCount) || 1))} <span className="text-xl font-bold mt-4">฿</span>
                                                </h2>
                                            </div>
                                            <div className="p-4 bg-background/50 flex flex-col gap-3">
                                                <div className="flex items-center justify-between text-sm px-1">
                                                    <span className="text-muted-foreground font-medium">ยอดรวมทั้งหมด</span>
                                                    <span className="font-bold text-lg">{total.toLocaleString()} ฿</span>
                                                </div>
                                                <Button
                                                    onClick={() => setShowBill(true)}
                                                    className="w-full h-12 font-bold text-md bg-primary text-white shadow-lg shadow-primary/20"
                                                >
                                                    <Icons.receipt className="w-5 h-5 mr-2" /> ออกบิล
                                                </Button>
                                            </div>
                                        </GlassCard>

                                        {/* Inputs */}
                                        <GlassCard className="p-5 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-foreground">รายละเอียดค่าใช้จ่าย</h3>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Court Fee */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Icons.court className="w-4 h-4 text-primary" /> ค่าเช่าคอร์ท
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="number"
                                                            placeholder="ใส่ยอดเต็มของค่าคอร์ททั้งหมดที่จ่ายไป"
                                                            value={courtPrice}
                                                            onChange={e => setCourtPrice(e.target.value)}
                                                            className="h-14 text-lg font-bold bg-secondary/30 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-xs placeholder:text-muted-foreground/70"
                                                        />
                                                        <div className="w-20 relative">
                                                            <Input
                                                                type="number"
                                                                value={courtCount}
                                                                onChange={e => setCourtCount(e.target.value)}
                                                                className="h-14 text-center font-bold bg-secondary/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <span className="absolute right-2 top-1 text-[8px] text-muted-foreground">คอร์ท</span>
                                                        </div>
                                                        <div className="w-20 relative">
                                                            <Input
                                                                type="number"
                                                                value={hours}
                                                                onChange={e => setHours(e.target.value)}
                                                                className="h-14 text-center font-bold bg-secondary/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <span className="absolute right-2 top-1 text-[8px] text-muted-foreground">ชม.</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Shuttle Fee */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Icons.shuttlecock className="w-4 h-4 text-primary" /> ค่าลูกแบด
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="relative">
                                                            <Input type="number" placeholder="ลูก" value={shuttleCount} onChange={e => setShuttleCount(e.target.value)} className="bg-secondary/50 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                            <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground">ลูก</span>
                                                        </div>
                                                        <div className="relative">
                                                            <Input type="number" placeholder="บาท/ลูก" value={shuttleRate} onChange={e => setShuttleRate(e.target.value)} className="bg-secondary/50 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                            <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground">฿/ลูก</span>
                                                        </div>
                                                        <div className="col-span-2 text-right text-xs font-bold text-[#FF9500]">
                                                            รวม {parseFloat(shuttlePrice) || 0} บาท
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Other Fee */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Icons.bag className="w-4 h-4 text-[#FF9500]" /> ค่าน้ำ / อื่นๆ
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={otherPrice}
                                                        onChange={e => setOtherPrice(e.target.value)}
                                                        className="h-12 font-bold bg-secondary/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>

                                                {/* Discount / Cash Received */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-red-500 uppercase flex items-center gap-2">
                                                        <Icons.minus className="w-4 h-4" /> หักออก / รับเงินสด
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={discount}
                                                        onChange={e => setDiscount(e.target.value)}
                                                        className="h-12 font-bold bg-secondary/30 text-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>


                                            </div>
                                        </GlassCard>

                                        {/* People List & Fair Share Table - Only for STANDARD Mode */}
                                        <GlassCard className="p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                                    <Icons.users className="w-5 h-5 text-primary" /> รายชื่อคนหาร ({players.length})
                                                </h3>
                                            </div>

                                            <div className="space-y-4">
                                                <Textarea
                                                    placeholder={`วางรายชื่อคนหารที่นี่... (จาก Line)\n1. แสตมป์\n2. เต้ย\n3. พี่นัท`}
                                                    value={playerInput}
                                                    onChange={(e) => handlePlayerInputChange(e.target.value)}
                                                    rows={4}
                                                    className="bg-secondary border-0 resize-none font-medium text-sm"
                                                />

                                                {/* Fair Share Table */}
                                                {players.length > 0 && (
                                                    <div className="border rounded-xl overflow-hidden">
                                                        <div className="bg-muted/50 px-4 py-2 flex text-[10px] font-bold text-muted-foreground uppercase gap-2">
                                                            <div className="flex-1">ชื่อ</div>
                                                            <div className="w-14 text-center">ชม.</div>
                                                            <div className="w-8 text-center">OT</div>
                                                            <div className="w-16 text-right">ยอด</div>
                                                        </div>
                                                        <div className="divide-y divide-border/50">
                                                            {players.map((p) => {
                                                                const cost = getPlayerCost(p);
                                                                return (
                                                                    <div key={p.id} className="bg-background/40 px-3 py-2 flex items-center gap-2 group hover:bg-background/60 transition-colors">
                                                                        <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                                                            <button
                                                                                onClick={() => removePlayer(p.id)}
                                                                                className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                                                                            >
                                                                                <Icons.close className="w-4 h-4" />
                                                                            </button>
                                                                            <span className="truncate font-medium text-sm">{p.name}</span>
                                                                        </div>
                                                                        <div className="w-14">
                                                                            <Input
                                                                                type="number"
                                                                                value={p.hours}
                                                                                onChange={(e) => updatePlayerHours(p.id, e.target.value)}
                                                                                step="0.5"
                                                                                className="h-8 text-center text-xs font-bold bg-white/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-1"
                                                                            />
                                                                        </div>
                                                                        <div className="w-8 flex justify-center">
                                                                            <Checkbox
                                                                                checked={p.isOvertime || false}
                                                                                onCheckedChange={(c) => updatePlayerOvertime(p.id, c === true)}
                                                                            />
                                                                        </div>
                                                                        <div className="w-16 text-right font-bold text-primary">
                                                                            {cost}.-
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="bg-primary/5 px-4 py-2 text-center text-[10px] text-primary">
                                                            *ระบุจำนวนชั่วโมงของแต่ละคนได้เลย ระบบจะคำนวณตามจริง
                                                        </div>
                                                    </div>
                                                )}

                                                {/* OT Input Section */}
                                                {hasOtPlayers && (
                                                    <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                                                        {/* OT Group Header */}
                                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-0 overflow-hidden mb-4 flex flex-col">
                                                            <div className="flex items-center justify-between p-3 bg-blue-100/50">
                                                                <h4 className="font-bold text-blue-700 flex items-center gap-2">
                                                                    <Icons.users className="w-4 h-4" /> กลุ่มต่อเวลา ({players.filter(p => p.isOvertime).length} คน)
                                                                </h4>
                                                            </div>
                                                            <div className="divide-y divide-blue-200/50">
                                                                <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-blue-500 bg-blue-50 px-3 py-2">
                                                                    <div className="col-span-6">รายชื่อ</div>
                                                                    <div className="col-span-3 text-center">ชม. OT</div>
                                                                    <div className="col-span-3 text-right">ยอดเพิ่ม</div>
                                                                </div>
                                                                {players.filter(p => p.isOvertime).map(p => {
                                                                    // Calculate OT Cost ONLY for display here
                                                                    const otPrice = (parseFloat(otCourtPrice) || 0) +
                                                                        (parseFloat(otShuttlePrice) || 0) +
                                                                        (parseFloat(otOtherPrice) || 0) -
                                                                        (parseFloat(otDiscount) || 0);
                                                                    const totalOtParticipation = players
                                                                        .filter(pl => pl.isOvertime)
                                                                        .reduce((sum, pl) => sum + (parseFloat(pl.otHours || "0") || 0), 0);
                                                                    let myOtCost = 0;
                                                                    if (totalOtParticipation > 0) {
                                                                        const costPerOtHour = otPrice / totalOtParticipation;
                                                                        myOtCost = Math.ceil(costPerOtHour * (parseFloat(p.otHours || "0") || 0));
                                                                    }

                                                                    return (
                                                                        <div key={p.id} className="grid grid-cols-12 gap-2 items-center px-3 py-2 bg-white/50 group">
                                                                            <div className="col-span-6 flex items-center gap-2">
                                                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 h-auto">
                                                                                    {p.name}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="col-span-3">
                                                                                <Input
                                                                                    type="number"
                                                                                    value={p.otHours || ""}
                                                                                    onChange={(e) => updatePlayerOtHours(p.id, e.target.value)}
                                                                                    className="h-7 text-center text-xs font-bold bg-white border-blue-200 text-blue-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-1"
                                                                                />
                                                                            </div>
                                                                            <div className="col-span-3 text-right font-bold text-blue-600 text-xs">
                                                                                +{myOtCost}.-
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                                <div className="p-2 text-center text-[10px] text-blue-400">
                                                                    * ระบุชั่วโมงที่แต่ละคนเล่นในช่วงต่อเวลา เพื่อหารยอดได้แม่นยำขึ้น
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="border border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/10 space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="font-bold text-blue-700 flex items-center gap-2">
                                                                    <Icons.clock className="w-5 h-5" /> รายละเอียดค่าใช้จ่าย (ต่อเวลา)
                                                                </h3>
                                                            </div>

                                                            {/* OT Court Fee */}
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                                    <Icons.court className="w-4 h-4 text-primary" /> ค่าเช่าคอร์ท (ต่อเวลา)
                                                                </label>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="ใส่ยอดเต็มของค่าคอร์ททั้งหมดที่จ่ายไป"
                                                                        value={otCourtPrice}
                                                                        onChange={e => setOtCourtPrice(e.target.value)}
                                                                        className="h-14 text-lg font-bold bg-blue-50/50 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-xs placeholder:text-muted-foreground/70"
                                                                    />
                                                                    <div className="w-20 relative">
                                                                        <Input
                                                                            type="number"
                                                                            value={otCourtCount}
                                                                            onChange={e => setOtCourtCount(e.target.value)}
                                                                            className="h-14 text-center font-bold bg-blue-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        />
                                                                        <span className="absolute right-2 top-1 text-[8px] text-muted-foreground">คอร์ท</span>
                                                                    </div>
                                                                    <div className="w-20 relative">
                                                                        <Input
                                                                            type="number"
                                                                            value={otHours}
                                                                            onChange={e => setOtHours(e.target.value)}
                                                                            className="h-14 text-center font-bold bg-blue-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        />
                                                                        <span className="absolute right-2 top-1 text-[8px] text-muted-foreground">ชม.</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* OT Shuttle Fee */}
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                                    <Icons.shuttlecock className="w-4 h-4 text-primary" /> ค่าลูกแบด (ต่อเวลา)
                                                                </label>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="relative">
                                                                        <Input type="number" placeholder="ลูก" value={otShuttleCount} onChange={e => setOtShuttleCount(e.target.value)} className="bg-blue-50/50 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                                        <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground">ลูก</span>
                                                                    </div>
                                                                    <div className="relative">
                                                                        <Input type="number" placeholder="บาท/ลูก" value={otShuttleRate} onChange={e => setOtShuttleRate(e.target.value)} className="bg-blue-50/50 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                                        <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground">฿/ลูก</span>
                                                                    </div>
                                                                    <div className="col-span-2 text-right text-xs font-bold text-[#FF9500]">
                                                                        รวม {parseFloat(otShuttlePrice) || 0} บาท
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* OT Other Fee */}
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                                    <Icons.bag className="w-4 h-4 text-[#FF9500]" /> ค่าน้ำ / อื่นๆ (ต่อเวลา)
                                                                </label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    value={otOtherPrice}
                                                                    onChange={e => setOtOtherPrice(e.target.value)}
                                                                    className="h-12 font-bold bg-blue-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                            </div>

                                                            {/* OT Discount */}
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-red-500 uppercase flex items-center gap-2">
                                                                    <Icons.minus className="w-4 h-4" /> หักออก / รับเงินสด (ต่อเวลา)
                                                                </label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    value={otDiscount}
                                                                    onChange={e => setOtDiscount(e.target.value)}
                                                                    className="h-12 font-bold bg-blue-50/50 text-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                            </div>

                                                            <div className="text-right text-xs text-muted-foreground">
                                                                * ยอดรวมรายจ่ายต่อเวลา: {
                                                                    ((parseFloat(otCourtPrice) || 0) +
                                                                        (parseFloat(otShuttlePrice) || 0) +
                                                                        (parseFloat(otOtherPrice) || 0) -
                                                                        (parseFloat(otDiscount) || 0)).toLocaleString()
                                                                } บาท (หาร {players.filter(p => p.isOvertime).length} คน)
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}


                                            </div>
                                        </GlassCard>
                                    </>
                                )}

                                {/* Simple Mode - Settings + Player List */}
                                {mode === 'simple' && (
                                    <>
                                        <GlassCard className="p-5 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                                    <Icons.settings className="w-5 h-5 text-primary" /> ตั้งค่าการคำนวณ
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase">ค่าสนาม /คน/ชม.</label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={courtPrice}
                                                            onChange={e => setCourtPrice(e.target.value)}
                                                            className="h-12 text-lg font-bold bg-secondary/30"
                                                        />
                                                        <span className="absolute right-3 top-3 text-xs text-muted-foreground">บาท</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase">ค่าลูกแบด ต่อคน</label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={shuttleRate}
                                                            onChange={e => setShuttleRate(e.target.value)}
                                                            className="h-12 text-lg font-bold bg-secondary/30"
                                                        />
                                                        <span className="absolute right-3 top-3 text-xs text-muted-foreground">บาท</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase flex gap-2 items-center">
                                                    <span>ตัวหารหนึ่งลูก (ปกติ 4 คน/เกม)</span>
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        variant="outline" size="icon" className="h-10 w-10 shrink-0"
                                                        onClick={() => {
                                                            const curr = parseInt(shuttlePerMatchDivisor) || 4;
                                                            setShuttlePerMatchDivisor(Math.max(1, curr - 1).toString());
                                                        }}
                                                    >
                                                        <Icons.minus className="w-4 h-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={shuttlePerMatchDivisor}
                                                        onChange={e => setShuttlePerMatchDivisor(e.target.value)}
                                                        className="text-center font-bold"
                                                    />
                                                    <Button
                                                        variant="outline" size="icon" className="h-10 w-10 shrink-0"
                                                        onClick={() => {
                                                            const curr = parseInt(shuttlePerMatchDivisor) || 4;
                                                            setShuttlePerMatchDivisor((curr + 1).toString());
                                                        }}
                                                    >
                                                        <Icons.plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </GlassCard>

                                        <GlassCard className="p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                                    <Icons.users className="w-5 h-5 text-primary" /> รายชื่อคนเล่น ({players.length})
                                                </h3>
                                            </div>

                                            <div className="space-y-4">
                                                <Textarea
                                                    placeholder={`วางรายชื่อคนเล่นที่นี่... (จาก Line)\n1. A\n2. B\n3. C`}
                                                    value={playerInput}
                                                    onChange={(e) => handlePlayerInputChange(e.target.value)}
                                                    rows={3}
                                                    className="bg-secondary border-0 resize-none font-medium text-sm"
                                                />

                                                {players.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="hidden md:flex px-2 py-1 text-[10px] text-muted-foreground uppercase font-bold">
                                                            <div className="flex-1">ชื่อ</div>
                                                            <div className="w-16 text-center">ชม.</div>
                                                            <div className="w-24 text-center">จำนวนเกม</div>
                                                            <div className="w-20 text-right">รวม</div>
                                                            <div className="w-10 text-center flex justify-center">
                                                                <Checkbox
                                                                    checked={selectedPlayers.length === players.length && players.length > 0}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setSelectedPlayers(players.map(p => p.id));
                                                                        } else {
                                                                            setSelectedPlayers([]);
                                                                        }
                                                                    }}
                                                                    className="border-muted-foreground/50 data-[state=checked]:bg-[#FF9500] border-[#FF9500] h-4 w-4"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {players.map((p) => {
                                                                const cost = getPlayerCost(p);
                                                                return (
                                                                    <div key={p.id} className="bg-background/60 p-3 rounded-xl border border-border flex flex-col md:flex-row md:items-center gap-3 md:gap-2">
                                                                        {/* Name Section with Checkbox */}
                                                                        <div className="flex-1 flex items-center gap-2 overflow-hidden w-full">
                                                                            <button
                                                                                onClick={() => removePlayer(p.id)}
                                                                                className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 h-8 w-8 flex items-center justify-center -ml-2"
                                                                            >
                                                                                <Icons.close className="w-4 h-4" />
                                                                            </button>
                                                                            <span className="truncate font-bold text-sm md:text-sm text-foreground">{p.name}</span>
                                                                        </div>

                                                                        {/* Controls Section */}
                                                                        <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-2 md:gap-4 pl-6 md:pl-0">
                                                                            {/* Hours */}
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[10px] text-muted-foreground md:hidden">ชม.</span>
                                                                                <Input
                                                                                    type="number"
                                                                                    value={p.hours}
                                                                                    onChange={(e) => updatePlayerHours(p.id, e.target.value)}
                                                                                    className="h-9 w-16 text-center text-sm font-bold bg-white/50 px-1"
                                                                                />
                                                                            </div>

                                                                            {/* Match Counter */}
                                                                            <div className="flex items-center gap-1 bg-muted/30 rounded-full p-0.5">
                                                                                <Button
                                                                                    variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm"
                                                                                    onClick={() => updatePlayerMatches(p.id, -1)}
                                                                                >
                                                                                    <Icons.minus className="w-3 h-3" />
                                                                                </Button>
                                                                                <div className="w-8 text-center font-bold text-sm">
                                                                                    {p.matchCount || 0}
                                                                                </div>
                                                                                <Button
                                                                                    variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90 shadow-sm"
                                                                                    onClick={() => updatePlayerMatches(p.id, 1)}
                                                                                >
                                                                                    <Icons.plus className="w-3 h-3" />
                                                                                </Button>
                                                                            </div>

                                                                            {/* Cost */}
                                                                            <div className="w-16 md:w-20 text-right font-black text-primary text-base">
                                                                                {cost}
                                                                            </div>

                                                                            {/* Checkbox (moved to right) */}
                                                                            <div className="w-10 flex justify-center">
                                                                                <Checkbox
                                                                                    checked={selectedPlayers.includes(p.id)}
                                                                                    onCheckedChange={(checked) => {
                                                                                        if (checked) {
                                                                                            setSelectedPlayers(prev => [...prev, p.id]);
                                                                                        } else {
                                                                                            setSelectedPlayers(prev => prev.filter(id => id !== p.id));
                                                                                        }
                                                                                    }}
                                                                                    className="shrink-0 data-[state=checked]:bg-[#FF9500] border-[#FF9500]"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </GlassCard>

                                        {/* Total Summary Footer for Shuttle Mode */}
                                        <div className="sticky bottom-4 z-10">
                                            <GlassCard className="p-4 bg-primary text-primary-foreground border-none shadow-xl">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div>
                                                        <p className="text-xs opacity-80">ยอดรวมที่เก็บได้</p>
                                                        <h2 className="text-2xl font-black">
                                                            {players.reduce((sum, p) => sum + getPlayerCost(p), 0).toLocaleString()} บาท
                                                        </h2>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs opacity-80">ผู้เล่น {players.length} คน</p>
                                                        <p className="text-xs opacity-80">รวม {players.reduce((sum, p) => sum + (p.matchCount || 0), 0)} เกม</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        className="flex-1 bg-white text-primary hover:bg-white/90 font-bold"
                                                        onClick={() => {
                                                            setShowBill(true);
                                                            setSelectedPlayers([]);
                                                        }}
                                                    >
                                                        <Icons.receipt className="w-4 h-4 mr-2" /> สรุปบิล
                                                    </Button>
                                                    {selectedPlayers.length > 0 && (
                                                        <Button
                                                            className="flex-1 bg-green-500 text-white hover:bg-green-600 font-bold shadow-lg"
                                                            onClick={() => setShowIndividualBill(true)}
                                                        >
                                                            <Icons.receipt className="w-4 h-4 mr-2" /> ออกบิลรายคน ({selectedPlayers.length})
                                                        </Button>
                                                    )}
                                                </div>
                                            </GlassCard>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppShell >
    );
}
