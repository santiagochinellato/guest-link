"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle, CloudOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { triggerSync } from "@/lib/actions/sync";
import type { SyncStatusItem } from "@/lib/actions/sync";

const STALE_HOURS = 24;

function isStale(lastSync: Date | null): boolean {
  if (!lastSync) return true;
  const diff = Date.now() - lastSync.getTime();
  return diff > STALE_HOURS * 60 * 60 * 1000;
}

export function SyncStatusCard({
  syncStatuses,
}: {
  syncStatuses: SyncStatusItem[];
}) {
  const router = useRouter();
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const withSyncKey = syncStatuses.filter((s) => s.hasSyncKey);
  const notUpdated = withSyncKey.filter((s) => isStale(s.lastSync));
  const updated = withSyncKey.filter((s) => !isStale(s.lastSync));
  const noConfig = syncStatuses.filter((s) => !s.hasSyncKey);

  const handleSync = async (propertyId: number) => {
    setSyncingId(propertyId);
    toast.info("Solicitando sincronización a la extensión...");
    try {
      const result = await triggerSync(propertyId);
      if (result.success) {
        toast.success("Sincronización enviada. La extensión actualizará los datos.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Error al sincronizar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = () => {
    const first = notUpdated[0];
    if (first) handleSync(first.propertyId);
    else if (withSyncKey[0]) handleSync(withSyncKey[0].propertyId);
  };

  if (syncStatuses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-brand-void border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm min-h-[180px] flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sincronización
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Hostly Extension · Reservas
          </p>
        </div>
        <button
          type="button"
          onClick={handleSyncAll}
          disabled={syncingId !== null || withSyncKey.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-copper hover:bg-brand-copper/90 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {syncingId !== null ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {syncingId !== null ? "Sincronizando…" : "Actualizar"}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {noConfig.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <CloudOff className="w-3.5 h-3.5" />
            Sin extensión: {noConfig.map((s) => s.propertyName).join(", ")}
          </p>
        )}

        {withSyncKey.length > 0 && (
          <ul className="space-y-1.5 text-sm">
            {withSyncKey.map((item) => {
              const stale = isStale(item.lastSync);
              const loading = syncingId === item.propertyId;
              return (
                <li
                  key={item.propertyId}
                  className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <span className="truncate font-medium text-gray-900 dark:text-white">
                    {item.propertyName}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-copper" />
                    ) : stale ? (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Sin actualizar
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {item.lastSync
                          ? item.lastSync.toLocaleDateString(undefined, {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "OK"}
                      </span>
                    )}
                    {!loading && (
                      <button
                        type="button"
                        onClick={() => handleSync(item.propertyId)}
                        className="text-xs font-medium text-brand-copper hover:underline"
                      >
                        Sync
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {withSyncKey.length === 0 && noConfig.length > 0 && (
          <p className="text-sm text-gray-500">
            Configura la extensión en una propiedad para sincronizar reservas.
          </p>
        )}
      </div>
    </div>
  );
}
