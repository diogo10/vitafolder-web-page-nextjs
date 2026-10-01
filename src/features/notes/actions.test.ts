import { beforeEach, describe, expect, it, vi } from "vitest";
import { createNoteAction, deleteNoteAction } from "./actions";
import { clearNotesStore } from "./lib/store";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("createNoteAction", () => {
  beforeEach(() => {
    clearNotesStore();
  });

  it("creates a note shared with the circle-family", async () => {
    const result = await createNoteAction({
      circleFamilyId: "circle-1",
      title: "Groceries",
      content: "Buy milk",
      author: "Alex",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.note.circleFamilyId).toBe("circle-1");
      expect(result.note.title).toBe("Groceries");
    }
  });

  it("returns localized errors for an invalid payload", async () => {
    const result = await createNoteAction({
      circleFamilyId: "circle-1",
      title: "",
      content: "",
      locale: "es",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toMatch(/título/i);
      expect(result.errors.content).toMatch(/contenido/i);
    }
  });

  it("requires a circle-family id", async () => {
    const result = await createNoteAction({
      circleFamilyId: "",
      title: "Hi",
      content: "Hello",
      locale: "fr",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.circleFamilyId).toMatch(/cercle/i);
    }
  });
});

describe("deleteNoteAction", () => {
  beforeEach(() => {
    clearNotesStore();
  });

  it("deletes a note from the same circle", async () => {
    const created = await createNoteAction({
      circleFamilyId: "circle-1",
      title: "Temp",
      content: "Remove me",
    });
    if (!created.ok) throw new Error("setup failed");
    const result = await deleteNoteAction({
      noteId: created.note.id,
      circleFamilyId: "circle-1",
    });
    expect(result).toEqual({ ok: true });
  });

  it("rejects cross-circle deletes with a localized message", async () => {
    const created = await createNoteAction({
      circleFamilyId: "circle-1",
      title: "Secret",
      content: "Private",
    });
    if (!created.ok) throw new Error("setup failed");
    const result = await deleteNoteAction({
      noteId: created.note.id,
      circleFamilyId: "circle-2",
      locale: "de",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.note).toMatch(/Circle-Family/i);
    }
  });
});
