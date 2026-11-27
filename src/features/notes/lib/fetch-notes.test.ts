import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchNotes, NOTES_SELECT } from "./fetch-notes";

const note = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  family_id: "223e4567-e89b-12d3-a456-426614174000",
  created_by: "323e4567-e89b-12d3-a456-426614174000",
  title: "Buy milk",
  content: "Two litres, oat if they have it.",
  color: "yellow",
  created_at: "2026-11-27T09:00:00.000Z",
  updated_at: "2026-11-27T10:00:00.000Z",
};

function createQueryMock(result: { data: unknown; error: unknown }) {
  const order = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ order });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { from, select, eq, order };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchNotes", () => {
  it("queries public.notes for the signed-in user, newest first", async () => {
    const query = createQueryMock({ data: [note], error: null });
    const supabase = { from: query.from } as unknown as SupabaseClient;

    const notes = await fetchNotes(supabase, note.created_by);

    expect(notes).toEqual([note]);
    expect(query.from).toHaveBeenCalledWith("notes");
    expect(query.select).toHaveBeenCalledWith(NOTES_SELECT);
    expect(query.eq).toHaveBeenCalledWith("created_by", note.created_by);
    expect(query.order).toHaveBeenCalledWith("updated_at", { ascending: false });
  });

  it("returns an empty list when Supabase returns no rows", async () => {
    const query = createQueryMock({ data: null, error: null });
    const supabase = { from: query.from } as unknown as SupabaseClient;

    await expect(fetchNotes(supabase, note.created_by)).resolves.toEqual([]);
  });

  it("throws a generic error and logs provider detail on failure", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const query = createQueryMock({ data: null, error: { message: "db exploded" } });
    const supabase = { from: query.from } as unknown as SupabaseClient;

    await expect(fetchNotes(supabase, note.created_by)).rejects.toThrow(
      "Could not load your notes. Try again."
    );
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0]?.[0])).toContain("db exploded");
  });

  it("throws when rows fail schema validation", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const query = createQueryMock({ data: [{ ...note, color: "purple" }], error: null });
    const supabase = { from: query.from } as unknown as SupabaseClient;

    await expect(fetchNotes(supabase, note.created_by)).rejects.toThrow(
      "Could not load your notes. Try again."
    );
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
