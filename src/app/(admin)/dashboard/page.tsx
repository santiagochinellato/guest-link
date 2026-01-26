import {
  Plus,
  TrendingUp,
  Eye,
  Home,
  Scan,
  MapPin,
  Edit2,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/actions/properties";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const result = await getProperties();
  const properties = result.success ? result.data : [];

  const activePropertiesCount = properties.length;
  const totalViews = properties.reduce(
    (acc, curr) => acc + (curr.views || 0),
    0,
  );
  const totalScans = properties.reduce(
    (acc, curr) => acc + (curr.qrScans || 0),
    0,
  );

  // MOCK Images for demo purposes if real properties don't have images
  const MOCK_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBIbq2hY8lu-KIfuzp18Z2NM44OcMQe-quz4whEhr_bqm2ueqNxkdss-5jFC6gllOe-y4pN0BrrHvCsmxN7mNEyTgFHu7NXJ-d3n8ez1FsYn-yfZ46fTWar8B6t1-WQSFyisnRK1rsVQNnByWJ2kTbLVz84w0XZOfOuBJR3qjmxiLcS_XZ3zZ1QbHjw6g4IQQ0g2hL1qIojifELz0MotGn_scGYmsFDUbkvN1FUq8NC5e5ck-TqjMa6IVwcbAjMBDoO5r0XN7Bs7_Y",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDlSNqRGRsKgL7yRH4GTjQjzliYVcpXW63XA5AnBgO3E1dzlARAzJCo3WkRoJgDtw2Rv1pfdx5kstArvNCD_GwKnFBmEx-TRh5km-GEqbDIoBvrJTa-KRam-cKdz0dDtFSGcugkF7Jjmmobf8bT_GgNwsoO2j_Pc0ZD_re-mA8zEhg1X_KB7OKW-Kp-iY7kx5pCoTcuGWFRZ-lb0R6BbTFZkTmUaEACxBMMxU7isGfHE5Dg71rSJUtnHpRtV2GvFGFx4I5KanMRdAo",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBI6sFoTEPka7DLenvuzmosrsFPWvydvzf86jnJgoN6sH4JOh0yROZektUQK_xObTqQkq4ny_ZUCKv4kyvGlpPNv_8bN08M62y2JUMkaqvB-2-i0fsTFDpwBXYFW2Bj75RsuM8SBgrdnHh1GFV1Qq0CbvLjF96mnur1C8WolxlgyMcpbNszPxiXI3XnUD5lH0IPaADyGsAHbX0kThHklxlwXyXnZK1gqE0lOmvfj8BsgcnNIhU2yMn6JvKuH2PZlP-x3bDon4QbpPM",
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-8">
      {/* Header Section */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[#4b5563] dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
            Good morning, Santiago
          </h2>
          <h1 className="text-4xl font-black text-[#0e1b1a] dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="bg-[#0f756d] hover:bg-[#0a554f] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          <span>Add Property</span>
        </Link>
      </header>

      {/* Stats Section */}
      <section className="flex overflow-x-auto pb-4 gap-4 snap-x -mx-6 px-6 no-scrollbar md:grid md:grid-cols-3 md:gap-6 md:mx-0 md:px-0 md:overflow-visible">
        {/* Stat Card 1 */}
        <div className="min-w-[280px] md:min-w-0 md:w-auto snap-center bg-white dark:bg-[#1a2c2b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-[#0f756d]/30 transition-colors group">
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
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Views
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {totalViews}
            </h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="min-w-[280px] md:min-w-0 md:w-auto snap-center bg-white dark:bg-[#1a2c2b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-[#0f756d]/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#0f756d]/10 rounded-lg text-[#0f756d] group-hover:bg-[#0f756d]/20 transition-colors">
              <Home className="w-5 h-5" />
            </div>
            <span className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Active Properties
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {activePropertiesCount}
            </h3>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="min-w-[280px] md:min-w-0 md:w-auto snap-center bg-white dark:bg-[#1a2c2b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-[#0f756d]/30 transition-colors group">
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
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              QR Scans
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
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
            href="/dashboard/properties"
            className="text-sm font-semibold text-[#0f756d] hover:text-[#0a554f] flex items-center gap-1"
          >
            View All
            <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {properties.length > 0 ? (
            properties.map((prop, idx) => (
              <div
                key={prop.id}
                className="group bg-white dark:bg-[#1a2c2b] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex md:flex-col h-full items-center md:items-stretch"
              >
                {/* Desktop Image */}
                <div className="relative h-48 w-full overflow-hidden hidden md:block">
                  <div className="absolute top-3 right-3 z-10 bg-[#0f756d] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Published
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      prop.coverImageUrl ||
                      MOCK_IMAGES[idx % MOCK_IMAGES.length]
                    }
                    alt={prop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Mobile Thumbnail */}
                <div className="w-20 h-20 md:hidden p-2 flex-shrink-0">
                  <img
                    src={
                      prop.coverImageUrl ||
                      MOCK_IMAGES[idx % MOCK_IMAGES.length]
                    }
                    alt={prop.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="p-4 md:p-5 flex flex-col flex-1 gap-2 md:gap-4 justify-center md:justify-start w-full">
                  <div>
                    <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {prop.name}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                      {prop.wifiSsid ? "Wifi Setup" : "No Wifi"}
                    </p>
                  </div>

                  {/* Desktop Actions */}
                  <div className="mt-auto hidden md:flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center gap-1.5"
                        title="Total Views"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {prop.views || 0}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1.5"
                        title="QR Scans"
                      >
                        <QrCode className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {prop.qrScans || 0}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/properties/${prop.id}/edit`}
                      className="p-2 text-gray-400 hover:text-[#0f756d] hover:bg-[#0f756d]/5 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* Mobile Actions/Stats */}
                  <div className="md:hidden flex items-center justify-between mt-1">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {prop.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <QrCode className="w-3 h-3" /> {prop.qrScans || 0}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/properties/${prop.id}/edit`}
                      className="text-xs font-bold text-[#0f756d]"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 py-12 text-center bg-white dark:bg-[#1a2c2b] rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">
                No properties found. Add your first property!
              </p>
              <Link
                href="/dashboard/properties/new"
                className="mt-4 inline-block bg-[#0f756d] text-white px-4 py-2 rounded-lg text-sm font-bold"
              >
                Create Property
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
