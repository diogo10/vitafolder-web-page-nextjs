import { env } from "@/lib/env";
import { groupFaqsByCategory } from "../lib/group-faqs";
import type { Faq, FaqLocale } from "../schemas";
import { FaqAccordion } from "./FaqAccordion";

type SupportContentProps = {
  faqs: Faq[];
  locale: FaqLocale;
};

export function SupportContent({ faqs, locale }: SupportContentProps) {
  const groups = groupFaqsByCategory(faqs);
  const contactEmail = env.NEXT_PUBLIC_PRIVACY_EMAIL;

  return (
    <article aria-labelledby="support-heading" className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
        HouseMira Support
      </p>
      <h1
        id="support-heading"
        className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
      >
        Support &amp; FAQ
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-mist">
        Answers about calendars, reminders, and shared lists — pulled live from our help center.
        {locale === "pt" ? " Mostrando conteúdo em português." : ""}
      </p>

      {groups.length === 0 ? (
        <div role="status" className="mt-8 rounded-2xl border border-line bg-white p-6 text-center">
          <p className="text-sm font-semibold text-ink">No FAQs available right now.</p>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            Contact us at{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="text-brand underline-offset-4 hover:underline"
            >
              {contactEmail}
            </a>{" "}
            and we&apos;ll help you out.
          </p>
        </div>
      ) : (
        <>
          <nav
            aria-label="FAQ categories"
            className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-6"
          >
            <h2 className="text-sm font-semibold text-ink">On this page</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {groups.map((group) => (
                <li key={group.slug}>
                  <a
                    href={`#faq-${group.slug}`}
                    className="text-[13px] text-brand underline-offset-4 hover:underline"
                  >
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <FaqAccordion groups={groups} />

          <aside className="mt-10 rounded-2xl border border-line bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-ink">Still need help?</h2>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              Contact us at{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-brand underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>{" "}
              and we&apos;ll get back to you.
            </p>
          </aside>
        </>
      )}
    </article>
  );
}
