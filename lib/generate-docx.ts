import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from "docx";

// ─── Inline markdown parser ───────────────────────────────────────────────────

function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = [];
  // Match **bold**, *italic*, _italic_, `code`
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.slice(lastIndex, match.index) }));
    }
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], italics: true }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], italics: true }));
    } else if (match[5]) {
      runs.push(new TextRun({ text: match[5], font: "Courier New", size: 18 }));
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.slice(lastIndex) }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
}

// ─── Main converter ───────────────────────────────────────────────────────────

function mdToDocxParagraphs(markdown: string): Paragraph[] {
  const lines = markdown.split("\n");
  const paragraphs: Paragraph[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      // Blank line = spacing paragraph
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 80 } }));
      continue;
    }

    // H1
    if (trimmed.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
      continue;
    }

    // H2
    if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 320, after: 100 },
          border: {
            bottom: { color: "e5e7eb", style: BorderStyle.SINGLE, size: 4 },
          },
        })
      );
      continue;
    }

    // H3
    if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 80 },
        })
      );
      continue;
    }

    // Unordered list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.slice(2);
      paragraphs.push(
        new Paragraph({
          children: parseInline(content),
          bullet: { level: 0 },
          spacing: { after: 40 },
        })
      );
      continue;
    }

    // Nested unordered list (2-space or 4-space indent)
    if (
      (line.startsWith("  - ") || line.startsWith("  * ") || line.startsWith("    - "))
    ) {
      const content = trimmed.slice(2);
      paragraphs.push(
        new Paragraph({
          children: parseInline(content),
          bullet: { level: 1 },
          spacing: { after: 40 },
        })
      );
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (olMatch) {
      paragraphs.push(
        new Paragraph({
          children: parseInline(olMatch[2]),
          numbering: { reference: "default-numbering", level: 0 },
          spacing: { after: 40 },
        })
      );
      continue;
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      paragraphs.push(
        new Paragraph({
          text: "",
          border: {
            bottom: { color: "d1d5db", style: BorderStyle.SINGLE, size: 6 },
          },
          spacing: { before: 160, after: 160 },
        })
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      paragraphs.push(
        new Paragraph({
          children: parseInline(trimmed.slice(2)),
          indent: { left: convertInchesToTwip(0.5) },
          spacing: { after: 80 },
        })
      );
      continue;
    }

    // Normal paragraph
    paragraphs.push(
      new Paragraph({
        children: parseInline(trimmed),
        spacing: { after: 100 },
        alignment: AlignmentType.LEFT,
      })
    );
  }

  return paragraphs;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function markdownToDocxBlob(
  markdown: string,
  title: string
): Promise<Blob> {
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 720, hanging: 260 } } },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
          paragraph: { spacing: { line: 276 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25),
              right: convertInchesToTwip(1.25),
            },
          },
        },
        children: [
          // Document meta header
          new Paragraph({
            children: [
              new TextRun({
                text: title || "Product Requirements Document",
                font: "Calibri",
                size: 36,
                bold: true,
                color: "111827",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated by PM Copilot · ${new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`,
                font: "Calibri",
                size: 18,
                color: "6b7280",
                italics: true,
              }),
            ],
            spacing: { after: 400 },
            border: {
              bottom: { color: "e5e7eb", style: BorderStyle.SINGLE, size: 6 },
            },
          }),
          ...mdToDocxParagraphs(markdown),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
