import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Support", href: "#top" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#e5e7eb] bg-cream">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center justify-between gap-3 px-5 py-6 sm:flex-row sm:px-8">
        <p className="text-[13px] text-faint">© 2026 HouseMira. All rights reserved.</p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-[13px] text-faint transition-colors hover:text-brand"
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
