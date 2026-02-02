"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DateStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  daysToShow?: number;
  className?: string;
}

const thaiDays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const thaiMonths = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

function generateDates(daysCount: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function DateStrip({ 
  selectedDate, 
  onDateSelect, 
  daysToShow = 14,
  className 
}: DateStripProps) {
  const dates = generateDates(daysToShow);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Scroll to selected date on mount
  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = dates.findIndex(date => isSameDay(date, selectedDate));
      if (selectedIndex >= 0) {
        const itemWidth = 56; // approximate width of each date item
        const scrollPosition = selectedIndex * itemWidth - (scrollRef.current.clientWidth / 2) + (itemWidth / 2);
        scrollRef.current.scrollTo({ left: Math.max(0, scrollPosition), behavior: "smooth" });
      }
    }
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2"
        onTouchStart={() => setIsScrolling(true)}
        onTouchEnd={() => setIsScrolling(false)}
      >
        {dates.map((date) => {
          const selected = isSameDay(date, selectedDate);
          const today = isToday(date);
          
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onDateSelect(date)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[52px] h-[72px] rounded-2xl transition-all duration-200 tap-highlight",
                selected 
                  ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                  : "bg-secondary text-foreground hover:bg-secondary/80",
                today && !selected && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <span className={cn(
                "text-[10px] font-medium",
                selected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {thaiDays[date.getDay()]}
              </span>
              <span className={cn(
                "text-lg font-bold",
                selected ? "text-primary-foreground" : "text-foreground"
              )}>
                {date.getDate()}
              </span>
              <span className={cn(
                "text-[10px] font-medium",
                selected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {thaiMonths[date.getMonth()]}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
