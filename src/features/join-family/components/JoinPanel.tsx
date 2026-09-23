import { Suspense } from "react";
import { JoinFamilyForm } from "./JoinFamilyForm";

type JoinPanelProps = {
  initialEmail?: string;
  initialCode?: string;
};

export function JoinPanel({ initialEmail = "", initialCode = "" }: JoinPanelProps) {
  return (
    <section
      aria-label="Invitation"
      className="mt-2 rounded-[28px] bg-[#e4dace] p-[18px] lg:mt-[-26px] lg:rounded-[40px] lg:p-[26px_44px]"
    >
      <div className="rounded-[30px] border border-[#f0ebe3] bg-white px-[30px] pb-12 pt-[31px] text-center shadow-[0_12px_30px_rgba(99,79,57,0.08)]">
        <Suspense fallback={<p className="text-sm text-[#b8a080]">Loading…</p>}>
          <JoinFamilyForm initialEmail={initialEmail} initialCode={initialCode} />
        </Suspense>
      </div>
    </section>
  );
}
