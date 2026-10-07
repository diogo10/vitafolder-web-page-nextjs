import {
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_SECTIONS,
} from "@/features/privacy/lib/content";

function renderParagraphWithEmail(paragraph: string) {
  const parts = paragraph.split(PRIVACY_CONTACT_EMAIL);
  if (parts.length < 2) return paragraph;
  return (
    <>
      {parts[0]}
      <a
        href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
        className="text-brand underline-offset-4 hover:underline"
      >
        {PRIVACY_CONTACT_EMAIL}
      </a>
      {parts.slice(1).join(PRIVACY_CONTACT_EMAIL)}
    </>
  );
}

export function PrivacyContent() {
  return (
    <article aria-labelledby="privacy-heading" className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
        HouseMira Privacy
      </p>
      <h1
        id="privacy-heading"
        className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
      >
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-faint">Effective date: {PRIVACY_EFFECTIVE_DATE}</p>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-mist">
        HouseMira brings your calendar, reminders, and shared lists into one calm, private space.
        This foundational policy explains what we collect, how we use it, and the choices you have.
      </p>

      <nav
        aria-label="Privacy policy contents"
        className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-6"
      >
        <h2 className="text-sm font-semibold text-ink">On this page</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {PRIVACY_SECTIONS.map((section) => (
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
        {PRIVACY_SECTIONS.map((section) => (
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
