import {
  LayoutDashboard,
  Building2,
  QrCode,
  BarChart2,
  Settings,
  Home,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import "../globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MobileNav } from "@/components/admin/mobile-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/dashboard/properties", icon: Building2 },
  { label: "QR Flyer Studio", href: "/dashboard/qr-builder", icon: QrCode },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "antialiased bg-[#f6f8f8] dark:bg-[#112120] text-[#0e1b1a] dark:text-neutral-200",
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#1a2c2b] border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen hidden md:flex">
              {/* Logo */}
              <div className="h-20 flex items-center px-6 gap-3 border-b border-gray-100 dark:border-gray-800/50">
                <div className="bg-[#0f756d]/10 rounded-lg p-2">
                  <Home className="w-6 h-6 text-[#0f756d]" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  INFOHOUSE
                </span>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium transition-colors group"
                  >
                    <item.icon className="w-5 h-5 group-hover:text-[#0f756d] transition-colors" />
                    <span className="group-hover:text-[#0f756d] transition-colors">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>

              {/* User Profile */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    {/* Placeholder Avatar */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      SM
                    </div>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      Santiago M.
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Owner Account
                    </p>
                  </div>
                  <MoreVertical className="w-4 h-4 text-gray-400 ml-auto" />
                </div>
                <div className="mt-2 text-center">
                  <ThemeToggle className="w-full justify-center opacity-50 hover:opacity-100" />
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              {/* Mobile Header logic would ideally merge here but keeping simple for now */}
              <div className="md:hidden">
                <MobileNav />
              </div>
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
