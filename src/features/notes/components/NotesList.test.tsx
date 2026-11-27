import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Note } from "../schemas";
import { NotesList } from "./NotesList";

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "123e4567-e89b-12d3-a456-426614174000",
    family_id: "223e4567-e89b-12d3-a456-426614174000",
    created_by: "323e4567-e89b-12d3-a456-426614174000",
    title: "Buy milk",
    content: "Two litres, oat if they have it.",
    color: "yellow",
    created_at: "2026-11-27T09:00:00.000Z",
    updated_at: "2026-11-27T10:00:00.000Z",
    ...overrides,
  };
}

describe("NotesList", () => {
  it("renders the note title and content", () => {
    render(<NotesList notes={[makeNote()]} />);

    expect(screen.getByRole("article", { name: "Buy milk" })).toBeInTheDocument();
    expect(screen.getByText("Two litres, oat if they have it.")).toBeInTheDocument();
  });

  it("applies the color assigned to the note", () => {
    render(<NotesList notes={[makeNote({ color: "pink" })]} />);

    expect(screen.getByRole("article", { name: "Buy milk" })).toHaveClass("bg-pink-100");
  });

  it.each(["yellow", "pink", "blue", "green", "orange"] as const)(
    "renders a %s note with its color",
    (color) => {
      render(<NotesList notes={[makeNote({ color })]} />);

      expect(screen.getByRole("article", { name: "Buy milk" })).toHaveAttribute(
        "data-note-color",
        color
      );
    }
  );

  it("renders an empty state when there are no notes", () => {
    render(<NotesList notes={[]} />);

    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
