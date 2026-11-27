import type { SupabaseClient } from "@supabase/supabase-js";
import { notesResponseSchema, type Note } from "../schemas";

export const NOTES_SELECT = "id,family_id,created_by,title,content,color,created_at,updated_at";

/**
 * Load the signed-in user's notes from `public.notes`.
 *
 * The request uses the cookie-bound Supabase client, so `auth.uid()` and the
 * table's RLS policies apply. Filtering by `created_by` keeps the query bound
 * to the caller's own account; the database additionally scopes rows to the
 * caller's family circle.
 *
 * Throws a generic, user-safe error on failure. Provider detail is logged
 * server-side and never rendered.
 */
export async function fetchNotes(supabase: SupabaseClient, userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select(NOTES_SELECT)
    .eq("created_by", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(`[notes] failed to load notes: ${error.message}`);
    throw new Error("Could not load your notes. Try again.");
  }

  const parsed = notesResponseSchema.safeParse(data ?? []);
  if (!parsed.success) {
    console.error("[notes] notes response failed validation.");
    throw new Error("Could not load your notes. Try again.");
  }

  return parsed.data;
}
