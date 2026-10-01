import type { Note } from "../schemas";

type CreateNoteRecordInput = {
  circleFamilyId: string;
  title: string;
  content: string;
  author?: string;
};

const notesById = new Map<string, Note>();

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeCircleId(circleFamilyId: string): string {
  return circleFamilyId.trim();
}

/**
 * Data layer for circle-family shared notes.
 *
 * Every note belongs to exactly one `circleFamilyId`. All reads and
 * writes are scoped by that id, so members of one circle-family can
 * share notes while other circles remain isolated.
 */
export function createNoteRecord(input: CreateNoteRecordInput): Note {
  const circleFamilyId = normalizeCircleId(input.circleFamilyId);
  const timestamp = nowIso();
  const note: Note = {
    id: generateId(),
    circleFamilyId,
    title: input.title.trim(),
    content: input.content.trim(),
    ...(input.author?.trim() ? { author: input.author.trim().slice(0, 50) } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  notesById.set(note.id, note);
  return note;
}

/** List all notes visible to a circle-family, newest first. */
export function listNotesByCircle(circleFamilyId: string): Note[] {
  const normalized = normalizeCircleId(circleFamilyId);
  if (!normalized) return [];
  return [...notesById.values()]
    .filter((note) => note.circleFamilyId === normalized)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Find a note only if it belongs to the given circle-family. */
export function getNoteInCircle(noteId: string, circleFamilyId: string): Note | undefined {
  const note = notesById.get(noteId);
  if (!note) return undefined;
  if (note.circleFamilyId !== normalizeCircleId(circleFamilyId)) return undefined;
  return note;
}

/**
 * Delete a note scoped to a circle-family.
 * Returns `{ ok: true }` on success, `{ ok: false, reason }` when the
 * note is missing or belongs to a different circle.
 */
export function deleteNoteRecord(
  noteId: string,
  circleFamilyId: string
): { ok: true } | { ok: false; reason: "not-found" | "wrong-circle" } {
  const note = notesById.get(noteId);
  if (!note) return { ok: false, reason: "not-found" };
  if (note.circleFamilyId !== normalizeCircleId(circleFamilyId)) {
    return { ok: false, reason: "wrong-circle" };
  }
  notesById.delete(noteId);
  return { ok: true };
}

/** Test-only helper to reset the in-memory store. */
export function clearNotesStore(): void {
  notesById.clear();
}
