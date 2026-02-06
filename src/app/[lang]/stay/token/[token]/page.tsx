import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/config";
import { GuestView } from "@/components/guest/guest-view";
import { validateGuestToken } from "@/lib/actions/guest-tokens";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    lang: Locale;
    token: string;
  }>;
}

export default async function GuestTokenPage({ params }: PageProps) {
  const { lang, token } = await params;
  const dict = await getDictionary(lang);

  const result = await validateGuestToken(token);

  if (!result.success || !result.property) {
    return notFound();
  }

  return <GuestView property={result.property} dict={dict} />;
}
