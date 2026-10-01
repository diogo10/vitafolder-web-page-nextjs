import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesCard } from "./NotesCard";
import type { Note } from "../schemas";

vi.mock("../actions", () => ({
  createNoteAction: vi.fn(async (input: unknown) => {
    const data = input as { title: string; content: string; circleFamilyId: string };
    return {
      ok: true,
      note: {
        id: "note-new",
        circleFamilyId: data.circleFamilyId,
        title: data.title,
        content: data.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies Note,
    };
  }),
  deleteNoteAction: vi.fn(async () => ({ ok: true })),
}));

describe("NotesCard", () => {
  it("renders the localized card with form fields", () => {
    render(<NotesCard circleFamilyId="circle-1" initialNotes={[]} locale="en" />);
    expect(screen.getByRole("heading", { name: /shared notes/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^note$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share note/i })).toBeInTheDocument();
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
  });

  it("renders Spanish UI when locale is es", () => {
    render(<NotesCard circleFamilyId="circle-1" initialNotes={[]} locale="es" />);
    expect(screen.getByRole("heading", { name: /notas compartidas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compartir nota/i })).toBeInTheDocument();
  });

  it("lists notes shared with the circle", () => {
    const notes: Note[] = [
      {
        id: "n1",
        circleFamilyId: "circle-1",
        title: "Groceries",
        content: "Buy milk",
        author: "Alex",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    render(<NotesCard circleFamilyId="circle-1" initialNotes={notes} />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText(/1 notes/i)).toBeInTheDocument();
  });

  it("creates a note through the form", async () => {
    const user = userEvent.setup();
    render(<NotesCard circleFamilyId="circle-1" initialNotes={[]} />);
    await user.type(screen.getByLabelText(/title/i), "Dinner plan");
    await user.type(screen.getByLabelText(/^note$/i), "Tacos on Friday");
    await user.click(screen.getByRole("button", { name: /share note/i }));
    expect(await screen.findByText("Dinner plan")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/shared with your circle/i);
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<NotesCard circleFamilyId="circle-1" initialNotes={[]} />);
    await user.click(screen.getByRole("button", { name: /share note/i }));
    expect(await screen.findByText(/enter a note title/i)).toBeInTheDocument();
  });
});
