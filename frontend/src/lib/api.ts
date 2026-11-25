import {
  DocumentDetail,
  ChatMessage,
  Citation,
  SummaryData,
  ExtractionResult,
  CompareResult,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getHeaders(apiKey?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const key = apiKey || (typeof window !== "undefined" ? localStorage.getItem("documind_api_key") : null);
  if (key) {
    headers["X-Gemini-API-Key"] = key;
  }
  return headers;
}

export async function uploadDocument(file: File): Promise<DocumentDetail> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }

  return res.json();
}

export async function listDocuments(): Promise<DocumentDetail[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function getDocument(docId: string): Promise<DocumentDetail> {
  const res = await fetch(`${API_BASE}/documents/${docId}`);
  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}

export async function chatWithDocument(
  docId: string,
  question: string,
  history: Array<{ role: string; content: string }>,
  pageContext?: number,
  apiKey?: string
): Promise<{ answer: string; citations: Citation[]; doc_id: string }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      doc_id: docId,
      question,
      history,
      page_context: pageContext,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Chat request failed" }));
    throw new Error(err.detail || "Chat request failed");
  }

  return res.json();
}

export async function summarizeDocument(
  docId: string,
  apiKey?: string
): Promise<SummaryData> {
  const res = await fetch(`${API_BASE}/summarize/${docId}`, {
    method: "POST",
    headers: getHeaders(apiKey),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Summarization failed" }));
    throw new Error(err.detail || "Summarization failed");
  }

  return res.json();
}

export async function extractStructuredData(
  docId: string,
  schemaType: string = "auto",
  customInstructions?: string,
  apiKey?: string
): Promise<ExtractionResult> {
  const res = await fetch(`${API_BASE}/extract`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      doc_id: docId,
      schema_type: schemaType,
      custom_instructions: customInstructions,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Extraction failed" }));
    throw new Error(err.detail || "Extraction failed");
  }

  return res.json();
}

export async function compareDocuments(
  baseDocId: string,
  comparisonDocId: string,
  apiKey?: string
): Promise<CompareResult> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      base_doc_id: baseDocId,
      comparison_doc_id: comparisonDocId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Comparison failed" }));
    throw new Error(err.detail || "Comparison failed");
  }

  return res.json();
}

export async function searchDocument(
  docId: string,
  query: string,
  page?: number
) {
  const params = new URLSearchParams({ q: query });
  if (page) params.append("page", page.toString());
  const res = await fetch(`${API_BASE}/documents/${docId}/search?${params.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}
