import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingShuttlecockProps {
    className?: string;
    size?: number;
}

export function LoadingShuttlecock({ className, size = 120 }: LoadingShuttlecockProps) {
    return (
        <div
            className={cn("relative flex items-center justify-center overflow-hidden", className)}
            style={{ width: size, height: size }}
        >
            <style jsx>{`
        @keyframes shuttlecock-spin-float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }

        @keyframes shadow-breathe {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(0.6); opacity: 0.1; }
        }
      `}</style>

            <div
                className="z-10 w-2/3 h-2/3 origin-center"
                style={{ animation: 'shuttlecock-spin-float 1.5s ease-in-out infinite' }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                    <g transform="rotate(-45 50 50)">
                        {/* Cork (Head) - With gradient for 3D look */}
                        <defs>
                            <linearGradient id="corkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#D97706" /> {/* Darker Orange */}
                                <stop offset="50%" stopColor="#FF9500" /> {/* Primary Orange */}
                                <stop offset="100%" stopColor="#FBBF24" /> {/* Light Orange */}
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="75" r="10" fill="url(#corkGradient)" />
                        <path d="M40 75 A 10 10 0 0 1 60 75" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

                        {/* Feathers (Skirt) - Realistic shape */}
                        <path d="M42 68 L32 25 L45 25 L48 66" fill="white" stroke="#E5E7EB" strokeWidth="0.5" />
                        <path d="M58 68 L68 25 L55 25 L52 66" fill="white" stroke="#E5E7EB" strokeWidth="0.5" />
                        <path d="M48 66 L45 25 L55 25 L52 66" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="0.5" /> {/* Center feather */}

                        {/* Threads binding feathers */}
                        <path d="M38 35 H62" stroke="#D1D5DB" strokeWidth="1" fill="none" />
                        <path d="M40 45 H60" stroke="#D1D5DB" strokeWidth="1" fill="none" />
                    </g>
                </svg>
            </div>

            {/* Shadow */}
            <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black rounded-[100%] blur-sm"
                style={{
                    width: size * 0.4,
                    height: size * 0.05,
                    animation: 'shadow-breathe 1.5s ease-in-out infinite'
                }}
            />
        </div>
    );
}
