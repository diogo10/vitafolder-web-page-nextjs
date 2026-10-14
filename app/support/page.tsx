import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { SupportContent } from "@/features/support/components/SupportContent";
import { fetchFaqs } from "@/features/support/lib/fetch-faqs";
import { resolveSupportLocale } from "@/features/support/schemas";

export const metadata: Metadata = {
  title: "HouseMira — Support & FAQ",
  description:
    "Find answers about HouseMira calendars, reminders, and shared lists, or contact support.",
};

export const revalidate = 3600;

type SupportPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const params = (await searchParams) ?? {};
  const locale = resolveSupportLocale(params);
  const faqs = await fetchFaqs({ locale });

  return (
    <div id="top" className="min-h-screen bg-cream font-sans text-ink">
      <Header />
      <main className="mx-auto w-full max-w-[800px] scroll-mt-20 px-5 pb-16 pt-10 sm:px-8 lg:pb-24 lg:pt-14">
        <Link href="/" className="text-sm font-medium text-brand hover:underline">
          ← Back to home
        </Link>
        <SupportContent faqs={faqs} locale={locale} />
      </main>
      <Footer />
    </div>
  );
}
