"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { triggerSync } from "@/lib/actions/sync";

export function SyncStatusCard({
  propertyId,
  lastSync,
}: {
  propertyId: number;
  lastSync?: Date | null;
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.info("Iniciando sincronización...");

    try {
      const result = await triggerSync(propertyId);
      if (result.success) {
        toast.success(
          "Solicitud enviada a la extensión. Los datos se actualizarán pronto.",
        );
      } else {
        toast.error("Error al iniciar sincronización.");
      }
    } catch (e) {
      toast.error("Error de conexión.");
    } finally {
      // Simulate a short delay before ensuring button is clickable again,
      // though typically we'd wait for realtime feedback.
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-brand-void border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-serif">
            Sincronización
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Conectado con Hostly Extension
          </p>
        </div>
        <div
          className={`p-2 rounded-full ${isSyncing ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"} dark:bg-opacity-20`}
        >
          {isSyncing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1.5" />
          <span>
            {lastSync
              ? `Última vez: ${lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Nunca sincronizado"}
          </span>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="text-sm font-medium text-brand-copper hover:text-brand-gold disabled:opacity-50 transition-colors"
        >
          {isSyncing ? "Sincronizando..." : "Sincronizar ahora"}
        </button>
      </div>
    </div>
  );
}
