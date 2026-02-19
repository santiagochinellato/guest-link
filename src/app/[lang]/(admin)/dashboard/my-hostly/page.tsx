import { notFound } from "next/navigation";
import { getProperties, getProperty } from "@/lib/actions/properties";
import { getPropertyAnalytics } from "@/lib/actions/analytics";
import { getPropertyGuestUsage } from "@/lib/analytics/posthog";
import { HostlyPropertyCard, type HostlySectionStatus } from "@/components/admin/HostlyPropertyCard";

export default async function MyHostlyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const listResult = await getProperties();
  if (!listResult.success) {
    return notFound();
  }
  const baseProperties = listResult.data as {
    id: number;
    name: string;
    slug: string;
    address: string | null;
    status: string | null;
    coverImageUrl?: string | null;
  }[];

  if (baseProperties.length === 0) {
    return (
      <div className="px-6 md:px-8 py-6 pb-20 max-w-4xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
            My Hostly
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
            Aún no tienes propiedades creadas. Crea una propiedad para empezar a
            configurar tu guía de huésped.
          </p>
        </header>
      </div>
    );
  }

  const cards = await Promise.all(
    baseProperties.map(async (bp): Promise<{
      base: (typeof baseProperties)[number];
      full: Awaited<ReturnType<typeof getProperty>>["data"];
      analytics: Awaited<ReturnType<typeof getPropertyAnalytics>>;
      usage: Awaited<ReturnType<typeof getPropertyGuestUsage>>;
      sections: HostlySectionStatus[];
    } | null> => {
      const full = await getProperty(bp.id);
      if (!full.success || !full.data) return null;
      const [analytics, usage] = await Promise.all([
        getPropertyAnalytics(bp.id),
        getPropertyGuestUsage(bp.id),
      ]);
      const p = full.data;

      const sections: HostlySectionStatus[] = [
        {
          key: "basic",
          label: "Información básica",
          complete: !!p.name && !!p.slug && !!p.coverImageUrl,
          href: `/${lang}/dashboard/properties/${bp.id}/edit?tab=basic`,
        },
        {
          key: "location",
          label: "Ubicación",
          complete: !!p.address && !!p.city && !!p.country,
          href: `/${lang}/dashboard/properties/${bp.id}/edit?tab=location`,
        },
        {
          key: "wifi",
          label: "WiFi",
          complete: !!p.wifiSsid && !!p.wifiPassword,
          href: `/${lang}/dashboard/properties/${bp.id}/edit?tab=wifi`,
        },
        {
          key: "recommendations",
          label: "Recomendaciones",
          complete: (p.recommendations?.length ?? 0) > 0,
          href: `/${lang}/dashboard/properties/${bp.id}/edit?tab=recommendations`,
        },
        {
          key: "transport",
          label: "Transporte",
          complete: (p.transport?.length ?? 0) > 0,
          href: `/${lang}/dashboard/properties/${bp.id}/edit?tab=transport`,
        },
        {
          key: "emergency",
          label: "Emergencias",
          complete: (p.emergencyContacts?.length ?? 0) > 0,
          href: `/${lang}/dashboard/properties/${bp.id}/edit?tab=emergency`,
        },
        {
          key: "rules",
          label: "Reglas de la casa",
          complete: !!p.houseRules && p.houseRules.trim().length > 0,
          href: `/${lang}/dashboard/properties/${bp.id}/edit?tab=rules`,
        },
        {
          key: "access",
          label: "Acceso y parking",
          complete:
            (!!p.accessInstructions && p.accessInstructions.trim().length > 0) ||
            (p.accessSteps?.length ?? 0) > 0,
          href: `/${lang}/dashboard/properties/${bp.id}/edit?tab=access`,
        },
      ];

      return {
        base: bp,
        full: p,
        analytics,
        usage,
        sections,
      };
    })
  );

  const validCards = cards.filter(
    (c): c is NonNullable<(typeof cards)[number]> => c !== null
  );

  return (
    <div className="px-6 md:px-8 py-6 pb-20 max-w-6xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
          My Hostly
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
          Vista general de tus propiedades. Revisa qué secciones están completas,
          cómo usan la guía tus huéspedes y accede rápido al editor.
        </p>
      </header>

      <div className="space-y-6">
        {validCards.map((card) => (
          <HostlyPropertyCard
            key={card.base.id}
            propertyId={card.base.id}
            name={card.base.name}
            address={card.base.address}
            city={card.full.city}
            country={card.full.country}
            coverImageUrl={card.base.coverImageUrl}
            status={card.full.status}
            lang={lang}
            sections={card.sections}
            totalViews={card.analytics.totalViews}
            usage={card.usage}
          />
        ))}
      </div>
    </div>
  );
}

