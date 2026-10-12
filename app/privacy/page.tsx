import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { PrivacyContent } from "@/features/privacy/components/PrivacyContent";

export const metadata: Metadata = {
  title: "HouseMira — Privacy Policy",
  description:
    "Read how HouseMira collects, uses, and protects your household data across calendars, reminders, and shared lists.",
};

export default function PrivacyPage() {
  return (
    <div id="top" className="min-h-screen bg-cream font-sans text-ink">
      <Header />
      <main className="mx-auto w-full max-w-[800px] scroll-mt-20 px-5 pb-16 pt-10 sm:px-8 lg:pb-24 lg:pt-14">
        <Link href="/" className="text-sm font-medium text-brand hover:underline">
          ← Back to home
        </Link>
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  );
}
