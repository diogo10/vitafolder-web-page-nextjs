import Link from "next/link";
import { Reveal } from "./Reveal";

export function CtaSection() {
  return (
    <section id="get-started" aria-labelledby="cta-heading" className="scroll-mt-20 bg-cream">
      <div className="mx-auto w-full max-w-[1080px] px-5 py-16 text-center sm:px-8 lg:py-24">
        <Reveal className="mx-auto max-w-2xl">
          <h2
            id="cta-heading"
            className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[36px]"
          >
            Ready to simplify family life?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-mist">
            Join thousands of families who&rsquo;ve traded the chaos for calm. Free to start, no
            credit card needed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#top"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-deep"
            >
              Get started for free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="#top"
              aria-label="Get it on Google Play"
              className="inline-flex items-center gap-3 rounded-md bg-ink px-6 py-2.5 text-left text-white ring-1 ring-[#1f2937] transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="text-accent-green"
              >
                <path d="M4 3.5v17c0 .6.65.97 1.16.65l4.6-2.85 3.1-1.92-3.1-5.38 3.1-5.38-3.1-1.92-4.6-2.85A.75.75 0 0 0 4 3.5Z" />
                <path d="M12.86 5.62 19.1 9.3c.5.3.5 1 0 1.3l-2.5 1.4 2.5 1.4c.5.3.5 1 0 1.3l-6.24 3.68L9.76 12l3.1-6.38Z" />
              </svg>
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-white">
                  Get it on
                </span>
                <span className="block text-sm font-semibold leading-tight">Google Play</span>
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
