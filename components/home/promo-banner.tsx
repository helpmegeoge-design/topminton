"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CloudIcon, SunIcon, CloudRainIcon, MapPinIcon } from "lucide-react";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  count: number;
  countLabel: string;
  href: string;
  className?: string;
}

export function PromoBanner({
  title,
  subtitle,
  count,
  countLabel,
  href,
  className,
}: PromoBannerProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("กำลังโหลด...");

  useEffect(() => {
    // 1. Time Timer
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);

    // 2. Weather & Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationName("ตำแหน่งของคุณ");

        try {
          // Fetch Weather
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
          const data = await res.json();
          setWeather({
            temp: data.current.temperature_2m,
            code: data.current.weather_code
          });
        } catch (e) {
          console.error("Weather fetch failed", e);
          setLocationName("กรุงเทพมหานคร");
          setWeather({ temp: 30, code: 1 }); // Fallback
        }
      }, (err) => {
        // console.warn("Geolocation denied", err);
        setLocationName("กรุงเทพมหานคร");
        // Default to BKK if permission denied
        setWeather({ temp: 32, code: 1 });
      });
    } else {
      setLocationName("กรุงเทพมหานคร");
      setWeather({ temp: 32, code: 1 });
    }

    return () => clearInterval(timer);
  }, []);

  // Weather Icon Helper
  const getWeatherIcon = (code: number) => {
    if (code === 0) return <SunIcon className="w-8 h-8 text-yellow-300 animate-pulse-soft" />;
    if (code <= 3) return <CloudIcon className="w-8 h-8 text-white/80" />;
    if (code >= 51) return <CloudRainIcon className="w-8 h-8 text-blue-300" />;
    return <SunIcon className="w-8 h-8 text-yellow-300" />;
  };

  const getWeatherLabel = (code: number) => {
    if (code === 0) return "ท้องฟ้าแจ่มใส";
    if (code <= 3) return "มีเมฆบางส่วน";
    if (code >= 51) return "ฝนตก";
    return "ปกติ";
  };

  return (
    <Link
      href={href}
      className={cn(
        "block relative overflow-hidden rounded-[2rem]",
        // Light Mode: Instagram-like Modern Gradient (Orange -> Pink -> Purple)
        "bg-gradient-to-br from-[#FF8C00] via-[#FF0055] to-[#8000FF]",
        // Dark Mode: Cyber Future Glass
        "dark:bg-black/60 dark:backdrop-blur-xl dark:border dark:border-cyan-500/50",
        "dark:shadow-[0_0_30px_rgba(34,211,238,0.15)]",
        "dark:from-transparent dark:to-transparent", // Remove gradient in dark mode

        "p-6 min-h-[180px] flex flex-col justify-center",
        "transition-all duration-500 tap-highlight group",
        "shadow-2xl shadow-orange-500/20",
        "hover:scale-[1.02] hover:shadow-orange-500/30 dark:hover:shadow-cyan-500/30",
        className
      )}
    >
      {/* Texture / Noise Overlay (Visible in both for texture) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-40 mix-blend-overlay pointer-events-none"></div>

      {/* Cyber Grid Background (Dark Mode only) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,transparent,black)] hidden dark:block opacity-30"></div>

      {/* Decorative Blur Circles (Light Mode) */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 blur-3xl rounded-full dark:hidden"></div>
      <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-yellow-300/30 blur-2xl rounded-full mix-blend-overlay dark:hidden"></div>

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="max-w-[55%] space-y-3">
          {/* Badge (Story-like) */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 dark:bg-cyan-900/40 backdrop-blur-md border border-white/10 dark:border-cyan-500/30 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] font-bold text-white dark:text-cyan-300 uppercase tracking-wider">Live Now</span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-1 leading-tight tracking-tight dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-cyan-200 dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              {title}
            </h3>
            <p className="text-sm text-white/90 dark:text-zinc-400 font-medium">{subtitle}</p>
          </div>

          {/* Insta-style Stat Pill */}
          <div className="inline-flex items-center gap-3 bg-white/15 dark:bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10 dark:border-cyan-500/30 group-hover:bg-white/25 dark:group-hover:bg-cyan-950/50 transition-colors">
            <span className="text-3xl font-black text-white dark:text-cyan-400 tracking-tighter dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
              {count}
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] uppercase opacity-70 text-white dark:text-cyan-200">Active</span>
              <span className="text-xs font-bold text-white dark:text-cyan-100">{countLabel}</span>
            </div>
          </div>
        </div>

        {/* Realtime Weather & Time Widget (Replaces Image) */}
        {!time ? (
          <div className="w-32 h-32 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col items-end text-right gap-0.5 z-20">
            {/* Digital Clock */}
            <div className="text-4xl font-black text-white dark:text-cyan-300 tracking-tighter tabular-nums drop-shadow-md dark:drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
              {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* Date */}
            <div className="text-xs font-medium text-white/90 dark:text-cyan-100 uppercase tracking-wide opacity-90">
              {time.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>

            {/* Divider */}
            <div className="w-12 h-[1px] bg-white/30 dark:bg-cyan-500/50 my-2"></div>

            {/* Weather Info */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-white dark:text-white drop-shadow-sm">
                  {weather ? `${Math.round(weather.temp)}°` : "--"}
                </span>
                <span className="text-[10px] font-medium text-white/80 dark:text-zinc-400">
                  {weather ? getWeatherLabel(weather.code) : "..."}
                </span>
              </div>
              {weather ? getWeatherIcon(weather.code) : <CloudIcon className="w-8 h-8 text-white/50" />}
            </div>

            {/* Location Tag */}
            <div className="flex items-center gap-1 mt-1 opacity-75">
              <MapPinIcon className="w-3 h-3 text-white dark:text-cyan-400" />
              <span className="text-[10px] text-white dark:text-cyan-200 truncate max-w-[100px] shadow-sm">{locationName}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
