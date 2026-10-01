"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Note, NoteLocale } from "../schemas";
import { createNoteSchema } from "../schemas";
import { createNoteAction, deleteNoteAction } from "../actions";
import { formatNotesCount, getNotesDictionary } from "../lib/dictionaries";

type NotesCardProps = {
  circleFamilyId: string;
  initialNotes?: Note[];
  locale?: NoteLocale;
  className?: string;
};

export function NotesCard({
  circleFamilyId,
  initialNotes = [],
  locale = "en",
  className,
}: NotesCardProps) {
  const dictionary = useMemo(() => getNotesDictionary(locale), [locale]);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string; author?: string }>({});
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const parsed = createNoteSchema.safeParse({
      circleFamilyId,
      title,
      content,
      author,
      locale,
    });
    if (!parsed.success) {
      const fieldErrors: { title?: string; content?: string; author?: string } = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "title" && !fieldErrors.title) {
          fieldErrors.title = issue.message.includes("too long")
            ? dictionary.errors.titleTooLong
            : dictionary.errors.titleRequired;
        }
        if (field === "content" && !fieldErrors.content) {
          fieldErrors.content = issue.message.includes("too long")
            ? dictionary.errors.contentTooLong
            : dictionary.errors.contentRequired;
        }
        if (field === "author" && !fieldErrors.author) {
          fieldErrors.author = dictionary.errors.authorTooLong;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsPending(true);
    try {
      const result = await createNoteAction({
        circleFamilyId,
        title,
        content,
        author,
        locale,
      });
      if (!result.ok) {
        setErrors({
          title: result.errors.title ?? result.errors.circleFamilyId,
          content: result.errors.content,
          author: result.errors.author,
        });
        return;
      }
      setNotes((current) => [result.note, ...current]);
      setTitle("");
      setContent("");
      setStatus(dictionary.successMessage);
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId);
    try {
      const result = await deleteNoteAction({ noteId, circleFamilyId, locale });
      if (result.ok) {
        setNotes((current) => current.filter((note) => note.id !== noteId));
        setStatus(dictionary.deletedMessage);
      } else {
        setStatus(result.errors.note ?? result.errors.circleFamilyId ?? null);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section
      aria-labelledby="notes-card-heading"
      className={cn(
        "rounded-2xl border border-line bg-white p-6 shadow-[0_2px_16px_rgba(26,26,26,0.04)]",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="notes-card-heading" className="text-[15px] font-semibold text-ink">
            {dictionary.title}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-mist">{dictionary.subtitle}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
          {dictionary.sharedBadge}
        </span>
      </div>

      <p className="mt-3 text-xs text-faint" aria-live="polite">
        {dictionary.circleLabel}: {circleFamilyId} · {formatNotesCount(dictionary, notes.length)}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div>
          <label htmlFor="note-title" className="mb-1 block text-xs font-semibold text-ink">
            {dictionary.noteTitleLabel}
          </label>
          <input
            id="note-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={dictionary.noteTitlePlaceholder}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "note-title-error" : undefined}
            className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none placeholder:text-pale focus:border-brand"
          />
          {errors.title && (
            <p id="note-title-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="note-content" className="mb-1 block text-xs font-semibold text-ink">
            {dictionary.noteContentLabel}
          </label>
          <textarea
            id="note-content"
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={dictionary.noteContentPlaceholder}
            rows={3}
            aria-invalid={Boolean(errors.content)}
            aria-describedby={errors.content ? "note-content-error" : undefined}
            className="w-full resize-y rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none placeholder:text-pale focus:border-brand"
          />
          {errors.content && (
            <p id="note-content-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.content}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="note-author" className="mb-1 block text-xs font-semibold text-ink">
            {dictionary.authorLabel}
          </label>
          <input
            id="note-author"
            name="author"
            type="text"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder={dictionary.authorPlaceholder}
            aria-invalid={Boolean(errors.author)}
            aria-describedby={errors.author ? "note-author-error" : undefined}
            className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none placeholder:text-pale focus:border-brand"
          />
          {errors.author && (
            <p id="note-author-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.author}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-deep disabled:opacity-70"
        >
          {isPending ? dictionary.addingButton : dictionary.addButton}
        </button>
      </form>

      {status && (
        <p role="status" className="mt-3 text-xs font-medium text-ink">
          {status}
        </p>
      )}

      <div className="mt-5 border-t border-line pt-4">
        {notes.length === 0 ? (
          <div className="rounded-lg bg-cream px-4 py-6 text-center">
            <p className="text-sm font-semibold text-ink">{dictionary.emptyTitle}</p>
            <p className="mt-1 text-[13px] text-mist">{dictionary.emptyBody}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-line bg-cream px-4 py-3"
                data-testid={`note-${note.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{note.title}</p>
                  <button
                    type="button"
                    aria-label={`${dictionary.deleteButtonLabel}: ${note.title}`}
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    className="shrink-0 rounded px-2 py-1 text-xs text-mist hover:bg-brand-soft hover:text-brand disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-mist">{note.content}</p>
                {note.author && <p className="mt-2 text-xs text-faint">— {note.author}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
