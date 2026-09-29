import Image from "next/image";

const MEMBERS = [
  { name: "Mom", src: "/design/img-41.jpg" },
  { name: "Dad", src: "/design/img-49.jpg" },
  { name: "Lily", src: "/design/img-50.jpg" },
];

const TASKS = [
  {
    title: "Lily's Meds",
    time: "8:30 AM",
    timeClass: "text-accent-red",
    detail: "Morning dose — Gate B.",
  },
  {
    title: "School Pickup",
    time: "3:15 PM",
    timeClass: "text-brand",
    detail: "Oak Street Elementary.",
  },
];

export function PhoneMockup() {
  return (
    <div
      role="img"
      aria-label="Preview of the HouseMira app showing the Smith family circle and today's tasks"
      className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_16px_48px_rgba(26,26,26,0.10)]"
    >
      <div className="bg-cream px-5 pb-3 pt-3 text-center">
        <p className="text-[10px] font-semibold text-brand">9:41 AM</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink">
          <Image
            src="/design/img-41.jpg"
            alt=""
            width={21}
            height={21}
            className="h-[21px] w-[21px] rounded-full object-cover"
          />
          HouseMira
        </p>
      </div>
      <div className="px-5 py-4">
        <p className="text-[10px] text-pale">Tuesday, June 10</p>
        <p className="mt-1 text-lg font-semibold leading-snug text-ink">
          Good morning,
          <br />
          <span className="text-brand">Smith Family</span>
        </p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs font-semibold text-ink">The Circle</p>
          <p className="text-[10px] font-semibold text-brand">Manage</p>
        </div>
        <ul className="mt-2 flex items-center gap-3">
          {MEMBERS.map((member) => (
            <li key={member.name} className="flex flex-col items-center gap-1">
              <Image
                src={member.src}
                alt=""
                width={33}
                height={33}
                className="h-[33px] w-[33px] rounded-full object-cover"
              />
              <span className="text-[10px] font-semibold text-ink">{member.name}</span>
            </li>
          ))}
          <li className="flex flex-col items-center gap-1">
            <span
              aria-hidden="true"
              className="grid h-[33px] w-[33px] place-items-center rounded-full border border-dashed border-pale text-sm font-medium text-pale"
            >
              +
            </span>
            <span className="text-[10px] text-pale">Add</span>
          </li>
        </ul>
        <p className="mt-4 text-xs font-semibold text-ink">Today</p>
        <ul className="mt-2 space-y-2">
          {TASKS.map((task) => (
            <li key={task.title} className="rounded-xl bg-brand-soft/60 px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-semibold text-ink">{task.title}</p>
                <p className={`text-[10px] font-semibold ${task.timeClass}`}>{task.time}</p>
              </div>
              <p className="mt-0.5 text-[10px] text-faint">{task.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
