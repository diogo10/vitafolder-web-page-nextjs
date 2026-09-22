"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DemoModal } from "./DemoModal";
import { Reveal } from "./Reveal";

export function Hero() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0">
        <Image
          src="/design/img-0.png"
          alt=""
          width={1080}
          height={618}
          priority
          className="h-auto w-full object-cover"
        />
      </div>
      <div className="relative mx-auto grid w-full max-w-[1080px] items-center gap-10 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-2 lg:gap-6 lg:pb-24 lg:pt-20">
        <Reveal>
          <h1
            id="hero-heading"
            className="text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[60px]"
          >
            Run your home
            <br />
            like a pro.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-mist sm:text-base">
            FamilyAdmin brings your calendar, reminders, and shared lists into one calm, private
            space — so everyone stays in the loop without the chaos.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="#get-started"
              className="inline-flex items-center justify-center rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-deep"
            >
              Start for free
            </Link>
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="inline-flex items-center gap-2 rounded-md px-4 py-3 text-sm text-ink transition-colors hover:bg-brand-soft"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full border border-line bg-white text-ink">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                </svg>
              </span>
              Watch demo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="mt-5 text-xs text-faint">No credit card required · Private &amp; secure</p>
        </Reveal>
        <Reveal delay={120} className="relative mx-auto w-full max-w-[420px]">
          <div className="animate-float-soft">
            <Image
              src="/design/img-37.jpg"
              alt="Family organizing their week together with FamilyAdmin"
              width={462}
              height={462}
              priority
              className="hero-blob aspect-square w-full object-cover shadow-xl"
            />
          </div>
        </Reveal>
      </div>
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
