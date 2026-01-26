import { Plus } from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/actions/properties";
import { PropertiesGrid } from "@/components/admin/properties-grid";

interface Property {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  status: string | null;
  coverImageUrl?: string | null;
  wifiSsid?: string | null;
  houseRules?: string | null;
}

// Server Component
export default async function PropertiesPage() {
  const result = await getProperties();
  const properties = (result.success ? result.data : []) as Property[];

  return (
    <div className="space-y-6 px-2 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      <PropertiesGrid initialProperties={properties} />
    </div>
  );
}
