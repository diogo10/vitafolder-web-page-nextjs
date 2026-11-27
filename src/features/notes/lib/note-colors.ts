import type { NoteColor } from "../schemas";

/**
 * Static class map so Tailwind can see every color at build time. The DB
 * stores the color name; the UI owns how that name looks.
 */
const NOTE_COLOR_CLASSES: Record<NoteColor, string> = {
  yellow: "bg-yellow-100 border-yellow-300 text-yellow-950",
  pink: "bg-pink-100 border-pink-300 text-pink-950",
  blue: "bg-blue-100 border-blue-300 text-blue-950",
  green: "bg-green-100 border-green-300 text-green-950",
  orange: "bg-orange-100 border-orange-300 text-orange-950",
};

export function getNoteColorClasses(color: NoteColor): string {
  return NOTE_COLOR_CLASSES[color];
}
