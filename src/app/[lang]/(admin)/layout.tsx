import { MobileTopBar } from "@/components/admin/mobile-top-bar";
import { MobileBottomNav } from "@/components/admin/mobile-bottom-nav";
import { Sidebar } from "@/components/admin/sidebar";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8f8] dark:bg-brand-void/60">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black h-full">
        <Sidebar locale={lang} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header - Visible only on mobile */}
        <div className="lg:hidden sticky top-0 z-50">
          <MobileTopBar />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
