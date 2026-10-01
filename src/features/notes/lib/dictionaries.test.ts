import { describe, expect, it } from "vitest";
import {
  formatNotesCount,
  getNoteLocale,
  getNotesDictionary,
  isSupportedNoteLocale,
  notesDictionaries,
} from "./dictionaries";
import { SUPPORTED_NOTE_LOCALES } from "../schemas";

describe("notes dictionaries", () => {
  it("supports en, es, fr, de and pt", () => {
    expect([...SUPPORTED_NOTE_LOCALES].sort()).toEqual(["de", "en", "es", "fr", "pt"]);
    for (const locale of SUPPORTED_NOTE_LOCALES) {
      expect(notesDictionaries[locale]).toBeDefined();
    }
  });

  it("translates every UI string (no empty values)", () => {
    for (const locale of SUPPORTED_NOTE_LOCALES) {
      const dictionary = notesDictionaries[locale];
      expect(dictionary.title.trim().length).toBeGreaterThan(0);
      expect(dictionary.subtitle.trim().length).toBeGreaterThan(0);
      expect(dictionary.noteTitleLabel.trim().length).toBeGreaterThan(0);
      expect(dictionary.noteContentLabel.trim().length).toBeGreaterThan(0);
      expect(dictionary.addButton.trim().length).toBeGreaterThan(0);
      expect(dictionary.emptyTitle.trim().length).toBeGreaterThan(0);
      for (const message of Object.values(dictionary.errors)) {
        expect(message.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("falls back to English for unknown locales", () => {
    expect(getNotesDictionary("xx")).toEqual(notesDictionaries.en);
    expect(getNotesDictionary(undefined)).toEqual(notesDictionaries.en);
    expect(getNoteLocale("es")).toBe("es");
    expect(getNoteLocale("xx")).toBe("en");
    expect(isSupportedNoteLocale("fr")).toBe(true);
    expect(isSupportedNoteLocale("xx")).toBe(false);
  });

  it("formats the notes count", () => {
    expect(formatNotesCount(getNotesDictionary("en"), 3)).toBe("3 notes");
    expect(formatNotesCount(getNotesDictionary("es"), 1)).toBe("1 notas");
  });
});
