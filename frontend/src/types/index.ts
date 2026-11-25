export interface PageInfo {
  page_number: number;
  char_count: number;
  word_count: number;
  image_filename: string;
  image_url: string;
  width: number;
  height: number;
}

export interface DocumentDetail {
  doc_id: string;
  filename: string;
  file_size: number;
  total_pages: number;
  title: string;
  author: string;
  subject: string;
  creation_date: string;
  pages: PageInfo[];
  total_words: number;
  is_scanned: boolean;
}

export interface Citation {
  page_number: number;
  quote: string;
  explanation?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export interface SummaryData {
  doc_id: string;
  executive_summary: string;
  key_points: string[];
  action_items: string[];
  risks_and_obligations: string[];
  stakeholders_entities: string[];
}

export interface ExtractionResult {
  schema_type: string;
  data: Record<string, any>;
  doc_id: string;
}

export interface CompareResult {
  base_title: string;
  comparison_title: string;
  semantic_similarity: string;
  added_clauses: string[];
  removed_clauses: string[];
  modified_clauses: Array<{ [key: string]: string }>;
  risk_evaluation: string;
}
