import { PRIVACY_EFFECTIVE_DATE, PRIVACY_SECTIONS } from "@/features/privacy/lib/content";

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
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="mt-3 text-sm leading-relaxed text-mist">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {section.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 32)} className="text-sm leading-relaxed text-mist">
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
