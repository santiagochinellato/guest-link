"use client";

import { cn } from "@/lib/utils";

// Icono extraído a archivo público para evitar problemas de string gigante
const LOGO_ICON_PATH = "/hostly-icon.svg";

interface HostlyLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function HostlyLogoHorizontal({ className, ...props }: HostlyLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1640 900"
      className={cn("w-full h-auto text-brand-copper", className)}
      {...props}
    >
      {/* Icon image — rendered directly, no mask/filter (PDF-safe) */}
      <image
        width="400"
        height="400"
        x="-107"
        y="-7"
        transform="matrix(1.664,0,0,1.664,0,0)"
        href={LOGO_ICON_PATH}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Texto HOSTLY */}
      <text
        transform="matrix(1.616,0,0,1.616,327.001,149)"
        className="fill-current font-sans font-bold"
        style={{ fontSize: "183px" }}
      >
        <tspan x="60.5" y="138.5">H</tspan>
        <tspan y="138.5">O</tspan>
        <tspan y="138.5">S</tspan>
        <tspan y="138.5">T</tspan>
        <tspan y="138.5">L</tspan>
        <tspan y="138.5">Y</tspan>
      </text>

      {/* Slogan */}
      <text
        transform="matrix(1.616,0,0,1.616,360.946,407.627)"
        className="fill-current font-sans font-bold"
        style={{ fontSize: "60px" }}
      >
        <tspan x="119.2" y="45.4">The city, simplified</tspan>
      </text>
    </svg>
  );
}

export function HostlyLogoVertical({ className, ...props }: HostlyLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 800"
      className={cn("w-full h-auto text-brand-copper", className)}
      {...props}
    >
      {/* Icon image — rendered directly, no mask/filter (PDF-safe) */}
      <image
        width="353"
        height="605"
        x="364"
        y="54"
        href={LOGO_ICON_PATH}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Texto HOSTLY */}
      <text
        transform="translate(125,550)"
        className="fill-current font-sans font-bold"
        style={{ fontSize: "183px" }}
      >
        <tspan x="60.5" y="138.5">H</tspan>
        <tspan y="138.5">O</tspan>
        <tspan y="138.5">S</tspan>
        <tspan y="138.5">T</tspan>
        <tspan y="138.5">L</tspan>
        <tspan y="138.5">Y</tspan>
      </text>

      {/* Slogan */}
      <text
        transform="translate(146,710)"
        className="fill-current font-sans font-bold"
        style={{ fontSize: "60px" }}
      >
        <tspan x="119.2" y="45.4">The city, simplified</tspan>
      </text>
    </svg>
  );
}
