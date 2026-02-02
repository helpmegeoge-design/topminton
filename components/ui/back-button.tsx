"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href?: string;
  fallbackHref?: string;
  label?: string;
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export function BackButton({
  href,
  fallbackHref = "/",
  label,
  variant = "ghost",
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  if (href) {
    return (
      <Link href={href}>
        <Button
          variant={variant}
          size={label ? "sm" : "icon"}
          className={cn("rounded-full", className)}
        >
          <Icons.chevronLeft className="h-5 w-5" />
          {label && <span className="ml-1">{label}</span>}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      size={label ? "sm" : "icon"}
      onClick={handleClick}
      className={cn("rounded-full", className)}
    >
      <Icons.chevronLeft className="h-5 w-5" />
      {label && <span className="ml-1">{label}</span>}
    </Button>
  );
}
