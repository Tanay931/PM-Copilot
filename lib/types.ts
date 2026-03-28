// ─── DB types (snake_case, matching Supabase schema) ──────────────────────────

export type TechSavviness = 'low' | 'medium' | 'high';

export interface DBPersona {
  id: string;
  product_id: string;
  name: string;
  role_description: string;
  tech_savviness: TechSavviness;
  behaviours: string | null;
  design_implications: string | null;
  relevant_features: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBKnowledgeBaseItem {
  id: string;
  product_id: string;
  source_type: 'upload' | 'url' | 'jira_ticket' | 'gong_transcript' | 'sigma_report';
  filename: string | null;
  url: string | null;
  extracted_text: string | null;
  file_size_bytes: number | null;
  created_at: string;
}

export interface DBProduct {
  id: string;
  user_id: string;
  name: string;
  short_description: string;
  context: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBProductWithRelations extends DBProduct {
  personas: DBPersona[];
  knowledge_base_items: DBKnowledgeBaseItem[];
}

// List item shape returned by GET /api/products (includes counts, no relations)
export interface ProductListItem {
  id: string;
  name: string;
  short_description: string;
  context: string | null;
  persona_count: number;
  kb_item_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Legacy types (still used by PRDForm until Phase 4) ───────────────────────

export interface Persona {
  id: string;
  name: string;
  roleDescription: string;
  techSavviness: string;
  behaviorsAndNeeds: string;
  designImplications: string;
  relevantFeatures: string;
}

export interface KnowledgeBaseItem {
  id: string;
  type: 'document' | 'url';
  name: string;
  url?: string;
  fileType?: string;
  fileSize?: number;
  addedAt: string;
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
