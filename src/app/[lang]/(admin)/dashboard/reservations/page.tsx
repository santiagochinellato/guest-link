import { getReservations } from "@/lib/actions/reservations";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search } from "lucide-react";
import Image from "next/image";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query = "" } = await searchParams;
  const { data: reservations, error } = await getReservations(query);

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error al cargar reservas. Intenta recargar la página.
      </div>
    );
  }

  // Helper function to safely format dates
  const safeDate = (dateStr: string) => {
    try {
      // If valid ISO/parseable date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return format(date, "dd MMM yyyy", { locale: es });
      }
      return dateStr; // fallback to raw string
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
            Reservas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona y visualiza las reservas sincronizadas de tus propiedades.
          </p>
        </div>

        {/* Search Bar - Simple Form that refreshes via URL params */}
        <form className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por huésped, código..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-brand-void-light focus:outline-none focus:ring-2 focus:ring-brand-copper/20 transition-all text-sm"
          />
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-brand-void border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-left border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">
                  Huésped
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">
                  Fechas
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">
                  Propiedad
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">
                  Total
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center">
                  Estado
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">
                  Plataforma
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {reservations && reservations.length > 0 ? (
                reservations.map((res) => (
                  <tr
                    key={res.id}
                    className="group hover:bg-gray-50 dark:hover:bg-brand-void-light/30 transition-colors"
                  >
                    {/* Guest */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {res.guestName}
                        </span>
                        <span className="text-xs text-gray-500 font-mono mt-0.5">
                          #{res.reservationCode}
                        </span>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex flex-col text-xs font-medium">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          IN: {safeDate(res.checkIn)}
                        </span>
                        <span className="text-red-500/80 dark:text-red-400/80 mt-0.5">
                          OUT: {safeDate(res.checkOut)}
                        </span>
                      </div>
                    </td>

                    {/* Property */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <p className="truncate max-w-[200px]">
                        {res.listingName || res.propertyName || "Unknown"}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white font-mono">
                      {res.totalPrice} {res.currency}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          res.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30"
                            : res.status === "cancelled"
                              ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30"
                              : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30"
                        }`}
                      >
                        {res.status === "confirmed" && "Confirmada"}
                        {res.status === "cancelled" && "Cancelada"}
                        {res.status === "pending" && "Pendiente"}
                      </span>
                    </td>

                    {/* Platform */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end">
                        {res.platform === "booking" && (
                          <span className="bg-[#003580]/10 text-[#003580] dark:bg-[#003580]/30 dark:text-blue-200 px-2 py-1 rounded text-xs font-bold">
                            Booking
                          </span>
                        )}
                        {res.platform === "airbnb" && (
                          <span className="bg-[#FF5A5F]/10 text-[#FF5A5F] dark:bg-[#FF5A5F]/30 dark:text-red-200 px-2 py-1 rounded text-xs font-bold">
                            Airbnb
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <p className="text-base font-medium">
                      No se encontraron reservas
                    </p>
                    <p className="text-sm mt-1">
                      Sincroniza desde la extensión para ver datos aquí.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
