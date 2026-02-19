import { MobileTopBar } from "@/components/admin/mobile-top-bar";

import { Sidebar } from "@/components/admin/sidebar";
import { AdminScrollArea } from "@/components/admin/admin-scroll-area";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div className="flex h-screen  bg-[#f6f8f8] dark:bg-brand-void/60">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex flex-shrink-0 h-full">
        <Sidebar locale={lang} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header - Visible only on mobile */}
        <div className="lg:hidden sticky top-0 z-50">
          <MobileTopBar />
        </div>

        <AdminScrollArea>{children}</AdminScrollArea>
      </div>
    </div>
  );
}
