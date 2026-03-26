import mammoth from "mammoth";

export type ExtractedFile = {
  name: string;
  content: string; // text for docs, base64 data URI for images
  isImage: boolean;
};

export async function extractFileText(file: File): Promise<ExtractedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (file.type === "application/pdf") {
    // Dynamic import avoids pdf-parse v1's static test-file side-effect
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    return { name: file.name, content: data.text, isImage: false };
  }

  if (
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return { name: file.name, content: result.value, isImage: false };
  }

  if (file.type === "text/plain") {
    return { name: file.name, content: buffer.toString("utf-8"), isImage: false };
  }

  if (file.type.startsWith("image/")) {
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;
    return { name: file.name, content: dataUri, isImage: true };
  }

  return { name: file.name, content: "", isImage: false };
}
