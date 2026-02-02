"use client";

import { cn } from "@/lib/utils";

export type Level = "beginner" | "intermediate" | "advanced" | "strong" | "pro" | "champion";

interface LevelBadgeProps {
  level: Level;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const levelConfig: Record<Level, { label: string; color: string; bgColor: string }> = {
  beginner: {
    label: "หน้าบ้าน",
    color: "text-white",
    bgColor: "bg-[#1877F2]", // Blue
  },
  intermediate: {
    label: "BG",
    color: "text-white",
    bgColor: "bg-[#31A24C]", // Green
  },
  advanced: {
    label: "N",
    color: "text-white",
    bgColor: "bg-[#F7B928]", // Yellow
  },
  strong: {
    label: "S",
    color: "text-white",
    bgColor: "bg-[#F5793A]", // Orange
  },
  pro: {
    label: "P",
    color: "text-white",
    bgColor: "bg-[#FA383E]", // Red
  },
  champion: {
    label: "B-A",
    color: "text-white",
    bgColor: "bg-gradient-to-r from-[#FFD700] to-[#FFA500]", // Gold gradient
  },
};

const sizeConfig = {
  sm: "text-[10px] px-1.5 py-0.5 rounded",
  md: "text-xs px-2 py-0.5 rounded-md",
  lg: "text-sm px-3 py-1 rounded-lg",
};

export function LevelBadge({ level, size = "md", className }: LevelBadgeProps) {
  const config = levelConfig[level];

  // Return null if level is invalid or not found
  if (!config) {
    return null;
  }

  return (
    <span
      className={cn(
        "font-semibold inline-flex items-center justify-center",
        config.bgColor,
        config.color,
        sizeConfig[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Multi-select level badges
interface LevelBadgeGroupProps {
  levels: Level[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LevelBadgeGroup({ levels, size = "sm", className }: LevelBadgeGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {levels.map((level) => (
        <LevelBadge key={level} level={level} size={size} />
      ))}
    </div>
  );
}
