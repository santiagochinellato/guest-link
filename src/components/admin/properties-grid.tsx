"use client";

import { useState } from "react";

import {
  Search,
  MapPin,
  Info,
  Map,
  Wifi,
  MessageSquare,
  Bus,
  FileText,
  Phone,
  QrCode,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyCardActions } from "@/components/admin/property-card-actions";
import { cn } from "@/lib/utils";

interface Property {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  status: string | null;
  coverImageUrl?: string | null;
  wifiSsid?: string | null;
  houseRules?: string | null;
  sections?: {
    basic: boolean;
    location: boolean;
    wifi: boolean;
    recommendations: boolean;
    transport: boolean;
    rules: boolean;
    emergency: boolean;
    qr: boolean;
  };
}

interface PropertiesGridProps {
  initialProperties: Property[];
}

export function PropertiesGrid({ initialProperties }: PropertiesGridProps) {
  const [filter, setFilter] = useState("");

  const filteredProperties = initialProperties.filter(
    (prop) =>
      prop.name.toLowerCase().includes(filter.toLowerCase()) ||
      (prop.address &&
        prop.address.toLowerCase().includes(filter.toLowerCase())),
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 bg-white dark:bg-brand-void p-2 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-void dark:text-white" />
          <input
            type="text"
            placeholder="Buscar propiedades por nombre o dirección..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-transparent outline-none text-brand-void dark:text-white placeholder:text-brand-void dark:placeholder:text-white"
          />
        </div>
        <div className="h-px md:h-6 w-full md:w-px bg-gray-100 dark:bg-neutral-800" />
        <select className="text-sm bg-transparent md:border-l-0 border-gray-200 dark:border-neutral-800 px-2 md:pl-0 md:pr-8 outline-none py-2 md:py-0 w-full md:w-auto text-brand-void dark:text-white">
          <option>Todos los estados</option>
          <option>Activo</option>
          <option>Borrador</option>
        </select>
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredProperties.map((prop) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={prop.id}
              className="group relative bg-white dark:bg-brand-void rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300"
            >
              {/* Image Area */}
              <div className="aspect-[4/3] relative bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                {prop.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={prop.coverImageUrl}
                    alt={prop.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-900">
                    <ImageIcon className="w-12 h-12 text-brand-void dark:text-white" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[12px] font-bold uppercase backdrop-blur-md shadow-sm border border-white/10",
                      prop.status === "active"
                        ? "bg-brand-copper text-white"
                        : "bg-gray-500/90 text-white",
                    )}
                  >
                    {prop.status || "Draft"}
                  </span>
                </div>

                {/* Secciones Configuradas */}
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[90%]">
                  {(() => {
                    const sections = prop.sections || {
                      basic: false,
                      location: false,
                      wifi: false,
                      recommendations: false,
                      transport: false,
                      rules: false,
                      emergency: false,
                      qr: false,
                    };

                    const sectionConfig = [
                      {
                        key: "basic",
                        label: "Info Básica",
                        icon: Info,
                        isConfigured: sections.basic,
                      },
                      {
                        key: "location",
                        label: "Ubicación",
                        icon: Map,
                        isConfigured: sections.location,
                      },
                      {
                        key: "wifi",
                        label: "WiFi",
                        icon: Wifi,
                        isConfigured: sections.wifi,
                      },
                      {
                        key: "recommendations",
                        label: "Recomendaciones",
                        icon: MessageSquare,
                        isConfigured: sections.recommendations,
                      },
                      {
                        key: "transport",
                        label: "Transporte",
                        icon: Bus,
                        isConfigured: sections.transport,
                      },
                      {
                        key: "rules",
                        label: "Reglas",
                        icon: FileText,
                        isConfigured: sections.rules,
                      },
                      {
                        key: "emergency",
                        label: "Emergencia",
                        icon: Phone,
                        isConfigured: sections.emergency,
                      },
                      {
                        key: "qr",
                        label: "Diseño QR",
                        icon: QrCode,
                        isConfigured: sections.qr,
                      },
                    ];

                    return sectionConfig.map((section) => {
                      const Icon = section.icon;
                      return (
                        <div
                          key={section.key}
                          className={cn(
                            "w-7 h-7 rounded-full backdrop-blur-md border flex items-center justify-center transition-all",
                            section.isConfigured
                              ? "bg-brand-copper border-brand-copper/30 text-white shadow-sm"
                              : "bg-gray-500/60 border-gray-400/20 text-gray-300",
                          )}
                          title={`${section.label}: ${section.isConfigured ? "Configurado" : "Pendiente"}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">
                    {prop.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-white text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate ">
                      {prop.address
                        ? prop.address.length > 30
                          ? prop.address.slice(0, 30) + "..."
                          : prop.address
                        : "No address set"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <div className="flex flex-col">
                    <span className="text-[12px] uppercase font-bold text-brand-void dark:text-white tracking-wider mb-2">
                      Actions
                    </span>
                    <PropertyCardActions
                      propertyId={prop.id}
                      slug={prop.slug}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-brand-void dark:text-white mb-2">
            No properties found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            We couldn&apos;t find any properties matching &quot;{filter}&quot;.
            Try adjusting your search terms or create a new property.
          </p>
        </motion.div>
      )}
    </div>
  );
}
