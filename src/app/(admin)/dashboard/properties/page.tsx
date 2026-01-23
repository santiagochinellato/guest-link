import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { PropertyActionsMenu } from "@/components/admin/property-actions-menu";

const MOCK_PROPERTIES = [
  {
    id: 1,
    name: "Casa Azul - Ocean View",
    slug: "casa-azul",
    address: "Av. Del Mar 123",
    active: true,
  },
  {
    id: 2,
    name: "Mountain Cabin",
    slug: "mountain-cabin",
    address: "Camino al Bosque 55",
    active: true,
  },
  {
    id: 3,
    name: "City Loft",
    slug: "city-loft",
    address: "Centro 882, Depto 4B",
    active: false,
  },
];

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your rental units and guides.
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-2 rounded-lg border border-gray-200 dark:border-neutral-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-transparent outline-none"
          />
        </div>
        <select className="text-sm bg-transparent border-l border-gray-200 dark:border-neutral-800 pl-4 pr-8 outline-none">
          <option>All Status</option>
          <option>Active</option>
          <option>Draft</option>
        </select>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
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
            {MOCK_PROPERTIES.map((prop) => (
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
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${prop.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600"}`}
                  >
                    {prop.active ? "Active" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <PropertyActionsMenu propertyId={prop.id} slug={prop.slug} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
