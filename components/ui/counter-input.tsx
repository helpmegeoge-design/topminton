"use client";

import { cn } from "@/lib/utils";

interface CounterInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  helperText?: string;
  className?: string;
}

export function CounterInput({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  label,
  helperText,
  className,
}: CounterInputProps) {
  const handleDecrement = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    const newValue = value + step;
    if (newValue <= max) {
      onChange(newValue);
    }
  };

  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!canDecrement}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 tap-highlight",
            canDecrement
              ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          -
        </button>
        <span className="text-2xl font-bold text-foreground min-w-[40px] text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={!canIncrement}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 tap-highlight",
            canIncrement
              ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          +
        </button>
      </div>
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
