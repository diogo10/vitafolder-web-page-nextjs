import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Logo } from "@/components/landing/Logo";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "HouseMira — Sign in",
  description: "Sign in to your HouseMira account to keep your family in sync.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-ink">
      <header className="border-b border-line bg-cream">
        <div className="mx-auto flex h-16 w-full max-w-[1080px] items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="HouseMira home">
            <Logo />
          </Link>
          <Link
            href="/join-family"
            className="text-[13px] font-semibold text-mist transition-colors hover:text-brand"
          >
            Join with an invite
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:py-16">
        <section aria-labelledby="login-heading" className="w-full max-w-[440px]">
          <div className="rounded-[28px] border border-line bg-white px-6 py-9 shadow-[0_20px_45px_rgba(26,26,26,0.06)] sm:px-10 sm:py-11">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
              HouseMira account
            </p>
            <h1
              id="login-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-[34px]"
            >
              Welcome back
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-mist">
              Sign in to pick up where your family left off.
            </p>

            <LoginForm />
          </div>

          <p className="mt-6 text-center text-[13px] text-mist">
            New to HouseMira?{" "}
            <Link href="/join-family" className="font-semibold text-brand hover:text-brand-deep">
              Join with an invite
            </Link>
          </p>

          <p className="mt-3 text-center text-[13px] text-mist">
            Don&rsquo;t have an invite?{" "}
            <Link href="/signup" className="font-semibold text-brand hover:text-brand-deep">
              Sign up
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
