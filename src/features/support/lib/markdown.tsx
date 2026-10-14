import type { ReactNode } from "react";

function isSafeHref(href: string): boolean {
  const normalized = href.trim().toLowerCase();
  return (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("mailto:")
  );
}

/**
 * Find the closing `**` for bold starting the search at `from`.
 * Single `*` chars inside (e.g. nested italics) are skipped over.
 */
function findBoldClose(text: string, from: number): number {
  return text.indexOf("**", from);
}

/**
 * Find a closing single `*` that is not part of a `**` pair.
 */
function findItalicClose(text: string, from: number): number {
  let index = text.indexOf("*", from);
  while (index !== -1) {
    const prev = text[index - 1];
    const next = text[index + 1];
    if (prev !== "*" && next !== "*") return index;
    index = text.indexOf("*", index + 1);
  }
  return -1;
}

/**
 * Render inline markdown (`code`, **bold**, *italic*, [links](href)).
 * Hand-scanned (no shared regex state) so nested emphasis like
 * **bold with *italic* inside** renders correctly.
 * Raw HTML is never interpreted — everything is built from React nodes,
 * so answer content cannot inject markup. Only http(s)/mailto links
 * become anchors; anything else renders as plain text.
 */
export function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let key = 0;
  let buffer = "";
  let i = 0;

  const flush = () => {
    if (buffer) {
      nodes.push(buffer);
      buffer = "";
    }
  };

  while (i < text.length) {
    // Inline code (no nesting, single line).
    if (text[i] === "`") {
      const close = text.indexOf("`", i + 1);
      const newline = text.indexOf("\n", i + 1);
      if (close !== -1 && close > i + 1 && (newline === -1 || close < newline)) {
        flush();
        nodes.push(
          <code
            key={`${keyPrefix}-${key++}`}
            className="rounded bg-brand-soft px-1 py-0.5 text-[13px] text-ink"
          >
            {text.slice(i + 1, close)}
          </code>
        );
        i = close + 1;
        continue;
      }
      buffer += "`";
      i += 1;
      continue;
    }

    // Bold.
    if (text.startsWith("**", i)) {
      const close = findBoldClose(text, i + 2);
      if (close !== -1 && close > i + 2) {
        flush();
        const nodeKey = `${keyPrefix}-${key++}`;
        nodes.push(
          <strong key={nodeKey} className="font-semibold text-ink">
            {renderInlineMarkdown(text.slice(i + 2, close), nodeKey)}
          </strong>
        );
        i = close + 2;
        continue;
      }
      buffer += "**";
      i += 2;
      continue;
    }

    // Italic.
    if (text[i] === "*") {
      const close = findItalicClose(text, i + 1);
      if (close !== -1 && close > i + 1) {
        flush();
        const nodeKey = `${keyPrefix}-${key++}`;
        nodes.push(
          <em key={nodeKey}>{renderInlineMarkdown(text.slice(i + 1, close), nodeKey)}</em>
        );
        i = close + 1;
        continue;
      }
      buffer += "*";
      i += 1;
      continue;
    }

    // Links [label](href).
    if (text[i] === "[") {
      const labelClose = text.indexOf("](", i + 1);
      const label = labelClose === -1 ? "" : text.slice(i + 1, labelClose);
      const hrefClose = labelClose === -1 ? -1 : text.indexOf(")", labelClose + 2);
      const href = hrefClose === -1 ? "" : text.slice(labelClose + 2, hrefClose);
      const wellFormed =
        labelClose > i + 1 &&
        !label.includes("\n") &&
        hrefClose > labelClose + 2 &&
        href.length > 0 &&
        !/\s/.test(href);
      if (wellFormed) {
        flush();
        if (isSafeHref(href)) {
          const nodeKey = `${keyPrefix}-${key++}`;
          nodes.push(
            <a
              key={nodeKey}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="text-brand underline-offset-4 hover:underline"
            >
              {renderInlineMarkdown(label, nodeKey)}
            </a>
          );
        } else {
          nodes.push(text.slice(i, hrefClose + 1));
        }
        i = hrefClose + 1;
        continue;
      }
      buffer += "[";
      i += 1;
      continue;
    }

    buffer += text[i];
    i += 1;
  }
  flush();
  return nodes;
}

function isBulletLine(line: string): boolean {
  return /^[-*]\s+\S/.test(line.trim());
}

function isOrderedLine(line: string): boolean {
  return /^\d+\.\s+\S/.test(line.trim());
}

/**
 * Render block markdown: paragraphs (single newlines become breaks),
 * `-`/`*` bullet lists, and `1.` ordered lists.
 */
export function MarkdownText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").filter((line) => line.trim().length > 0);
        if (lines.length > 0 && lines.every(isBulletLine)) {
          return (
            <ul
              key={blockIndex}
              className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-mist"
            >
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  {renderInlineMarkdown(
                    line.trim().replace(/^[-*]\s+/, ""),
                    `ul-${blockIndex}-${lineIndex}`
                  )}
                </li>
              ))}
            </ul>
          );
        }
        if (lines.length > 0 && lines.every(isOrderedLine)) {
          return (
            <ol
              key={blockIndex}
              className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-mist"
            >
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  {renderInlineMarkdown(
                    line.trim().replace(/^\d+\.\s+/, ""),
                    `ol-${blockIndex}-${lineIndex}`
                  )}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={blockIndex} className="text-sm leading-relaxed text-mist">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {renderInlineMarkdown(line, `p-${blockIndex}-${lineIndex}`)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
