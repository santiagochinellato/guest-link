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
      {/* Sidebar */}
      <Sidebar locale={lang} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="md:hidden">
          <MobileTopBar />
          <MobileBottomNav />
        </div>
        {children}
      </main>
    </div>
  );
}
