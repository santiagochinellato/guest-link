"use client";

import { Table, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReservationsViewToggleProps {
  view: "table" | "calendar";
  onViewChange: (view: "table" | "calendar") => void;
}

export function ReservationsViewToggle({ view, onViewChange }: ReservationsViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Button
        variant={view === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className={cn(
          "gap-2",
          view === "table" && "bg-brand-copper  dark:bg-brand-void shadow-sm"
        )}
      >
        <Table className="w-4 h-4" />
        Tabla
      </Button>
      <Button
        variant={view === "calendar" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("calendar")}
        className={cn(
          "gap-2",
          view === "calendar" && "bg-brand-copper  dark:bg-brand-void shadow-sm"
        )}
      >
        <Calendar className="w-4 h-4" />
        Calendario
      </Button>
    </div>
  );
}
