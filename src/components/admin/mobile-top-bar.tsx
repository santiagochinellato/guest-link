"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { MobileSidebar } from "./mobile-sidebar";

export function MobileTopBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#f6f8f8]/80 dark:bg-brand-void/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 md:hidden h-14 flex items-center justify-between px-4 w-full">
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
        </div>
      </Link>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="-mr-2">
            <Menu className="h-6 w-6 text-brand-void dark:text-white" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-full sm:w-[320px] border-none shadow-2xl"
        >
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <MobileSidebar onLinkClick={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
