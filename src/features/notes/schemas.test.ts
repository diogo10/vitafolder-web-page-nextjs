import { describe, expect, it } from "vitest";
import { createNoteSchema, deleteNoteSchema } from "./schemas";

describe("createNoteSchema", () => {
  it("accepts a valid note", () => {
    const result = createNoteSchema.safeParse({
      circleFamilyId: "circle-1",
      title: "Groceries",
      content: "Buy milk and bread.",
      author: "Alex",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createNoteSchema.safeParse({
      circleFamilyId: "circle-1",
      title: "  ",
      content: "Some content",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content over 2000 chars", () => {
    const result = createNoteSchema.safeParse({
      circleFamilyId: "circle-1",
      title: "Ok",
      content: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty circle id", () => {
    const result = createNoteSchema.safeParse({
      circleFamilyId: "  ",
      title: "Ok",
      content: "Content",
    });
    expect(result.success).toBe(false);
  });

  it("treats an empty author as undefined", () => {
    const result = createNoteSchema.safeParse({
      circleFamilyId: "circle-1",
      title: "Ok",
      content: "Content",
      author: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.author).toBeUndefined();
  });
});

describe("deleteNoteSchema", () => {
  it("accepts a valid delete payload", () => {
    const result = deleteNoteSchema.safeParse({
      noteId: "note-1",
      circleFamilyId: "circle-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty note id", () => {
    const result = deleteNoteSchema.safeParse({ noteId: "", circleFamilyId: "circle-1" });
    expect(result.success).toBe(false);
  });
});
