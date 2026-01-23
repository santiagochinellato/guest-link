import { LayoutDashboard, QrCode, Building, Settings } from "lucide-react";
import Link from "next/link";
import "../globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <div className="flex h-screen bg-gray-50 dark:bg-black">
          {/* Sidebar */}
          <aside className="w-64 border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hidden md:flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                INFOHOUSE
              </h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-neutral-800 rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5" />
                Panel Principal
              </Link>
              <Link
                href="/dashboard/properties"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Building className="w-5 h-5" />
                Propiedades
              </Link>
              <Link
                href="/dashboard/qr-builder"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <QrCode className="w-5 h-5" />
                Crear QR
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                Configuración
              </Link>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                  SC
                </div>
                <div>
                  <p className="text-sm font-medium">Santiago Chinellato</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">{children}</div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
