"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/landing/Logo";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [{ label: "Dashboard", href: "/dashboard" }];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-line bg-white md:min-h-screen md:w-[248px] md:border-b-0 md:border-r">
      <div className="flex h-16 items-center px-5 sm:px-6">
        <Link href="/dashboard" aria-label="HouseMira dashboard">
          <Logo />
        </Link>
      </div>

      <nav aria-label="Dashboard" className="px-3 pb-4 md:flex-1 md:pb-6">
        <ul className="flex gap-1 md:flex-col">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
                    isActive
                      ? "bg-brand-soft text-brand-deep"
                      : "text-mist hover:bg-brand-soft hover:text-brand-deep"
                  )}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect
                      x="2"
                      y="2"
                      width="5"
                      height="5"
                      rx="1.2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <rect
                      x="9"
                      y="2"
                      width="5"
                      height="5"
                      rx="1.2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <rect
                      x="2"
                      y="9"
                      width="5"
                      height="5"
                      rx="1.2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <rect
                      x="9"
                      y="9"
                      width="5"
                      height="5"
                      rx="1.2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                  {item.label}
                </Link>
              </li>
            );
          })}

          <li>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-mist transition-colors hover:bg-brand-soft hover:text-brand-deep"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v7A1.5 1.5 0 0 0 3.5 13H6M10.5 5.5 13 8l-2.5 2.5M6.5 8H13"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Logout
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
