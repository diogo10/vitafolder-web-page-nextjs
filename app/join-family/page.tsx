import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { JoinIntro } from "@/features/join-family/components/JoinIntro";
import { JoinPanel } from "@/features/join-family/components/JoinPanel";
import { extractEmail, extractInviteCode } from "@/features/join-family/lib/invite";

export const metadata: Metadata = {
  title: "HouseMira — Join your family circle",
  description:
    "Join your private family circle on HouseMira and bring calm back to your household management.",
};

type JoinFamilyPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JoinFamilyPage({ searchParams }: JoinFamilyPageProps) {
  const params = (await searchParams) ?? {};
  const initialCode = extractInviteCode(params);
  const initialEmail = extractEmail(params);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans text-[#634f39]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1080px] pb-12">
        <div className="grid items-start gap-7 px-5 pt-14 lg:grid-cols-[1.02fr_1fr] lg:gap-[26px_28px] lg:pl-[78px] lg:pr-[34px] lg:pt-[102px]">
          <JoinIntro />
          <JoinPanel initialEmail={initialEmail} initialCode={initialCode} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
