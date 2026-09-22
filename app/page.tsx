import type { Metadata } from "next";
import { CtaSection } from "@/components/landing/CtaSection";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";

export const metadata: Metadata = {
  title: "FamilyAdmin — Run your home like a pro",
  description:
    "FamilyAdmin brings your calendar, reminders, and shared lists into one calm, private space — so everyone stays in the loop without the chaos.",
};

export default function Home() {
  return (
    <div id="top" className="min-h-screen bg-cream font-sans text-ink">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
