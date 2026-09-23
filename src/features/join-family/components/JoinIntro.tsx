import Image from "next/image";

export function JoinIntro() {
  return (
    <section aria-labelledby="join-heading">
      <h1
        id="join-heading"
        className="text-[36px] font-extrabold leading-none tracking-[-0.02em] text-[#634f39] sm:text-[45px]"
      >
        Your family is
        <br />
        waiting for you.
      </h1>
      <p className="mt-[18px] max-w-[430px] text-[15px] leading-[1.6] text-[#b8a080]">
        Join your private family circle on{" "}
        <strong className="font-bold text-[#7a6348]">FamilyAdmin</strong> and bring calm back to
        your household management.
      </p>
      <ul className="mt-[34px] grid max-w-[430px] gap-2">
        <li className="flex items-start gap-[15px] rounded-[18px] border border-[#f0ebe3] bg-white p-4 shadow-[0_1px_2px_rgba(99,79,57,0.04)]">
          <span
            aria-hidden="true"
            className="inline-flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[13px] bg-[#fffbeb]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2.5a4.5 4.5 0 0 0-4.5 4.5v2.7L4 11.6c-.24.35 0 .9.42.9h11.16c.42 0 .66-.55.42-.9l-1.5-1.9V7a4.5 4.5 0 0 0-4.5-4.5ZM8.2 14.6a1.85 1.85 0 0 0 3.6 0H8.2Z"
                fill="#f59e0b"
              />
            </svg>
          </span>
          <div>
            <h2 className="mt-0.5 text-xs font-bold text-[#634f39]">Smart Reminders</h2>
            <p className="mt-1 text-[10.5px] leading-[1.5] text-[#b8a080]">
              Stay synced on meds, chores, and school runs.
            </p>
          </div>
        </li>
        <li className="flex items-start gap-[15px] rounded-[18px] border border-[#f0ebe3] bg-white p-4 shadow-[0_1px_2px_rgba(99,79,57,0.04)]">
          <span
            aria-hidden="true"
            className="inline-flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[13px] bg-[#eff6ff]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="13" rx="2.5" fill="#3b82f6" />
              <rect x="3" y="4" width="14" height="4" rx="2" fill="#93c5fd" />
              <rect x="6" y="2" width="2" height="4" rx="1" fill="#3b82f6" />
              <rect x="12" y="2" width="2" height="4" rx="1" fill="#3b82f6" />
              <rect x="6.5" y="10.5" width="2.4" height="2.4" rx="0.7" fill="#eff6ff" />
              <rect x="9.7" y="10.5" width="2.4" height="2.4" rx="0.7" fill="#eff6ff" />
              <rect x="6.5" y="13.5" width="2.4" height="2.4" rx="0.7" fill="#eff6ff" />
              <rect x="9.7" y="13.5" width="2.4" height="2.4" rx="0.7" fill="#eff6ff" />
            </svg>
          </span>
          <div>
            <h2 className="mt-0.5 text-xs font-bold text-[#634f39]">Shared Calendar</h2>
            <p className="mt-1 text-[10.5px] leading-[1.5] text-[#b8a080]">
              One view for the whole household&rsquo;s schedule.
            </p>
          </div>
        </li>
      </ul>
      <div className="mt-10 flex items-center gap-3">
        <div className="flex items-center" aria-hidden="true">
          <Image
            src="/join-family/avatar-1.jpg"
            alt=""
            width={27}
            height={27}
            className="h-[27px] w-[27px] rounded-full border-[1.5px] border-white bg-[#f0ebe3] object-cover"
          />
          <Image
            src="/join-family/avatar-2.jpg"
            alt=""
            width={27}
            height={27}
            className="-ml-[9px] h-[27px] w-[27px] rounded-full border-[1.5px] border-white bg-[#f0ebe3] object-cover"
          />
          <Image
            src="/join-family/avatar-3.jpg"
            alt=""
            width={27}
            height={27}
            className="-ml-[9px] h-[27px] w-[27px] rounded-full border-[1.5px] border-white bg-[#f0ebe3] object-cover"
          />
          <span className="-ml-[9px] inline-flex h-7 min-w-7 flex-col items-center justify-center rounded-full border-[1.5px] border-white bg-[#faf9f6] px-1 text-center text-[9px] font-bold leading-[1.15] text-[#c9b99a] outline outline-1 outline-[#f0ebe3]">
            <span>+12k</span>
            <span>families</span>
          </span>
        </div>
        <p className="m-0 text-[10.5px] text-[#c9b99a]">Join 12,000+ active circles</p>
      </div>
    </section>
  );
}
