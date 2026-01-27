import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FlyerConfig } from "@/components/admin/qr-flyer/types";

interface UseFlyerExportProps {
  qrRef: React.RefObject<HTMLDivElement>;
  config: FlyerConfig;
}

export function useFlyerExport({ qrRef, config }: UseFlyerExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: "png" | "pdf") => {
    if (!qrRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 3, // High Res
        useCORS: true,
        backgroundColor: null,
      });

      if (type === "png") {
        const link = document.createElement("a");
        link.download = `${config.content.title.replace(/\s+/g, "-").toLowerCase()}-flyer.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        const orientation =
          config.design.orientation === "horizontal" ? "l" : "p";
        const pdf = new jsPDF({
          orientation: orientation,
          unit: "mm",
          format: "a4",
        });
        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(
          `${config.content.title.replace(/\s+/g, "-").toLowerCase()}-flyer.pdf`,
        );
      }
    } catch (e) {
      console.error(e);
      alert(`Error exporting flyer: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return { handleExport, isExporting };
}
