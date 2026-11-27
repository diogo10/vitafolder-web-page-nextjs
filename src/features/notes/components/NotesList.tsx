import { cn } from "@/lib/utils";
import { getNoteColorClasses } from "../lib/note-colors";
import type { Note } from "../schemas";

type NotesListProps = {
  notes: Note[];
};

export function NotesList({ notes }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-line bg-white p-8 text-center">
        <p className="text-[14px] font-semibold text-ink">No notes yet</p>
        <p className="mt-1 text-[13px] leading-relaxed text-mist">
          Notes you create for your family circle will show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => {
        const titleId = `note-title-${note.id}`;
        return (
          <li key={note.id}>
            <article
              aria-labelledby={titleId}
              data-note-color={note.color}
              className={cn(
                "flex h-full flex-col rounded-[20px] border p-5 shadow-[0_12px_30px_rgba(26,26,26,0.05)]",
                getNoteColorClasses(note.color)
              )}
            >
              <h3 id={titleId} className="text-[15px] font-bold leading-snug">
                {note.title}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed opacity-90">
                {note.content}
              </p>
              <time
                dateTime={note.updated_at}
                className="mt-4 text-[11px] font-medium uppercase tracking-[0.08em] opacity-60"
              >
                Updated{" "}
                {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                  new Date(note.updated_at)
                )}
              </time>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
