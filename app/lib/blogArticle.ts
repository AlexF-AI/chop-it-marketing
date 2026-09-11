// Pulls the Sunday Supplement article furniture out of a post's markdown.
//
// The design gives the blog post a photo hero, a byline row, a raspberry
// "Short answer" plate, a bracketed contents block and a FAQ band. None of
// that is new content — every piece is already in the markdown, written to
// conventions the existing posts all follow:
//
//   # Title                              -> the hero h1 (BLOG_POSTS is the
//                                           source of truth; this is dropped)
//   *By [Name](/url), role. Last …*      -> the byline row
//   **Short answer:** …                  -> the raspberry plate
//   ## Quick answers  + "- **Q?** A"     -> the FAQ band (and FAQPage JSON-LD)
//   ## Heading                           -> the contents list
//
// So the template reads structure that is already there rather than asking
// every post to be rewritten with new frontmatter. A post missing any of
// these simply doesn't render that block.

export type ArticleFaq = { question: string; answer: string };

export type ParsedArticle = {
  /** Body markdown with the furniture removed, ready for ReactMarkdown. */
  body: string;
  /** The `**Short answer:**` paragraph, without its label. */
  shortAnswer: string | null;
  /** `## ` headings in document order, with their anchor slugs. */
  contents: { id: string; text: string }[];
  /** Parsed out of a `## Quick answers` bullet list, if present. */
  faqs: ArticleFaq[];
  /** Whole-post reading time in minutes, at 225 words per minute. */
  readingMinutes: number;
};

const WORDS_PER_MINUTE = 225;

/**
 * Mirrors the id GitHub-flavoured markdown renderers give a heading, which
 * is what the contents links have to point at. Kept deliberately simple:
 * lower-case, strip anything that isn't a word character or a space, then
 * hyphenate.
 */
export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Strips markdown emphasis, links and code so a heading reads as plain text. */
function stripInlineMarkdown(input: string): string {
  return input
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .trim();
}

function countWords(input: string): number {
  const words = input.match(/\b[\w'-]+\b/g);
  return words ? words.length : 0;
}

export function parseArticle(markdown: string): ParsedArticle {
  const readingMinutes = Math.max(1, Math.round(countWords(markdown) / WORDS_PER_MINUTE));

  const lines = markdown.split('\n');
  const kept: string[] = [];
  const contents: { id: string; text: string }[] = [];
  const faqs: ArticleFaq[] = [];
  let shortAnswer: string | null = null;

  // True while walking the bullet list under `## Quick answers`, so those
  // bullets go to the FAQ band instead of staying in the body.
  let inQuickAnswers = false;
  let droppedLeadingRule = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    // The H1 moves to the hero.
    if (/^#\s+/.test(trimmed)) continue;

    // The italic byline moves to the byline row.
    if (/^\*By\s.+\*$/.test(trimmed)) continue;

    // The short answer moves to the raspberry plate.
    if (shortAnswer === null && /^\*\*Short answer:?\*\*/i.test(trimmed)) {
      const text = stripInlineMarkdown(
        trimmed.replace(/^\*\*Short answer:?\*\*\s*/i, ''),
      );
      // In the markdown the sentence continues the bold "Short answer:"
      // label, so it starts lower case. In the plate the label is a
      // separate line above it and the sentence has to stand on its own.
      shortAnswer = text ? text.charAt(0).toUpperCase() + text.slice(1) : null;
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      const text = stripInlineMarkdown(trimmed.replace(/^##\s+/, ''));
      inQuickAnswers = /^quick answers$/i.test(text);
      // The FAQ band renders its own heading, so that one is not a
      // contents entry and its heading line is dropped from the body.
      if (inQuickAnswers) continue;
      contents.push({ id: headingSlug(text), text });
      kept.push(line);
      continue;
    }

    // A deeper heading ends the Quick answers list.
    if (/^#{3,}\s+/.test(trimmed)) inQuickAnswers = false;

    if (inQuickAnswers) {
      const bullet = /^[-*]\s+\*\*(.+?)\*\*\s*(.*)$/.exec(trimmed);
      if (bullet) {
        faqs.push({
          question: stripInlineMarkdown(bullet[1]),
          answer: stripInlineMarkdown(bullet[2]),
        });
        continue;
      }
      // A horizontal rule closes the section.
      if (/^---+$/.test(trimmed)) {
        inQuickAnswers = false;
        continue;
      }
      if (trimmed === '') continue;
      // Anything else means this wasn't the list we thought it was; stop
      // swallowing and let it through.
      inQuickAnswers = false;
    }

    // The rule that used to separate the byline from the body now separates
    // nothing, because both the byline and the short answer have moved out.
    if (!droppedLeadingRule && /^---+$/.test(trimmed) && kept.every((l) => l.trim() === '')) {
      droppedLeadingRule = true;
      continue;
    }

    kept.push(line);
  }

  return {
    body: kept.join('\n').replace(/^\s+/, '').replace(/\n{3,}/g, '\n\n'),
    shortAnswer,
    contents,
    faqs,
    readingMinutes,
  };
}
