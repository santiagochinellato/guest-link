"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, QrCode, Lightbulb, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Slide {
  id: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  bgColor: string;
  icon: LucideIcon;
}

function buildSlides(lang?: string): Slide[] {
  const base = lang ? `/${lang}` : "";
  return [
    {
      id: "welcome",
      title: "Bienvenido a Hostly",
      description:
        "Crea tu primera propiedad y empieza a gestionar guías digitales para tus huéspedes.",
      ctaLabel: "Crear propiedad",
      ctaHref: `${base}/dashboard/properties/new`,
      bgColor: "#0F2A3D",
      icon: Sparkles,
    },
    // {
    //   id: "guide",
    //   title: "Guía digital lista para escanear",
    //   description:
    //     "Tus huéspedes tienen todo en un link: WiFi, reglas, recomendaciones y cómo llegar.",
    //   ctaLabel: "Ver ejemplo",
    //   ctaHref: "#",
    //   bgColor: "#1E3A52",
    //   icon: QrCode,
    // },
    {
      id: "tip",
      title: "Tip: Coloca el QR en la entrada",
      description:
        "Imprime el flyer con QR y ponlo en la entrada. Los huéspedes lo escanean sin necesidad de preguntas.",
      bgColor: "#D97706",
      icon: Lightbulb,
    },
    {
      id: "sync",
      title: "Sincroniza tus reservas",
      description:
        "Conecta Booking o Airbnb para importar reservas automáticamente y mantener tu calendario actualizado.",
      ctaLabel: "Saber más",
      ctaHref: "#",
      bgColor: "#0F4C75",
      icon: RefreshCw,
    },
  ];
}

interface BannerCarouselProps {
  lang?: string;
}

export function BannerCarousel({ lang }: BannerCarouselProps) {
  const slides = buildSlides(lang);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const paused = useRef(false);

  const goTo = (index: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setVisible(true);
    }, 150);
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused.current) {
        goTo((current + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [current, slides.length]);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative rounded-2xl overflow-hidden select-none"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {/* Slide */}
      <div
        className="min-h-[180px] px-5 py-5 sm:pl-[46px] sm:px-8 sm:py-7 flex items-center justify-between gap-4 transition-opacity duration-500"
        style={{
          backgroundColor: slide.bgColor,
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Left column */}
        <div className="flex flex-col gap-2 sm:gap-3 min-w-0 flex-1">
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white/70 shrink-0" />
          <div className="space-y-0.5 sm:space-y-1">
            <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight">{slide.title}</h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-md leading-snug line-clamp-2 sm:line-clamp-none">{slide.description}</p>
          </div>
        {slide?.ctaLabel && slide?.ctaHref && (
          <Link
            href={slide.ctaHref}
            className="inline-flex w-fit items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors"
          >
            {slide.ctaLabel}
          </Link>
        )}
        </div>

        {/* Right column: decorative circles */}
        <div className="hidden sm:block shrink-0 w-40 h-40 relative">
          <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
            <circle cx="120" cy="40" r="70" fill="white" fillOpacity="0.05" />
            <circle cx="100" cy="100" r="50" fill="white" fillOpacity="0.07" />
            <circle cx="50" cy="80" r="30" fill="white" fillOpacity="0.10" />
          </svg>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Siguiente"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-[50%] translate-x-[-50%] flex items-center gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-white w-4" : "bg-white/40 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
