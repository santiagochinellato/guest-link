import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/config";
import { GuestView } from "@/components/guest/guest-view";
import { getPropertyBySlug } from "@/lib/actions/properties";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    lang: Locale;
    slug: string;
  }>;
}

export default async function GuestPropertyPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);

  const result = await getPropertyBySlug(slug);

  if (!result.success || !result.data) {
    return notFound();
  }

  return <GuestView property={result.data} dict={dict} />;
}
