import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownText } from "./markdown";

describe("MarkdownText", () => {
  it("renders bold and italic", () => {
    render(<MarkdownText text="This is **bold** and *italic* text." />);
    expect(screen.getByText("bold")).toHaveProperty("tagName", "STRONG");
    expect(screen.getByText("italic")).toHaveProperty("tagName", "EM");
  });

  it("renders inline code", () => {
    render(<MarkdownText text="Run `npm run dev` to start." />);
    expect(screen.getByText("npm run dev")).toHaveProperty("tagName", "CODE");
  });

  it("renders safe links as anchors", () => {
    render(<MarkdownText text="See [docs](https://example.com/help)." />);
    const link = screen.getByRole("link", { name: "docs" });
    expect(link).toHaveAttribute("href", "https://example.com/help");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("does not linkify unsafe protocols", () => {
    render(<MarkdownText text="Click [x](javascript:alert(1))." />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/javascript:alert/)).toBeInTheDocument();
  });

  it("does not interpret raw HTML", () => {
    render(<MarkdownText text="<script>alert(1)</script>" />);
    expect(document.querySelector("script")).not.toBeInTheDocument();
    expect(screen.getByText(/alert\(1\)/)).toBeInTheDocument();
  });

  it("renders bullet lists", () => {
    render(<MarkdownText text={"- **First** item\n- Second item"} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(screen.getByText("First")).toHaveProperty("tagName", "STRONG");
  });

  it("renders ordered lists and paragraphs", () => {
    render(<MarkdownText text={"1. Step one\n2. Step two\n\nA **closing** note."} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("closing")).toHaveProperty("tagName", "STRONG");
  });

  it("renders nested emphasis", () => {
    render(<MarkdownText text="This is **bold with *italic* inside** done." />);
    expect(screen.getByText("italic")).toHaveProperty("tagName", "EM");
    expect(screen.getByText(/bold with/)).toBeInTheDocument();
  });

  it("pairs the first valid bold markers and leaves the rest literal", () => {
    render(<MarkdownText text="2 ** 2 is **four**" />);
    expect(screen.getByText("2 is")).toHaveProperty("tagName", "STRONG");
    expect(screen.getByText(/four\*\*/)).toBeInTheDocument();
  });
});
