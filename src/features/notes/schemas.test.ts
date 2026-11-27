import { describe, expect, it } from "vitest";
import { noteColorSchema, noteSchema } from "./schemas";

const validNote = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  family_id: "223e4567-e89b-12d3-a456-426614174000",
  created_by: "323e4567-e89b-12d3-a456-426614174000",
  title: "Buy milk",
  content: "Two litres, oat if they have it.",
  color: "yellow",
  created_at: "2026-11-27T09:00:00.000Z",
  updated_at: "2026-11-27T10:00:00.000Z",
};

describe("noteColorSchema", () => {
  it.each(["yellow", "pink", "blue", "green", "orange"])("accepts %s", (color) => {
    expect(noteColorSchema.parse(color)).toBe(color);
  });

  it("rejects colors outside the database constraint", () => {
    expect(noteColorSchema.safeParse("purple").success).toBe(false);
  });
});

describe("noteSchema", () => {
  it("accepts a valid notes row", () => {
    expect(noteSchema.parse(validNote)).toEqual(validNote);
  });

  it("rejects an empty title", () => {
    expect(noteSchema.safeParse({ ...validNote, title: "" }).success).toBe(false);
  });

  it("rejects a title longer than 100 characters", () => {
    expect(noteSchema.safeParse({ ...validNote, title: "a".repeat(101) }).success).toBe(false);
  });

  it("rejects content longer than 300 characters", () => {
    expect(noteSchema.safeParse({ ...validNote, content: "a".repeat(301) }).success).toBe(false);
  });

  it("rejects a non-uuid id", () => {
    expect(noteSchema.safeParse({ ...validNote, id: "note-1" }).success).toBe(false);
  });

  it("rejects an invalid color", () => {
    expect(noteSchema.safeParse({ ...validNote, color: "purple" }).success).toBe(false);
  });

  it("rejects a non-ISO updated_at", () => {
    expect(noteSchema.safeParse({ ...validNote, updated_at: "yesterday" }).success).toBe(false);
  });
});
