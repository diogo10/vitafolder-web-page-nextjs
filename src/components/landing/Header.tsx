"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#get-started" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) closeButtonRef.current?.focus();
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-cream/90 backdrop-blur transition-shadow",
        scrolled && "shadow-[0_1px_12px_rgba(26,26,26,0.08)]"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1080px] items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="HouseMira home">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] font-semibold text-ink transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#get-started"
            className="rounded-md bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-deep"
          >
            Get Started
          </Link>
        </nav>
        <div className="sm:hidden">
          {menuOpen ? (
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close menu"
              aria-expanded="true"
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(false)}
              className="rounded-md p-2 text-ink transition-colors hover:bg-brand-soft"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded="false"
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
              className="rounded-md p-2 text-ink transition-colors hover:bg-brand-soft"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-line bg-cream px-5 py-4 sm:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-soft hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/#get-started"
                onClick={() => setMenuOpen(false)}
                className="mt-1 block rounded-md bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
