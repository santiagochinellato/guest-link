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

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-red-50 text-red-900 font-mono">
        <h1 className="text-3xl font-bold mb-4">Error Loading Property</h1>
        <div className="bg-white p-6 rounded-lg shadow-md border border-red-200 max-w-2xl w-full text-wrap break-words">
          <p className="font-semibold mb-2">System Error:</p>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result.error, null, 2)}
          </pre>
        </div>
        <p className="mt-8 text-sm text-red-700">
          This is a debug screen. If you see this in production, check your
          database migrations.
        </p>
      </div>
    );
  }

  if (!result.data) {
    return notFound();
  }

  return <GuestView property={result.data} dict={dict} />;
}
