"use client";

import Image from "next/image";
import Link from "next/link";

export function MobileTopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[#f6f8f8]/80 dark:bg-[#112120]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 md:hidden h-14 flex items-center px-4">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="relative w-8 h-8">
          <Image
            src="/guestHubLogo.png"
            alt="GuestHub Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-[#0e1b1a] dark:text-white">
            GUESTLINK
          </span>
          <p className="text-[10px] text-neutral-500 font-medium tracking-wide leading-none">
            You stay, connected.
          </p>
        </div>
      </Link>
    </div>
  );
}
