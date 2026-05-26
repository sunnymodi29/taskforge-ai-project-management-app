/** Split comment content into text and markdown image/link segments for display. */
export function parseCommentContent(content: string): Array<
  | { type: "text"; value: string }
  | { type: "image"; alt: string; url: string }
  | { type: "link"; label: string; url: string }
> {
  const segments: ReturnType<typeof parseCommentContent> = [];
  const pattern = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined && match[2]) {
      segments.push({ type: "image", alt: match[1], url: match[2] });
    } else if (match[3] && match[4]) {
      segments.push({ type: "link", label: match[3], url: match[4] });
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: "text", value: content });
  }

  return segments;
}

export type PlainTextSegment =
  | { type: "plain"; value: string }
  | { type: "autolink"; url: string; display: string };

const AUTO_LINK_REGEX = /(https?:\/\/[^\s<>\[\]()]+|www\.[^\s<]+)/gi;

const TRAILING_PUNCT = /[.,;:!?)\]}>'"`»」』】）]+$/;

function toHref(url: string): string {
  return url.startsWith("www.") ? `https://${url}` : url;
}

function splitUrlAndTrailing(raw: string): { core: string; trailing: string } {
  let core = raw;
  let trailing = "";
  while (TRAILING_PUNCT.test(core)) {
    const ch = core.slice(-1);
    if (ch === ")" && (core.match(/\(/g)?.length ?? 0) >= (core.match(/\)/g)?.length ?? 0)) {
      break;
    }
    trailing = ch + trailing;
    core = core.slice(0, -1);
  }
  return { core, trailing };
}

/** Detect bare URLs in plain comment text (typed or pasted). */
export function linkifyPlainText(text: string): PlainTextSegment[] {
  const segments: PlainTextSegment[] = [];
  AUTO_LINK_REGEX.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = AUTO_LINK_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "plain", value: text.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    const { core, trailing } = splitUrlAndTrailing(raw);
    if (core) {
      segments.push({ type: "autolink", url: toHref(core), display: core });
    }
    if (trailing) {
      segments.push({ type: "plain", value: trailing });
    }
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "plain", value: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: "plain", value: text });
  }

  return segments;
}
