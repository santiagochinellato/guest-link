import "@/app/globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider"; // Asegura que la ruta sea correcta
import { Toaster } from "sonner";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* Attribute="class" es CRÍTICO para que Tailwind funcione con .dark */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <div className="flex h-screen bg-gray-50 text-[#0e1b1a]">
            {/* ... resto de tu layout (sidebar, main) ... */}
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
