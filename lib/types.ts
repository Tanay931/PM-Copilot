// ─── Products domain ──────────────────────────────────────────────────────────

export type TechSavviness = "Low" | "Medium" | "High";

export interface Persona {
  id: string;
  name: string;
  roleDescription: string;
  techSavviness: TechSavviness;
  behaviorsAndNeeds: string;
  designImplications: string;
  relevantFeatures: string;
}

export interface KnowledgeBaseItem {
  id: string;
  type: "document" | "url";
  name: string;         // filename or user-supplied title
  url?: string;         // for url type
  fileType?: string;    // MIME type for documents
  fileSize?: number;    // bytes for documents
  addedAt: string;      // ISO timestamp
}

export interface Product {
  id: string;
  name: string;
  description: string;
  context: string;
  knowledgeBase: KnowledgeBaseItem[];
  personas: Persona[];
  createdAt: string;
  updatedAt: string;
}
