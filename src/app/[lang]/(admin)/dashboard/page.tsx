import { TrendingUp, Eye, Home, Scan } from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/actions/properties";
import { PropertiesGrid } from "@/components/admin/properties-grid";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const result = await getProperties();
  const properties = result.success && result.data ? result.data : [];

  const activePropertiesCount = properties.length;
  const totalViews = properties.reduce(
    (acc, curr) => acc + (curr.views || 0),
    0,
  );
  // qrScans is not yet supported in DB
  const totalScans = 0;

  return (
    <div className=" mx-auto px-8 py-6 flex flex-col gap-8">
      {/* Header Section */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[#4b5563] dark:text-white text-sm font-medium uppercase tracking-wider">
            Good morning, Santiago
          </h2>
          <h1 className="text-4xl font-black text-brand-void dark:text-white tracking-tight">
            Dashboard
          </h1>
        </div>
      </header>

      {/* Stats Section */}
      <section className="flex overflow-x-auto pb-4 gap-4 snap-x -mx-6 px-6 no-scrollbar md:grid md:grid-cols-3 md:gap-6 md:mx-0 md:px-0 md:overflow-visible">
        {/* Stat Card 1 */}
        <div className="min-w-[280px] md:min-w-0 md:w-auto snap-center bg-white dark:bg-brand-void p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-brand-copper/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <Eye className="w-5 h-5" />
            </div>
            <span className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-brand-void dark:text-white">
              Total Views
            </p>
            <h3 className="text-3xl font-bold text-brand-void dark:text-white mt-1">
              {totalViews}
            </h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="min-w-[280px] md:min-w-0 md:w-auto snap-center bg-white dark:bg-brand-void p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-brand-copper/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-copper/10 rounded-lg text-brand-copper group-hover:bg-brand-copper/20 transition-colors">
              <Home className="w-5 h-5" />
            </div>
            <span className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-brand-void dark:text-white">
              Active Properties
            </p>
            <h3 className="text-3xl font-bold text-brand-void dark:text-white mt-1">
              {activePropertiesCount}
            </h3>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="min-w-[280px] md:min-w-0 md:w-auto snap-center bg-white dark:bg-brand-void p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-brand-copper/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
              <Scan className="w-5 h-5" />
            </div>
            <span className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-brand-void dark:text-white">
              QR Scans
            </p>
            <h3 className="text-3xl font-bold text-brand-void dark:text-white mt-1">
              {totalScans}
            </h3>
          </div>
        </div>
      </section>

      {/* Property Grid Section */}
      <section className="flex flex-col gap-4 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Your Properties
          </h3>
          <Link
            href={`/${lang}/dashboard/properties/new`}
            className="bg-brand-void hover:bg-brand-void/90 dark:bg-brand-copper dark:hover:bg-brand-copper/90 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>Agregar Propiedad</span>
          </Link>
        </div>
        <PropertiesGrid initialProperties={properties as any} />
      </section>
    </div>
  );
}
