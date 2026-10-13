import type { Metadata } from "next";
import { InviteFamilyForm } from "@/features/invite-family/components/InviteFamilyForm";
import { JoinFooter } from "@/features/join-family/components/JoinFooter";
import { JoinHeader } from "@/features/join-family/components/JoinHeader";
import { extractInviteCode } from "@/features/join-family/lib/invite";

export const metadata: Metadata = {
  title: "HouseMira — Invite your family",
  description: "Send an email invitation to your private family circle on HouseMira.",
};

type InviteFamilyPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InviteFamilyPage({ searchParams }: InviteFamilyPageProps) {
  const params = (await searchParams) ?? {};
  const initialInviteCode = extractInviteCode(params);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans text-[#634f39]">
      <JoinHeader />
      <main className="mx-auto w-full max-w-[1080px] pb-12">
        <div className="grid items-start gap-7 px-5 pt-14 lg:grid-cols-[1.02fr_1fr] lg:gap-[26px_28px] lg:pl-[78px] lg:pr-[34px] lg:pt-[102px]">
          <div className="pt-2 lg:pt-10">
            <p className="text-[10px] font-bold tracking-[0.18em] text-brand">FAMILY INVITES</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#634f39] sm:text-4xl">
              Your family is one invite away
            </h1>
            <p className="mt-4 max-w-[380px] text-sm leading-relaxed text-[#8a755b]">
              Enter who you want to invite and we&rsquo;ll email them your family circle code. They
              can join in seconds from any device.
            </p>
          </div>
          <section
            aria-label="Send a family invite"
            className="mt-2 rounded-[28px] bg-[#e4dace] p-[18px] lg:mt-[-26px] lg:rounded-[40px] lg:p-[26px_44px]"
          >
            <div className="rounded-[30px] border border-[#f0ebe3] bg-white px-[30px] pb-12 pt-[31px] text-center shadow-[0_12px_30px_rgba(99,79,57,0.08)]">
              <InviteFamilyForm initialInviteCode={initialInviteCode} />
            </div>
          </section>
        </div>
      </main>
      <JoinFooter />
    </div>
  );
}
