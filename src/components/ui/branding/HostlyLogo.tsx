"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

// Icono extraído a archivo público para evitar problemas de string gigante
const LOGO_ICON_PATH = "/hostly-icon.svg";

interface HostlyLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function HostlyLogoHorizontal({ className, ...props }: HostlyLogoProps) {
  const uniqueId = useId().replace(/:/g, ""); // Remove colons for safe ID
  const maskId = `mask-h-${uniqueId}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1640 900"
      className={cn("w-full h-auto text-brand-copper", className)}
      {...props}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <image
            width="400"
            height="400"
            x="-107"
            y="-7"
            transform="matrix(1.664,0,0,1.664,0,0)"
            href={LOGO_ICON_PATH}
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </mask>
      </defs>
      {/* Texto HOSTLY */}
      <text
        transform="matrix(1.616,0,0,1.616,327.001,149)"
        className="fill-current font-sans font-bold"
        style={{ fontSize: "183px" }}
      >
        <tspan x="60.5" y="138.5">
          H
        </tspan>
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
        <tspan x="119.2" y="45.4">
          The city, simplified
        </tspan>
      </text>

      {/* Icono (Masked Rect) */}
      {/* Transform math: Matrix(1.664, 0, 0, 1.664, -107, -7) means Scale 1.664 then Translate -107, -7? Or Translate then Scale? SVG matrix is usually applied to the coordinate system.
          Original use: <use transform="matrix(...)"> effectively scales the instance.
          Here we put x/y/transform on the image inside mask, and use a rect covering the area.
          Rect area: Needs to cover the transformed image.
          Simple approach: Apply the transform to the rect itself? No, mask/rect relation.
          Better: Apply the transform to any Group wrapping the rect?
          Let's use the exact same transform on the image inside the mask,
          and make the Rect huge enough, or match the bounding box.
      */}
      <rect
        x="-200"
        y="-200"
        width="1000"
        height="1000"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}

export function HostlyLogoVertical({ className, ...props }: HostlyLogoProps) {
  const uniqueId = useId().replace(/:/g, "");
  const maskId = `mask-v-${uniqueId}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 800"
      className={cn("w-full h-auto text-brand-copper", className)}
      {...props}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <image
            width="353"
            height="605"
            x="364"
            y="54"
            href={LOGO_ICON_PATH}
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </mask>
      </defs>

      {/* Texto HOSTLY - Subido 90px mas */}
      <text
        transform="translate(125,550)"
        className="fill-current font-sans font-bold"
        style={{ fontSize: "183px" }}
      >
        <tspan x="60.5" y="138.5">
          H
        </tspan>
        <tspan y="138.5">O</tspan>
        <tspan y="138.5">S</tspan>
        <tspan y="138.5">T</tspan>
        <tspan y="138.5">L</tspan>
        <tspan y="138.5">Y</tspan>
      </text>

      {/* Icono (Masked Rect) */}
      <rect
        x="364"
        y="54"
        width="353"
        height="605"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />

      {/* Slogan - Subido 90px mas */}
      <text
        transform="translate(146,710)"
        className="fill-current font-sans font-bold"
        style={{ fontSize: "60px" }}
      >
        <tspan x="119.2" y="45.4">
          The city, simplified
        </tspan>
      </text>
    </svg>
  );
}
