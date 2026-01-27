export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-gray-50 text-[#0e1b1a]">
      {/* ... resto de tu layout (sidebar, main) ... */}
      {children}
    </div>
  );
}
