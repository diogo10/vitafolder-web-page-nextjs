import { z } from "zod";

/** Allowed `public.notes.color` values (mirrors the DB CHECK constraint). */
export const noteColorSchema = z.enum(["yellow", "pink", "blue", "green", "orange"]);

export type NoteColor = z.infer<typeof noteColorSchema>;

/**
 * Mirrors `public.notes`. `created_by` is the authenticated user and
 * `family_id` scopes the note to a family circle (enforced by RLS server-side).
 */
export const noteSchema = z.object({
  id: z.string().uuid(),
  family_id: z.string().uuid(),
  created_by: z.string().uuid(),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(300),
  color: noteColorSchema,
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type Note = z.infer<typeof noteSchema>;

export const notesResponseSchema = z.array(noteSchema);
