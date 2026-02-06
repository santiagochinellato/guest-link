"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportReservationsCSV, exportReservationsPDF } from "@/lib/actions/export-reservations";
import { toast } from "sonner";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import type { GetReservationsFilters } from "@/lib/actions/reservations";
import jsPDF from "jspdf";

interface ExportReservationsButtonProps {
  filters?: GetReservationsFilters;
}

export function ExportReservationsButton({ filters }: ExportReservationsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await exportReservationsCSV(filters);
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `reservas-${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Reservas exportadas como CSV");
      } else {
        toast.error(result.error || "Error al exportar");
      }
    } catch (error) {
      toast.error("Error al exportar CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const result = await exportReservationsPDF(filters);
      if (result.success && result.data) {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Reservas", 14, 22);
        doc.setFontSize(11);
        doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, 14, 30);

        // Simple table generation without autoTable
        const headers = ["Nombre", "Huéspedes", "Email", "Código", "Check-in", "Check-out", "Estado", "Plataforma"];
        const tableData = result.data.map((res) => {
          const { name, guestCountText } = parseGuestInfo(res.guestName);
          return [
            name,
            guestCountText || "-",
          res.guestEmail || "-",
          res.reservationCode,
          new Date(res.checkIn).toLocaleDateString("es-ES"),
          new Date(res.checkOut).toLocaleDateString("es-ES"),
          res.status,
          res.platform,
        ];
        });

        // Simple table (basic implementation)
        let y = 35;
        const rowHeight = 8;
        const colWidths = [35, 35, 45, 25, 28, 28, 22, 22];
        let x = 14;

        // Header
        doc.setFillColor(66, 66, 66);
        doc.setTextColor(255, 255, 255);
        headers.forEach((header, i) => {
          doc.rect(x, y, colWidths[i], rowHeight, "F");
          doc.text(header, x + 2, y + 5);
          x += colWidths[i];
        });

        // Rows
        y += rowHeight;
        doc.setTextColor(0, 0, 0);
        tableData.forEach((row) => {
          x = 14;
          row.forEach((cell, i) => {
            doc.rect(x, y, colWidths[i], rowHeight, "S");
            doc.text(String(cell).substring(0, 20), x + 2, y + 5);
            x += colWidths[i];
          });
          y += rowHeight;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });

        doc.save(`reservas-${new Date().toISOString().split("T")[0]}.pdf`);
        toast.success("Reservas exportadas como PDF");
      } else {
        toast.error(result.error || "Error al exportar");
      }
    } catch (error) {
      toast.error("Error al exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting} className="gap-2">
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
          <FileText className="w-4 h-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
