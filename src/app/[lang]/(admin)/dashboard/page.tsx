import { redirect } from "next/navigation";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // La ruta /es/dashboard redirige a reservas como pantalla principal del panel
  redirect(`/${lang}/dashboard/properties`);
}
