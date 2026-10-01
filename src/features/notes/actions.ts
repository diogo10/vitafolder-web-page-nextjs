"use server";

import { revalidatePath } from "next/cache";
import type { Note } from "./schemas";
import { createNoteSchema, deleteNoteSchema } from "./schemas";
import { getNoteLocale, getNotesDictionary } from "./lib/dictionaries";
import { createNoteRecord, deleteNoteRecord } from "./lib/store";

export type CreateNoteActionErrors = {
  circleFamilyId?: string;
  title?: string;
  content?: string;
  author?: string;
};

export type CreateNoteActionResult =
  { ok: true; note: Note } | { ok: false; errors: CreateNoteActionErrors };

function mapCreateIssueToLocalizedKey(issueMessage: string): keyof CreateNoteActionErrors | null {
  if (issueMessage.includes("Circle-family")) return "circleFamilyId";
  if (issueMessage.includes("title")) return "title";
  if (issueMessage.includes("content")) return "content";
  if (issueMessage.includes("Author")) return "author";
  return null;
}

function localizedCreateErrors(
  issues: { path: (string | number)[]; message: string }[],
  locale: unknown
): CreateNoteActionErrors {
  const dictionary = getNotesDictionary(locale);
  const errors: CreateNoteActionErrors = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (field === "circleFamilyId" && !errors.circleFamilyId) {
      errors.circleFamilyId = issue.message.includes("too long")
        ? issue.message
        : dictionary.errors.circleRequired;
    } else if (field === "title" && !errors.title) {
      errors.title = issue.message.includes("too long")
        ? dictionary.errors.titleTooLong
        : dictionary.errors.titleRequired;
    } else if (field === "content" && !errors.content) {
      errors.content = issue.message.includes("too long")
        ? dictionary.errors.contentTooLong
        : dictionary.errors.contentRequired;
    } else if (field === "author" && !errors.author) {
      errors.author = dictionary.errors.authorTooLong;
    } else {
      const fallback = mapCreateIssueToLocalizedKey(issue.message);
      if (fallback === "circleFamilyId" && !errors.circleFamilyId) {
        errors.circleFamilyId = dictionary.errors.circleRequired;
      }
    }
  }
  return errors;
}

export async function createNoteAction(input: unknown): Promise<CreateNoteActionResult> {
  const parsed = createNoteSchema.safeParse(input);
  const locale = getNoteLocale(
    typeof input === "object" && input !== null && "locale" in input
      ? (input as { locale?: unknown }).locale
      : undefined
  );

  if (!parsed.success) {
    return { ok: false, errors: localizedCreateErrors(parsed.error.issues, locale) };
  }

  const note = createNoteRecord({
    circleFamilyId: parsed.data.circleFamilyId,
    title: parsed.data.title,
    content: parsed.data.content,
    ...(parsed.data.author ? { author: parsed.data.author } : {}),
  });

  revalidatePath("/notes");
  return { ok: true, note };
}

export type DeleteNoteActionResult =
  { ok: true } | { ok: false; errors: { note?: string; circleFamilyId?: string } };

export async function deleteNoteAction(input: unknown): Promise<DeleteNoteActionResult> {
  const parsed = deleteNoteSchema.safeParse(input);
  const locale = getNoteLocale(
    typeof input === "object" && input !== null && "locale" in input
      ? (input as { locale?: unknown }).locale
      : undefined
  );
  const dictionary = getNotesDictionary(locale);

  if (!parsed.success) {
    const errors: { note?: string; circleFamilyId?: string } = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "circleFamilyId" && !errors.circleFamilyId) {
        errors.circleFamilyId = dictionary.errors.circleRequired;
      } else if (!errors.note) {
        errors.note = issue.message;
      }
    }
    return { ok: false, errors };
  }

  const result = deleteNoteRecord(parsed.data.noteId, parsed.data.circleFamilyId);
  if (!result.ok) {
    return {
      ok: false,
      errors: {
        note:
          result.reason === "wrong-circle"
            ? dictionary.errors.wrongCircle
            : dictionary.errors.noteNotFound,
      },
    };
  }

  revalidatePath("/notes");
  return { ok: true };
}
