"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/ui/level-badge";
import { ArrowLeftIcon, CheckIcon, StarIcon, TrophyIcon, ShareIcon } from "@/components/icons";
import { Suspense } from "react";
import { toast } from "sonner";

function CompletedContent() {
    const params = useSearchParams();
    const router = useRouter();
    const level = params.get("level") || "beginner";

    // Generate static ID for hydration stability
    const certId = `TBAD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Simple details
    const getLevelDetails = (lvl: string) => {
        return {
            date: new Date().toLocaleDateString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric'
            })
        };
    };

    const details = getLevelDetails(level);

    return (
        <div className="flex flex-col min-h-screen bg-black relative overflow-hidden font-sans">

            {/* Cyber Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <header className="sticky top-0 z-20 backdrop-blur-md bg-black/50 border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/")}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeftIcon size={20} className="text-white" />
                    </button>
                    <h1 className="text-lg font-bold text-white tracking-wide">
                        CERTIFIED RESULT
                    </h1>
                </div>
            </header>

            <div className="flex-1 p-6 flex flex-col items-center justify-center pb-20 relative z-10">

                <div className="text-center mb-10 animate-in fade-in zoom-in duration-700">
                    <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(74,222,128,0.5)]">
                        <CheckIcon size={32} className="text-black" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Mission Complete!</h2>
                    <p className="text-white/60 text-sm mt-1 font-medium">Your skill data has been synced.</p>
                </div>

                {/* Modern Digital Certificate Card */}
                <div className="w-full max-w-sm relative group perspective-1000 mx-auto transform transition-all hover:scale-[1.02] duration-500">

                    {/* Glowing Border Gradient */}
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse"></div>

                    <div className="relative bg-zinc-950 rounded-2xl overflow-hidden h-full flex flex-col">

                        {/* Top Bar Tech Elements */}
                        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
                        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                                <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Verified Asset</span>
                            </div>
                            <TrophyIcon size={16} className="text-white/30" />
                        </div>

                        {/* Main Content */}
                        <div className="p-8 flex flex-col items-center text-center relative">
                            {/* Grid Pattern Overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                            <p className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">Badminton Proficiency</p>

                            <h2 className="text-xl font-medium text-white mb-6">
                                <span className="text-white/50">Awarded to </span><br />
                                <span className="text-2xl font-bold tracking-tight">PLAYER</span>
                            </h2>

                            {/* Center Level - Neon Style */}
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>
                                <LevelBadge level={level} size="lg" className="text-4xl px-10 py-4 shadow-2xl z-10 relative scale-125 ring-2 ring-white/20 backdrop-blur-xl" />
                            </div>

                            <p className="text-sm text-white/80 font-medium mb-6 leading-relaxed">
                                ได้รับการประเมินระดับฝีมือแบดมินตัน<br />
                                <span className="text-cyan-400">"โดยการทำแบบสอบถาม"</span><br />
                                <span className="text-[10px] text-white/40 block mt-1">(Assessment by Questionnaire)</span>
                            </p>

                            {/* Tech Footer */}
                            <div className="w-full bg-white/5 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
                                    <div className="text-left">
                                        <div className="text-[9px] text-white/40 uppercase">ID</div>
                                        <div className="text-[10px] font-mono text-cyan-400">{certId}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] text-white/40 uppercase">Date</div>
                                        <div className="text-[10px] font-mono text-white">{details.date}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="text-left">
                                        <p className="text-[8px] text-white/40 mb-0.5">AUTHORIZED BY</p>
                                        <p className="text-xs font-black italic text-white tracking-wider">TOP BADMINTON AI</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] text-white/40">POWERED BY</span>
                                        <div className="flex items-center gap-1.5 mt-0.5 bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-white">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></span>
                                            GEMINI
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="mt-8 w-full max-w-sm space-y-3">
                    <Button
                        className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.1)] bg-white text-black hover:bg-zinc-200 border-0"
                        onClick={() => router.push("/")}
                    >
                        DONE
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-12 border-white/20 text-white hover:bg-white/5 bg-transparent"
                        onClick={() => {
                            toast.success("Copied Share Link!");
                        }}
                    >
                        <ShareIcon size={18} className="mr-2" />
                        SHARE RESULT
                    </Button>
                </div>

            </div>
        </div>
    );
}

export default function AssessmentCompletedPage() {
    return (
        <AppShell hideNav>
            <Suspense fallback={<div className="p-10 text-center text-white">Loading...</div>}>
                <CompletedContent />
            </Suspense>
        </AppShell>
    );
}
