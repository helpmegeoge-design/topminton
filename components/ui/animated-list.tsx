"use client";

import { useEffect, useRef, ReactNode } from "react";

interface AnimatedListProps {
    children: ReactNode;
    className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const items = containerRef.current.children;
        Array.from(items).forEach((item, index) => {
            if (item instanceof HTMLElement) {
                item.classList.add("animate-fade-in-up");
                item.classList.add(`stagger-${Math.min(index + 1, 10)}`);
            }
        });
    }, [children]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}

interface AnimatedItemProps {
    children: ReactNode;
    className?: string;
}

export function AnimatedItem({ children, className }: AnimatedItemProps) {
    return (
        <div className={`tap-effect ${className || ""}`}>
            {children}
        </div>
    );
}
