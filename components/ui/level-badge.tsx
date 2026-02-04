"use client";

import { cn } from "@/lib/utils";

// Extended Level Type map to strings for loose typing or update strict type if preferred
// But for now let's keep it compatible.
export type Level = string;

interface LevelBadgeProps {
  level: Level;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const levelConfig: Record<string, { label: string; color: string; style?: React.CSSProperties; className?: string }> = {
  // Solid Colors - Using inline styles for 100% reliability
  beginner: { label: "หน้าบ้าน", color: "text-white", style: { backgroundColor: "#3b82f6" } }, // Blue-500
  "BG-": { label: "BG-", color: "text-white", style: { backgroundColor: "#22c55e" } }, // Green-500
  BG: { label: "BG", color: "text-white", style: { backgroundColor: "#16a34a" } }, // Green-600
  "BG+": { label: "BG+", color: "text-white", style: { backgroundColor: "#15803d" } }, // Green-700
  "N-": { label: "N-", color: "text-white", style: { backgroundColor: "#f97316" } }, // Orange-500
  N: { label: "N", color: "text-white", style: { backgroundColor: "#ea580c" } }, // Orange-600
  "N+": { label: "N+", color: "text-white", style: { backgroundColor: "#c2410c" } }, // Orange-700
  S: { label: "S", color: "text-white", style: { backgroundColor: "#c2410c" } }, // Deep Orange
  "P-": { label: "P-", color: "text-white", style: { backgroundColor: "#ef4444" } }, // Red-500
  P: { label: "P", color: "text-white", style: { backgroundColor: "#dc2626" } }, // Red-600
  "P+": { label: "P+", color: "text-white", style: { backgroundColor: "#b91c1c" } }, // Red-700

  // Gradients - Using Tailwind classes (or we could use background: linear-gradient(...))
  B: { label: "B", color: "text-white", className: "bg-gradient-to-r from-purple-500 to-indigo-600" },
  A: { label: "A", color: "text-white", className: "bg-gradient-to-r from-yellow-500 to-amber-600" },
  C: { label: "C", color: "text-white", className: "bg-gradient-to-r from-yellow-500 to-amber-600" },

  // Legacy/Alternate mappings
  intermediate: { label: "BG", color: "text-white", style: { backgroundColor: "#16a34a" } },
  bg: { label: "BG", color: "text-white", style: { backgroundColor: "#16a34a" } },
  normal: { label: "N", color: "text-white", style: { backgroundColor: "#ea580c" } },
  advanced: { label: "N", color: "text-white", style: { backgroundColor: "#ea580c" } },
  strong: { label: "S", color: "text-white", style: { backgroundColor: "#c2410c" } },
  pro: { label: "P", color: "text-white", style: { backgroundColor: "#dc2626" } },
  champion: { label: "C", color: "text-white", className: "bg-gradient-to-r from-yellow-500 to-amber-600" },
};

const sizeConfig = {
  sm: "text-[10px] px-1.5 py-0.5 rounded",
  md: "text-xs px-2 py-0.5 rounded-md",
  lg: "text-sm px-3 py-1 rounded-lg",
};

export function LevelBadge({ level, size = "md", className }: LevelBadgeProps) {
  // 1. Try direct match
  let config = levelConfig[level];

  // 2. Try case-insensitive adjustments if no direct match
  if (!config && level) {
    const lowerLevel = level.toLowerCase();
    // Find any key that matches case-insensitively
    const matchingKey = Object.keys(levelConfig).find(key => key.toLowerCase() === lowerLevel);
    if (matchingKey) {
      config = levelConfig[matchingKey];
    }
  }

  // 3. Last Resort Fallback: 'beginner'
  if (!config) {
    config = levelConfig['beginner'];
  }

  return (
    <span
      className={cn(
        "font-semibold inline-flex items-center justify-center whitespace-nowrap",
        config.className, // Include Tailwind class if present
        config.color,
        sizeConfig[size],
        className
      )}
      style={config.style} // Apply inline styles (background-color)
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
