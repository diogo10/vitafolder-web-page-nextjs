import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotesList } from "@/features/notes/components/NotesList";
import { fetchNotes } from "@/features/notes/lib/fetch-notes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "HouseMira — Notes",
  description: "Notes shared with your family circle.",
};

// The page is session-gated: it reads request cookies and must never be
// prerendered (see the dashboard page for the full rationale).
export const dynamic = "force-dynamic";

const LOGIN_URL = `/login?next=${encodeURIComponent("/dashboard/notes")}`;

export default async function NotesPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    console.error("[notes] missing SUPABASE_ANON_KEY — notes are not configured.");
    redirect(LOGIN_URL);
  }

  const auth = await supabase.auth.getUser();

  if (auth.error) {
    console.error(`[notes] failed to load the signed-in user: ${auth.error.message}`);
  }

  const user = auth.data.user ?? null;

  if (!user) {
    redirect(LOGIN_URL);
  }

  const notes = await fetchNotes(supabase, user.id);

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Your home</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-[34px]">Notes</h1>
        <p className="text-[13px] font-medium text-mist">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </p>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-mist">
        Little reminders and messages for your family circle.
      </p>

      <section aria-labelledby="notes-list-heading" className="mt-8">
        <h2 id="notes-list-heading" className="sr-only">
          Your notes
        </h2>
        <NotesList notes={notes} />
      </section>
    </div>
  );
}
