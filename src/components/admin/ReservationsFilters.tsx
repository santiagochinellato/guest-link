"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ReservationsFiltersProps {
  properties: Array<{ id: number; name: string }>;
}

export function ReservationsFilters({ properties }: ReservationsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const status = searchParams.get("status") || "__all__";
  const platform = searchParams.get("platform") || "__all__";
  const propertyId = searchParams.get("propertyId") || "__all__";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const hasActiveFilters =
    (status && status !== "__all__") ||
    (platform && platform !== "__all__") ||
    (propertyId && propertyId !== "__all__") ||
    dateFrom ||
    dateTo;

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "__all__") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset pagination
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("?");
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded text-xs">
                {[status, platform, propertyId, dateFrom, dateTo].filter(
                  (v) => v && v !== "__all__"
                ).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Filtros</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {/* Estado */}
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Estado
                </Label>
                <Select value={status} onValueChange={(v) => updateFilter("status", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Plataforma */}
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Plataforma
                </Label>
                <Select
                  value={platform}
                  onValueChange={(v) => updateFilter("platform", v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todas</SelectItem>
                    <SelectItem value="booking">Booking.com</SelectItem>
                    <SelectItem value="airbnb">Airbnb</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Propiedad */}
              {properties.length > 0 && (
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                    Propiedad
                  </Label>
                  <Select
                    value={propertyId}
                    onValueChange={(v) => updateFilter("propertyId", v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todas</SelectItem>
                      {properties.map((prop) => (
                        <SelectItem key={prop.id} value={prop.id.toString()}>
                          {prop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Fecha desde */}
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Check-in desde
                </Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Check-out hasta
                </Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
