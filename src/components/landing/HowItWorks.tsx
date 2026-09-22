import { PhoneMockup } from "./PhoneMockup";
import { Reveal } from "./Reveal";

const CHECKLIST = [
  "Auto-sync across every device in the house",
  "Kid-friendly view for ages 6 and up",
  "Works offline, syncs when you're back online",
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="bg-cream">
      <div className="mx-auto grid w-full max-w-[1080px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
        <Reveal className="order-2 lg:order-1">
          <PhoneMockup />
        </Reveal>
        <Reveal delay={120} className="order-1 lg:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-3 text-[27px] font-bold leading-snug tracking-tight text-ink sm:text-3xl"
          >
            Three taps to a calmer home
          </h2>
          <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-mist">
            Create a family circle, add your members, and start sharing tasks. FamilyAdmin learns
            your routines and suggests what needs attention next — before you even think to ask.
          </p>
          <ul className="mt-6 space-y-4">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-white"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="m5 12.5 4.5 4.5L19 7.5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[13px] text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
