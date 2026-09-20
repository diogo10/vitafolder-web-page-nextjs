import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-2xl font-semibold tracking-tight">Vitafolder — Next.js starter</h1>
        <p className="max-w-md text-sm/6 text-center sm:text-left">
          App Router + TypeScript + Tailwind. Edit{" "}
          <code className="rounded bg-black/[.05] px-1 py-0.5 font-mono font-semibold dark:bg-white/[.06]">
            app/page.tsx
          </code>{" "}
          to get started.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/docs"
            className={cn(
              "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
              "bg-foreground text-background hover:opacity-90"
            )}
          >
            Read docs
          </Link>
          <Link
            href="https://nextjs.org/docs"
            className={cn(
              "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
              "border border-black/[.08] dark:border-white/[.145] hover:bg-black/[.05] dark:hover:bg-white/[.06]"
            )}
          >
            Next.js docs
          </Link>
        </div>
      </main>
      <footer className="row-start-3 text-sm opacity-70">Vitafolder web page</footer>
    </div>
  );
}
