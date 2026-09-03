import type { ReactNode } from "react";

function safeHref(value: string) {
  return /^(https?:\/\/|mailto:|\/)/i.test(value) ? value : "#";
}

export function renderMarkdownInline(value: string): ReactNode[] {
  const inlinePattern = /(\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|_([^_\n]+)_|\*([^*\n]+)\*)/g;
  const output: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = inlinePattern.exec(value)) !== null) {
    if (match.index > cursor) output.push(value.slice(cursor, match.index));
    const key = `${match.index}-${match[0].length}`;
    if (match[2] !== undefined) {
      const href = safeHref(match[3]);
      output.push(
        <a key={key} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
          {renderMarkdownInline(match[2])}
        </a>,
      );
    } else if (match[4] !== undefined) {
      output.push(<strong key={key}>{renderMarkdownInline(match[4])}</strong>);
    } else if (match[5] !== undefined) {
      output.push(<u key={key}>{renderMarkdownInline(match[5])}</u>);
    } else {
      output.push(<em key={key}>{renderMarkdownInline(match[6] ?? match[7])}</em>);
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < value.length) output.push(value.slice(cursor));
  return output;
}

export function splitMarkdownLead(source: string) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const first = lines.findIndex(line => line.trim().length > 0);
  if (first === -1) return { lead: "", remainder: "" };
  const value = lines[first].trim();
  const isBlock = /^(#{1,3}\s+|[-*+]\s+|\d+[.)]\s+|>\s+|(?:---+|___+|\*\*\*+))/.test(value);
  if (isBlock) return { lead: "", remainder: lines.slice(first).join("\n") };
  return { lead: value, remainder: lines.slice(first + 1).join("\n") };
}

export function plainTextFromMarkdown(source: string) {
  return source
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^\s*(?:[-*+] |\d+[.)] |> )/gm, "")
    .replace(/(?:\*\*|__|[*_])/g, "")
    .replace(/^\s*(?:---+|___+)\s*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function MarkdownContent({ source }: { source: string }) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const content = renderMarkdownInline(heading[2]);
      blocks.push(level === 1 ? <h2 key={index}>{content}</h2> : <h3 key={index}>{content}</h3>);
      index += 1;
      continue;
    }

    if (/^(?:---+|___+|\*\*\*+)$/.test(line)) {
      blocks.push(<hr key={index} />);
      index += 1;
      continue;
    }

    const unordered = line.match(/^[-*+]\s+(.+)$/);
    if (unordered) {
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(/^[-*+]\s+(.+)$/);
        if (!item) break;
        items.push(<li key={index}>{renderMarkdownInline(item[1])}</li>);
        index += 1;
      }
      blocks.push(<ul key={`ul-${index}`}>{items}</ul>);
      continue;
    }

    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (ordered) {
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(/^\d+[.)]\s+(.+)$/);
        if (!item) break;
        items.push(<li key={index}>{renderMarkdownInline(item[1])}</li>);
        index += 1;
      }
      blocks.push(<ol key={`ol-${index}`}>{items}</ol>);
      continue;
    }

    if (line.startsWith("> ")) {
      blocks.push(<blockquote key={index}>{renderMarkdownInline(line.slice(2))}</blockquote>);
      index += 1;
      continue;
    }

    blocks.push(<p key={index}>{renderMarkdownInline(line)}</p>);
    index += 1;
  }

  return <>{blocks}</>;
}
