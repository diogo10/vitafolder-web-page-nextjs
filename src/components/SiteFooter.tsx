import Link from "next/link";

const FOOTER_LINKS = [
  { label: "PRIVACY", href: "/privacy" },
  { label: "TERMS", href: "/terms" },
  { label: "SUPPORT", href: "/support" },
];

export function SiteFooter() {
  return (
    <footer className="mt-[84px] border-t border-[#f0ebe3] bg-white">
      <div className="mx-auto flex min-h-[85px] w-full max-w-[1080px] flex-col items-center justify-between gap-4 px-5 py-7 sm:px-14 lg:flex-row">
        <p className="m-0 text-[9px] text-[#b8a080]">
          &copy; 2026 HouseMira. All household data is encrypted.
        </p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-[34px]">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-[9px] font-bold tracking-[0.12em] text-[#b8a080] no-underline transition-colors hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
