import { Plus } from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/actions/properties";

export default async function DashboardPage() {
  const result = await getProperties();
  const properties = result.success ? result.data : [];
  const activePropertiesCount = properties ? properties.length : 0; // Simple count for now

  // Take only last 5
  const recentProperties = properties ? properties.slice(0, 5) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resumen</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Administra tus propiedades y guías.
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Propiedad
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Vistas Totales</p>
          <h3 className="text-3xl font-bold mt-2">258</h3>
          <p className="text-xs text-green-600 mt-1">+12% mes anterior</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Propiedades Activas
          </p>
          <h3 className="text-3xl font-bold mt-2">{activePropertiesCount}</h3>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Escaneos QR</p>
          <h3 className="text-3xl font-bold mt-2">142</h3>
          <p className="text-xs text-green-600 mt-1">Alta participación</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
          <h3 className="font-semibold">Recent Properties</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          {recentProperties.map((prop: any) => (
            <div
              key={prop.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-semibold text-gray-500">
                  {prop.name.substring(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-sm">{prop.name}</p>
                  <p className="text-xs text-gray-500">/{prop.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${true ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600"}`}
                >
                  Active
                </span>
                <span className="text-sm text-gray-500">0 views</span>
              </div>
            </div>
          ))}
          {recentProperties.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No properties found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
