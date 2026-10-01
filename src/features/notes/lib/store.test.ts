import { beforeEach, describe, expect, it } from "vitest";
import {
  clearNotesStore,
  createNoteRecord,
  deleteNoteRecord,
  getNoteInCircle,
  listNotesByCircle,
} from "./store";

describe("notes store (circle-family scoping)", () => {
  beforeEach(() => {
    clearNotesStore();
  });

  it("shares notes within the same circle-family", () => {
    createNoteRecord({ circleFamilyId: "circle-a", title: "One", content: "First" });
    createNoteRecord({ circleFamilyId: "circle-a", title: "Two", content: "Second" });
    const notes = listNotesByCircle("circle-a");
    expect(notes).toHaveLength(2);
    expect(notes.map((note) => note.circleFamilyId)).toEqual(["circle-a", "circle-a"]);
  });

  it("isolates notes between different circles", () => {
    createNoteRecord({ circleFamilyId: "circle-a", title: "A", content: "For A" });
    createNoteRecord({ circleFamilyId: "circle-b", title: "B", content: "For B" });
    expect(listNotesByCircle("circle-a").map((note) => note.title)).toEqual(["A"]);
    expect(listNotesByCircle("circle-b").map((note) => note.title)).toEqual(["B"]);
  });

  it("returns an empty list for an unknown circle", () => {
    expect(listNotesByCircle("nope")).toEqual([]);
  });

  it("prevents cross-circle reads and deletes", () => {
    const note = createNoteRecord({
      circleFamilyId: "circle-a",
      title: "Secret",
      content: "Private",
    });
    expect(getNoteInCircle(note.id, "circle-b")).toBeUndefined();
    expect(deleteNoteRecord(note.id, "circle-b")).toEqual({
      ok: false,
      reason: "wrong-circle",
    });
    expect(listNotesByCircle("circle-a")).toHaveLength(1);
  });

  it("deletes a note in the correct circle", () => {
    const note = createNoteRecord({
      circleFamilyId: "circle-a",
      title: "Temp",
      content: "Remove me",
    });
    expect(deleteNoteRecord(note.id, "circle-a")).toEqual({ ok: true });
    expect(listNotesByCircle("circle-a")).toEqual([]);
  });

  it("reports not-found for unknown ids", () => {
    expect(deleteNoteRecord("missing", "circle-a")).toEqual({ ok: false, reason: "not-found" });
  });
});
