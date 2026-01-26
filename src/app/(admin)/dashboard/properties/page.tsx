import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { PropertyActionsMenu } from "@/components/admin/property-actions-menu";
import { getProperties } from "@/lib/actions/properties";

// Server Component
export default async function PropertiesPage() {
  const result = await getProperties();
  const properties = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your rental units and guides.
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 bg-white dark:bg-neutral-900 p-2 rounded-lg border border-gray-200 dark:border-neutral-800 px-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-transparent outline-none"
          />
        </div>
        <div className="h-px md:h-6 w-full md:w-px bg-gray-100 dark:bg-neutral-800" />
        <select className="text-sm bg-transparent md:border-l-0 border-gray-200 dark:border-neutral-800 px-2 md:pl-0 md:pr-8 outline-none py-2 md:py-0 w-full md:w-auto">
          <option>All Status</option>
          <option>Active</option>
          <option>Draft</option>
        </select>
      </div>

      {/* Mobile ListView - Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden pb-20 px-2">
        {properties?.map((prop: any) => (
          <div
            key={prop.id}
            className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between"
          >
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {prop.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-1">
                {prop.address}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                  Active
                </span>
                <span className="font-mono text-[10px] text-gray-400">
                  /{prop.slug}
                </span>
              </div>
            </div>
            <div>
              <PropertyActionsMenu propertyId={prop.id} slug={prop.slug} />
            </div>
          </div>
        ))}
        {properties?.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">
            No properties found.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-neutral-800/50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Property</th>
              <th className="px-6 py-3">Slug (URL)</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
            {properties?.map((prop: any) => (
              <tr
                key={prop.id}
                className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium">
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-gray-100">
                      {prop.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {prop.address}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                  /{prop.slug}
                </td>
                <td className="px-6 py-4">
                  {/* Mock status for now as DB doesn't have active column yet */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${true ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600"}`}
                  >
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <PropertyActionsMenu propertyId={prop.id} slug={prop.slug} />
                </td>
              </tr>
            ))}
            {properties?.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No properties found. Create your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
