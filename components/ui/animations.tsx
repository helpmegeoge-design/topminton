"use client";

import React from "react"

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeIn({ children, className, delay = 0, duration = 300 }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

interface SlideInProps {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
}

export function SlideIn({ 
  children, 
  className, 
  direction = "up", 
  delay = 0, 
  duration = 300 
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    left: isVisible ? "translate-x-0" : "-translate-x-full",
    right: isVisible ? "translate-x-0" : "translate-x-full",
    up: isVisible ? "translate-y-0" : "translate-y-full",
    down: isVisible ? "translate-y-0" : "-translate-y-full",
  };

  return (
    <div
      className={cn(
        "transition-all",
        isVisible ? "opacity-100" : "opacity-0",
        directionClasses[direction],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function ScaleIn({ children, className, delay = 0, duration = 300 }: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

interface StaggerChildrenProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export function StaggerChildren({ 
  children, 
  className, 
  staggerDelay = 50, 
  initialDelay = 0 
}: StaggerChildrenProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={initialDelay + index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

interface PulseProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

export function Pulse({ children, className, isActive = true }: PulseProps) {
  return (
    <div className={cn(isActive && "animate-pulse", className)}>
      {children}
    </div>
  );
}

interface NumberFlipProps {
  value: number;
  className?: string;
}

export function NumberFlip({ value, className }: NumberFlipProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <span
      className={cn(
        "inline-block transition-transform duration-150",
        isFlipping && "scale-y-0",
        className
      )}
    >
      {displayValue}
    </span>
  );
}

interface ConfettiProps {
  isActive: boolean;
  className?: string;
}

export function Confetti({ isActive, className }: ConfettiProps) {
  if (!isActive) return null;

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96E6A1", "#DDA0DD", "#F7DC6F"][
              Math.floor(Math.random() * 6)
            ],
            animationDelay: `${Math.random() * 1000}ms`,
            animationDuration: `${2000 + Math.random() * 1000}ms`,
          }}
        />
      ))}
    </div>
  );
}
