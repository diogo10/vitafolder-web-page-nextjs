import { Reveal } from "./Reveal";

type Feature = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Smart Reminders",
    body: "Set once, forget never. Medication, appointments, and school events surface at the right time for the right person.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 9.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13.5 6 9.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 19a2.2 2.2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Shared Calendar",
    body: "One calendar for the whole household. Drag, drop, and see who's where — no more double-booked weekends.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="4"
          y="5.5"
          width="16"
          height="15"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4 10h16M8.5 3.5v4M15.5 3.5v4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8 14.5h3M8 17.5h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Shared Notes",
    body: "Jot it down once, share it with your circle-family. Grocery lists, school pickups, and reminders — private to your circle, visible to everyone in it.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 4.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8.5 9h7M8.5 12.5h7M8.5 16h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Private Family Circles",
    body: "Invite parents, kids, and grandparents into their own secure circle. End-to-end encrypted, always.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.5" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M3.5 19.5c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8M15 14.9c2.3.2 4 1.7 4.5 4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="bg-white">
      <div className="mx-auto w-full max-w-[1080px] scroll-mt-20 px-5 py-16 sm:px-8 lg:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="features-heading"
            className="text-[27px] font-bold leading-snug tracking-tight text-ink sm:text-3xl"
          >
            Everything your family needs, in one place
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Replace scattered notes, group chats, and sticky labels with a single shared home hub.
          </p>
        </Reveal>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <li key={feature.title}>
              <Reveal
                delay={index * 100}
                className="h-full rounded-2xl border border-line bg-white p-6 shadow-[0_2px_16px_rgba(26,26,26,0.04)] transition-shadow hover:shadow-[0_8px_28px_rgba(139,115,85,0.12)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand">
                  {feature.icon}
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-mist">{feature.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
