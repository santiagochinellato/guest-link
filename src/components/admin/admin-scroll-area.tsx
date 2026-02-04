"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { cn } from "@/lib/utils";

interface AdminScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminScrollArea({ children, className }: AdminScrollAreaProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const lenis = new Lenis({
      wrapper: wrapper, // The scrollable container
      content: contentRef.current || undefined, // The inner content wrapper (optional but good practice)
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <main
      ref={wrapperRef}
      className={cn(
        "flex-1 h-full overflow-y-auto overflow-x-hidden p-0",
        className,
      )}
    >
      <div ref={contentRef}>{children}</div>
    </main>
  );
}
