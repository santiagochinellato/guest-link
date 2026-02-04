"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  // Disable global lenis on dashboard routes as they have their own internal scroller
  const isDashboard = pathname?.includes("/dashboard");

  useEffect(() => {
    // Detect touch device (mobile/tablet) to use native scroll
    // Lenis is great for desktop mousewheel, but native mobile scroll is best.
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (isDashboard || isTouch) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for premium feel
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
  }, [isDashboard]); // Re-run if path changes (navigating in/out of dashboard)

  return <>{children}</>;
}
