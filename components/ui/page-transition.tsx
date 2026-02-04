"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.classList.remove("page-transition");
            void ref.current.offsetWidth; // Force reflow
            ref.current.classList.add("page-transition");
        }
    }, [pathname]);

    return (
        <div ref={ref} className="page-transition w-full flex-1">
            {children}
        </div>
    );
}
