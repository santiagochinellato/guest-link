"use client";

import { TramFront, MapPinned } from "lucide-react";

interface GuestTransportViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transport: any[];
}

export function GuestTransportView({ transport }: GuestTransportViewProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="space-y-2 flex flex-col items-center justufy-center">
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
          Transporte
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Opciones para moverte por la ciudad.
        </p>
      </div>

      <div className="grid gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {transport?.map((item: any, i: number) => (
          <div
            key={i}
            className="group flex flex-col sm:flex-row gap-4 bg-white dark:bg-brand-void p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-neutral-700 hover:border-blue-200 transition-colors"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="flex gap-2 items-center">
                <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center text-blue-500 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                  <TramFront className="w-7 h-7" />
                  <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-neutral-700 px-2.5 py-1 rounded-lg text-gray-500">
                    {item.type}
                  </span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col items-start gap-1">
                    <h4 className="font-bold text-lg text-neutral-900 dark:text-white">
                      {item.name}
                    </h4>
                  </div>
                  {item.website && (
                    <button
                      onClick={() => window.open(item.website, "_blank")}
                      className="text-xs flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      <MapPinned className="w-3 h-3" />
                      Ver ruta en mapa
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
