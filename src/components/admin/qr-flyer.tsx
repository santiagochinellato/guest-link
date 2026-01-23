"use client";

import { useQRCode } from "next-qrcode";
import { forwardRef } from "react";
import { Wifi } from "lucide-react";

interface QrFlyerProps {
  propertyName: string;
  wifiSsid: string;
  qrValue: string;
  accentColor?: string;
}

export const QrFlyer = forwardRef<HTMLDivElement, QrFlyerProps>(
  (
    {
      propertyName = "Property Name",
      wifiSsid = "Network Name",
      qrValue = "https://guest-link.com",
      accentColor = "#2563ea", // blue-600
    },
    ref,
  ) => {
    const { Canvas } = useQRCode();

    return (
      <div
        ref={ref}
        className="w-[400px] h-[600px] bg-white text-black flex flex-col items-center justify-between p-12 shadow-2xl relative overflow-hidden"
        style={{ fontFamily: "Inter, sans-serif" }} // Ensure font export works
      >
        {/* Decorative elements */}
        <div
          className="absolute top-0 left-0 w-full h-4"
          style={{ background: accentColor }}
        />

        <div className="text-center space-y-4 pt-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            {propertyName}
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm font-medium">
            Digital Welcome Guide
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 my-8">
          <div className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Canvas
              text={qrValue}
              options={{
                errorCorrectionLevel: "M",
                margin: 2,
                scale: 4,
                width: 280,
                color: {
                  dark: "#000000",
                  light: "#ffffff",
                },
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-gray-900 font-semibold px-6 py-2 bg-gray-50 rounded-full border border-gray-100">
            <Wifi className="w-5 h-5" />
            <span>{wifiSsid}</span>
          </div>
        </div>

        <div className="text-center space-y-2 pb-4">
          <p className="font-semibold text-lg">Scan to Connect</p>
          <p className="text-gray-500 text-sm max-w-[250px]">
            Access the WiFi network and view our local guide instantly.
          </p>
        </div>

        <div
          className="absolute bottom-0 left-0 w-full h-3"
          style={{ background: accentColor, opacity: 0.5 }}
        />
      </div>
    );
  },
);

QrFlyer.displayName = "QrFlyer";
