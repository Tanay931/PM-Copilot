import Anthropic from "@anthropic-ai/sdk";
import { extractFileText } from "@/lib/extract-text";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior product manager with deep expertise in writing clear, thorough, and actionable PRDs. Your documents are trusted by engineering, design, and stakeholder teams because they anticipate edge cases, define scope precisely, and leave nothing ambiguous.

When given context about a feature or product, generate a complete PRD using **exactly** the following sections in this order. Do not add, rename, or skip sections.

---

# [Feature Name] — PRD

## Context & Problem Statement
Describe the problem being solved, why it matters now, who is affected, and what the cost of inaction is. Reference any data, quotes, or signals from the provided context.

## Proposed Solution
Describe the solution approach at a high level. Explain the core user experience and the key decisions made. Avoid over-specifying implementation details.

## Scope

**In Scope**
- Bullet list of what this work covers

**Out of Scope**
- Bullet list of what is explicitly excluded (and why, where useful)

## User Stories

For each distinct user type or scenario, write a user story in this format:

**Story: [Short title]**
As a [user type], I want to [action] so that [benefit].

**Acceptance Criteria:**
- [ ] Criterion one
- [ ] Criterion two
- [ ] ...

Include at least 3–5 user stories covering the main flows, edge cases, and error scenarios.

## RBAC Considerations
Define which roles exist in the context of this feature, what each role can view, create, edit, or delete, and any elevation or approval requirements. If roles are not applicable, state that explicitly.

## Error States
List every meaningful error state the user or system might encounter. For each:
- **Trigger:** what causes this error
- **User-facing message:** what they see
- **Recovery path:** what they can do next

## Email / Notification Triggers
List every automated email or in-app notification this feature should send. For each:
- **Trigger event**
- **Recipient(s)**
- **Channel** (email, in-app, push, etc.)
- **Content summary**

If none apply, state that explicitly.

## Analytics Events
List every event that should be tracked. For each:
- **Event name** (use snake_case)
- **Trigger**
- **Key properties** (as a bullet list)

## Migration Considerations
If this feature involves changes to existing data, APIs, or user flows, describe: backward compatibility requirements, rollout strategy (feature flags, gradual rollout), data backfill needs, and any sunset plan for deprecated functionality. If not applicable, state so.

## Configurable Elements
List every setting, toggle, threshold, or copy string that should be configurable (by admins, per-tenant, per-user, or at the code level). Include the default value and the range of valid values where relevant.

---

Be specific, practical, and complete. Write as if handing this to an engineering team that has never heard of this feature. Use the context, documents, and settings provided by the user to ground every section in the actual product.

When **Target Personas** are provided, weave their needs, behaviors, and tech savviness throughout the document — especially in User Stories and RBAC Considerations. Name the personas explicitly in relevant sections rather than using generic user labels.

When **Product Context** or **Product Description** is provided, treat it as authoritative background about the product and use it to make the PRD more specific and accurate.`;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const formData = await request.formData();
  const context = formData.get("context") as string;
  const productName = formData.get("productName") as string;
  const featureName = formData.get("featureName") as string;
  const targetRelease = formData.get("targetRelease") as string;
  const files = formData.getAll("files") as File[];

  // Product context fields (set when a product is selected in PRDForm)
  const productContext = formData.get("productContext") as string | null;
  const productDescription = formData.get("productDescription") as string | null;
  const personasRaw = formData.get("personas") as string | null;
  const kbItemsRaw = formData.get("knowledgeBaseItems") as string | null;

  interface PersonaData {
    name: string;
    roleDescription: string;
    techSavviness: string;
    behaviorsAndNeeds: string;
    designImplications: string;
    relevantFeatures: string;
  }
  interface KBItemData { name: string; type: string; url?: string }

  const personas: PersonaData[] = personasRaw ? JSON.parse(personasRaw) : [];
  const kbItems: KBItemData[] = kbItemsRaw ? JSON.parse(kbItemsRaw) : [];

  // ── Extract text from uploaded files ─────────────────────────────────────
  const extracted = await Promise.all(
    files.filter((f) => f.size > 0).map((f) => extractFileText(f))
  );

  const textDocs = extracted.filter((e) => !e.isImage && e.content.trim());
  const imageDocs = extracted.filter((e) => e.isImage);

  // ── Build the user message content ───────────────────────────────────────
  type SupportedMediaType = "image/png" | "image/jpeg" | "image/gif" | "image/webp";
  type ContentBlock =
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "base64"; media_type: SupportedMediaType; data: string } };

  const content: ContentBlock[] = [];

  // Main prompt text
  let promptText = `Please generate a PRD with the following details:\n\n`;
  promptText += `**Product:** ${productName || "Not specified"}\n`;
  promptText += `**Feature / Epic:** ${featureName || "Not specified"}\n`;
  promptText += `**Target Release:** ${targetRelease || "Not specified"}\n\n`;

  // Product-level context from the Products section
  if (productDescription?.trim()) {
    promptText += `## Product Description\n\n${productDescription.trim()}\n\n`;
  }

  if (productContext?.trim()) {
    promptText += `## Product Context\n\n${productContext.trim()}\n\n`;
  }

  // Personas selected for this PRD
  if (personas.length > 0) {
    promptText += `## Target Personas\n\n`;
    for (const p of personas) {
      promptText += `### ${p.name}\n`;
      if (p.roleDescription) promptText += `**Role:** ${p.roleDescription}\n`;
      if (p.techSavviness) promptText += `**Tech Savviness:** ${p.techSavviness}\n`;
      if (p.behaviorsAndNeeds) promptText += `**Behaviors & Needs:** ${p.behaviorsAndNeeds}\n`;
      if (p.designImplications) promptText += `**Design Implications:** ${p.designImplications}\n`;
      if (p.relevantFeatures) promptText += `**Relevant Features:** ${p.relevantFeatures}\n`;
      promptText += `\n`;
    }
  }

  // Knowledge base item references (names/URLs only — no content fetching at this stage)
  if (kbItems.length > 0) {
    promptText += `## Knowledge Base References\n\n`;
    for (const item of kbItems) {
      if (item.type === "url" && item.url) {
        promptText += `- **${item.name}** (URL: ${item.url})\n`;
      } else {
        promptText += `- **${item.name}** (document)\n`;
      }
    }
    promptText += `\n`;
  }

  // User's own context and problem statement
  if (context.trim()) {
    promptText += `## Context & Raw Notes\n\n${context.trim()}\n\n`;
  }

  if (textDocs.length > 0) {
    promptText += `## Uploaded Documents\n\n`;
    for (const doc of textDocs) {
      promptText += `### ${doc.name}\n\n${doc.content.trim()}\n\n---\n\n`;
    }
  }

  content.push({ type: "text", text: promptText });

  // Append images for vision
  for (const img of imageDocs) {
    const [prefix, data] = img.content.split(",");
    const mediaType = prefix.replace("data:", "").replace(";base64", "") as
      | "image/png"
      | "image/jpeg"
      | "image/gif"
      | "image/webp";
    content.push({
      type: "image",
      source: { type: "base64", media_type: mediaType, data },
    });
    content.push({ type: "text", text: `(Image: ${img.name})` });
  }

  // ── Stream response from Claude ───────────────────────────────────────────
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
