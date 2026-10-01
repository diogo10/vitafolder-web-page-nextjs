import type { Metadata } from "next";
import Link from "next/link";
import { NotesCard } from "@/features/notes/components/NotesCard";
import { getNoteLocale, getNotesDictionary } from "@/features/notes/lib/dictionaries";
import { listNotesByCircle } from "@/features/notes/lib/store";

export const metadata: Metadata = {
  title: "HouseMira — Shared Notes for your circle-family",
  description:
    "Create and share notes with everyone in your circle-family. Private, fast, and translated.",
};

type NotesPageProps = {
  searchParams?: Promise<{ circle?: string; locale?: string }>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = (await searchParams) ?? {};
  const circleFamilyId =
    typeof params.circle === "string" && params.circle.trim()
      ? params.circle.trim().slice(0, 64)
      : "demo-circle";
  const locale = getNoteLocale(params.locale);
  const dictionary = getNotesDictionary(locale);
  const notes = listNotesByCircle(circleFamilyId);

  return (
    <div className="min-h-screen bg-cream font-sans text-ink">
      <main className="mx-auto w-full max-w-[720px] px-5 py-14 sm:px-8">
        <Link href="/" className="text-sm font-medium text-brand hover:underline">
          ← HouseMira
        </Link>
        <div className="mt-4">
          <NotesCard circleFamilyId={circleFamilyId} initialNotes={notes} locale={locale} />
        </div>
        <p className="mt-4 text-center text-xs text-faint">
          {dictionary.sharedBadge} · {locale}
        </p>
      </main>
    </div>
  );
}
