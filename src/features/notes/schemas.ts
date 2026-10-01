import { z } from "zod";

export const SUPPORTED_NOTE_LOCALES = ["en", "es", "fr", "de", "pt"] as const;

export type NoteLocale = (typeof SUPPORTED_NOTE_LOCALES)[number];

const localeSchema = z.enum(SUPPORTED_NOTE_LOCALES).optional();

const circleFamilyIdSchema = z
  .string()
  .trim()
  .min(1, "Circle-family is required.")
  .max(64, "Circle-family id is too long.");

const noteTitleSchema = z
  .string()
  .trim()
  .min(1, "Enter a note title.")
  .max(100, "Note title is too long (max 100 characters).");

const noteContentSchema = z
  .string()
  .trim()
  .min(1, "Enter note content.")
  .max(2000, "Note content is too long (max 2000 characters).");

const noteAuthorSchema = z
  .string()
  .trim()
  .max(50, "Author name is too long (max 50 characters).")
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value));

export const createNoteSchema = z.object({
  circleFamilyId: circleFamilyIdSchema,
  title: noteTitleSchema,
  content: noteContentSchema,
  author: noteAuthorSchema,
  locale: localeSchema,
});

export const deleteNoteSchema = z.object({
  noteId: z.string().trim().min(1, "Note id is required.").max(128, "Note id is too long."),
  circleFamilyId: circleFamilyIdSchema,
  locale: localeSchema,
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type DeleteNoteInput = z.infer<typeof deleteNoteSchema>;

export type Note = {
  id: string;
  circleFamilyId: string;
  title: string;
  content: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
};
