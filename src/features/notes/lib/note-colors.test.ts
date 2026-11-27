import { describe, expect, it } from "vitest";
import { getNoteColorClasses } from "./note-colors";

describe("getNoteColorClasses", () => {
  it.each(["yellow", "pink", "blue", "green", "orange"] as const)(
    "maps %s to its background and border",
    (color) => {
      const classes = getNoteColorClasses(color);
      expect(classes).toContain(`bg-${color}-100`);
      expect(classes).toContain(`border-${color}-300`);
    }
  );
});
