import {
  TERMS_CONTACT_EMAIL,
  TERMS_EFFECTIVE_DATE,
  TERMS_SECTIONS,
} from "@/features/terms/lib/content";

function renderParagraphWithEmail(paragraph: string) {
  const parts = paragraph.split(TERMS_CONTACT_EMAIL);
  if (parts.length < 2) return paragraph;
  return (
    <>
      {parts[0]}
      <a
        href={`mailto:${TERMS_CONTACT_EMAIL}`}
        className="text-brand underline-offset-4 hover:underline"
      >
        {TERMS_CONTACT_EMAIL}
      </a>
      {parts.slice(1).join(TERMS_CONTACT_EMAIL)}
    </>
  );
}

export function TermsContent() {
  return (
    <article aria-labelledby="terms-heading" className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
        HouseMira Terms
      </p>
      <h1
        id="terms-heading"
        className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
      >
        Terms and Conditions
      </h1>
      <p className="mt-3 text-sm text-faint">Effective date: {TERMS_EFFECTIVE_DATE}</p>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-mist">
        These terms govern your use of HouseMira calendars, reminders, and shared lists. They work
        alongside our Privacy Policy to explain circle-family sharing, acceptable use, and your
        choices.
      </p>

      <nav
        aria-label="Terms and conditions contents"
        className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-6"
      >
        <h2 className="text-sm font-semibold text-ink">On this page</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {TERMS_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-[13px] text-brand underline-offset-4 hover:underline"
              >
                {section.heading}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 space-y-8">
        {TERMS_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="scroll-mt-24"
          >
            <h2
              id={`${section.id}-heading`}
              className="text-lg font-semibold tracking-tight text-ink"
            >
              {section.heading}
            </h2>
            {section.body.map((paragraph, i) => (
              <p key={`${section.id}-${i}`} className="mt-3 text-sm leading-relaxed text-mist">
                {renderParagraphWithEmail(paragraph)}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {section.bullets.map((bullet, i) => (
                  <li key={`${section.id}-${i}`} className="text-sm leading-relaxed text-mist">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
