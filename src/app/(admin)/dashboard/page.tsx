import { Plus } from "lucide-react";
import Link from "next/link";

const MOCK_PROPERTIES = [
  {
    id: 1,
    name: "Casa Azul - Ocean View",
    slug: "casa-azul",
    views: 124,
    active: true,
  },
  {
    id: 2,
    name: "Mountain Cabin",
    slug: "mountain-cabin",
    views: 45,
    active: true,
  },
  { id: 3, name: "City Loft", slug: "city-loft", views: 89, active: false },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your properties and guides.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Views</p>
          <h3 className="text-3xl font-bold mt-2">258</h3>
          <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Properties</p>
          <h3 className="text-3xl font-bold mt-2">2</h3>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500">QR Scans</p>
          <h3 className="text-3xl font-bold mt-2">142</h3>
          <p className="text-xs text-green-600 mt-1">High engagement</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
          <h3 className="font-semibold">Recent Properties</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          {MOCK_PROPERTIES.map((prop) => (
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
                  className={`px-2 py-1 rounded-full text-xs font-medium ${prop.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600"}`}
                >
                  {prop.active ? "Active" : "Draft"}
                </span>
                <span className="text-sm text-gray-500">
                  {prop.views} views
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
