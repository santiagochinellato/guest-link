"use client";

import Image from "next/image";
import Link from "next/link";

export function MobileTopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[#f6f8f8]/80 dark:bg-brand-void/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 md:hidden h-14 flex items-center px-4">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="relative w-8 h-8">
          <Image
            src="/hostlyLogo.webp"
            alt="Hostly Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-brand-void dark:text-white">
            HOSTLY
          </span>
          <p className="text-[10px] text-neutral-500 font-medium tracking-wide leading-none">
            The city, simplified.
          </p>
        </div>
      </Link>
    </div>
  );
}
