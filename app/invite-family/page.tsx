import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { InviteFamilyForm } from "@/features/invite-family/components/InviteFamilyForm";
import { inviteFamilyStrings } from "@/features/invite-family/lib/strings";
import { extractInviteCode } from "@/features/join-family/lib/invite";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "HouseMira — Invite your family",
  description: "Send an email invitation to your private family circle on HouseMira.",
};

type InviteFamilyPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const strings = inviteFamilyStrings.en;

export default async function InviteFamilyPage({ searchParams }: InviteFamilyPageProps) {
  const params = (await searchParams) ?? {};
  const initialInviteCode = extractInviteCode(params);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans text-[#634f39]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1080px] pb-12">
        <div className="grid items-start gap-7 px-5 pt-14 lg:grid-cols-[1.02fr_1fr] lg:gap-[26px_28px] lg:pl-[78px] lg:pr-[34px] lg:pt-[102px]">
          <div className="pt-2 lg:pt-10">
            <p className="text-[10px] font-bold tracking-[0.18em] text-brand">
              {strings.pageEyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#634f39] sm:text-4xl">
              {strings.pageTitle}
            </h1>
            <p className="mt-4 max-w-[380px] text-sm leading-relaxed text-[#8a755b]">
              {strings.pageDescription}
            </p>
          </div>
          <section
            aria-label="Send a family invite"
            className="mt-2 rounded-[28px] bg-[#e4dace] p-[18px] lg:mt-[-26px] lg:rounded-[40px] lg:p-[26px_44px]"
          >
            <div className="rounded-[30px] border border-[#f0ebe3] bg-white px-[30px] pb-12 pt-[31px] text-center shadow-[0_12px_30px_rgba(99,79,57,0.08)]">
              <InviteFamilyForm
                initialInviteCode={initialInviteCode}
                turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              />
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
