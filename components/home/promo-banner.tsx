"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  return (
    <Link
      href={href}
      className={cn(
        "block relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-primary via-[#FFAB40] to-[#FFD740]",
        "p-5 min-h-[160px]",
        "transition-all duration-300 tap-highlight",
        "shadow-lg shadow-primary/25",
        "hover:shadow-xl hover:shadow-primary/30",
        "active:scale-[0.98]",
        className
      )}
    >
      {/* 3D Mascot Image */}
      <div className="absolute right-0 bottom-0 w-40 h-40">
        <Image
          src="/images/banners/mascot-banner.jpg"
          alt="Topminton Mascot"
          width={160}
          height={160}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[55%]">
        <h3 className="text-lg font-bold text-white mb-1 drop-shadow-sm">{title}</h3>
        <p className="text-sm text-white/90 mb-3">{subtitle}</p>

        {/* Counter */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white drop-shadow-sm">{count}</span>
          <span className="text-sm text-white/90">{countLabel}</span>
        </div>
      </div>
    </Link>
  );
}
