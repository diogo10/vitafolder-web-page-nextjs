import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { TermsContent } from "@/features/terms/components/TermsContent";

export const metadata: Metadata = {
  title: "HouseMira — Terms and Conditions",
  description:
    "Read the HouseMira Terms and Conditions governing calendars, reminders, shared lists, and shared circle-family notes.",
};

export default function TermsPage() {
  return (
    <div id="top" className="min-h-screen bg-cream font-sans text-ink">
      <Header />
      <main className="mx-auto w-full max-w-[800px] scroll-mt-20 px-5 pb-16 pt-10 sm:px-8 lg:pb-24 lg:pt-14">
        <Link href="/" className="text-sm font-medium text-brand hover:underline">
          ← Back to home
        </Link>
        <TermsContent />
      </main>
      <Footer />
    </div>
  );
}
