import "../globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google"; // Import both
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MobileNav } from "@/components/admin/mobile-nav";
import { Sidebar } from "@/components/admin/sidebar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          jakarta.variable,
          "antialiased bg-[#f6f8f8] dark:bg-[#112120] text-[#0e1b1a] dark:text-neutral-200 font-sans", // use font-sans default
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
            <Sidebar />

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
