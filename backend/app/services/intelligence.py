import json
import re
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from PIL import Image

from app.core.config import settings
from app.core.gemini import get_gemini_client
from app.schemas.document import (
    Citation,
    ChatResponse,
    SummaryResponse,
    InvoiceSchema,
    ContractSchema,
    ResumeSchema,
    GenericExtractionSchema,
    CompareResponse
)

class IntelligenceService:
    @staticmethod
    def _build_context(doc: Dict[str, Any], page_filter: Optional[int] = None) -> str:
        """
        Formats document pages into an indexed context block.
        """
        pages = doc.get("pages", [])
        if page_filter is not None:
            pages = [p for p in pages if p["page_number"] == page_filter]
        
        parts = []
        for p in pages:
            num = p["page_number"]
            text = p.get("text", "").strip()
            parts.append(f"=== PAGE {num} ===\n{text}\n")
        return "\n".join(parts)

    @staticmethod
    def chat_with_document(
        doc: Dict[str, Any],
        question: str,
        history: Optional[List[Dict[str, str]]] = None,
        page_context: Optional[int] = None,
        api_key: Optional[str] = None
    ) -> ChatResponse:
        client = get_gemini_client(api_key)
        context = IntelligenceService._build_context(doc, page_context)

        system_instruction = (
            "You are DocuMindAI, an advanced document intelligence assistant. "
            "Your job is to answer user queries based STRICTLY and ONLY on the provided document context. "
            "For every factual claim, cite the page number like [Page X]. "
            "If the document does not contain the answer, explicitly state that it cannot be found in the document. "
            "At the end of your response, provide a 'CITATIONS:' block with lines formatted as: "
            "'Page X | \"exact quote from text\" | explanation'."
        )

        prompt_parts = [
            f"DOCUMENT TITLE: {doc.get('title', 'Unknown')}\n"
            f"TOTAL PAGES: {doc.get('total_pages', 0)}\n\n"
            f"DOCUMENT CONTENT:\n{context}\n\n"
        ]

        if history:
            prompt_parts.append("CONVERSATION HISTORY:\n")
            for msg in history[-6:]: # Keep last 3 turns
                role = msg.get("role", "user").capitalize()
                content = msg.get("content", "")
                prompt_parts.append(f"{role}: {content}\n")
            prompt_parts.append("\n")

        prompt_parts.append(f"USER QUESTION: {question}\n")

        response = client.models.generate_content(
            model=settings.DEFAULT_MODEL,
            contents="".join(prompt_parts),
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2
            )
        )

        raw_text = response.text or ""
        citations: List[Citation] = []
        answer = raw_text

        # Extract citations block if present
        if "CITATIONS:" in raw_text:
            parts = raw_text.split("CITATIONS:")
            answer = parts[0].strip()
            citations_block = parts[1].strip()
            for line in citations_block.splitlines():
                line = line.strip()
                if not line:
                    continue
                match = re.search(r"Page\s*(\d+)\s*\|\s*\"?([^\"]+)\"?\s*\|\s*(.*)", line)
                if match:
                    p_num = int(match.group(1))
                    quote = match.group(2).strip()
                    expl = match.group(3).strip()
                    citations.append(Citation(page_number=p_num, quote=quote, explanation=expl))

        # Fallback regex extraction of [Page X] mentions if block was absent
        if not citations:
            found_pages = re.findall(r"\[Page\s*(\d+)\]", answer)
            for p_str in sorted(set(found_pages), key=int):
                citations.append(Citation(page_number=int(p_str), quote="", explanation=f"Referenced on page {p_str}"))

        return ChatResponse(
            answer=answer,
            citations=citations,
            doc_id=doc["doc_id"]
        )

    @staticmethod
    def generate_summary(doc: Dict[str, Any], api_key: Optional[str] = None) -> SummaryResponse:
        client = get_gemini_client(api_key)
        context = IntelligenceService._build_context(doc)

        system_instruction = (
            "You are a C-level executive document analyst. Analyze the provided document "
            "and produce an executive briefing with concise summary, key points, action items, "
            "risks/obligations, and stakeholders/entities."
        )

        user_prompt = f"Analyze and summarize this document:\n\n{context}"

        response = client.models.generate_content(
            model=settings.DEFAULT_MODEL,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_json_schema=SummaryResponse.model_json_schema(),
                temperature=0.2
            )
        )

        parsed = json.loads(response.text)
        parsed["doc_id"] = doc["doc_id"]
        return SummaryResponse(**parsed)

    @staticmethod
    def extract_structured(
        doc: Dict[str, Any],
        schema_type: str = "auto",
        custom_instructions: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        client = get_gemini_client(api_key)
        context = IntelligenceService._build_context(doc)

        # Detect schema if "auto"
        if schema_type == "auto":
            sample_text = (context[:2000]).lower()
            if any(k in sample_text for k in ["invoice", "bill to", "due date", "subtotal", "total amount", "tax"]):
                schema_type = "invoice"
            elif any(k in sample_text for k in ["agreement", "parties", "confidentiality", "governing law", "hereby"]):
                schema_type = "contract"
            elif any(k in sample_text for k in ["experience", "education", "resume", "curriculum vitae", "skills"]):
                schema_type = "resume"
            else:
                schema_type = "generic"

        model_schema_map = {
            "invoice": InvoiceSchema,
            "contract": ContractSchema,
            "resume": ResumeSchema,
            "generic": GenericExtractionSchema
        }

        target_model = model_schema_map.get(schema_type, GenericExtractionSchema)

        system_instruction = (
            f"You are a specialized document extraction engine. "
            f"Extract all relevant data points from the document into the requested schema. "
            f"If a field is missing in the document, use null or empty list. Do not hallucinate."
        )
        if custom_instructions:
            system_instruction += f"\nCustom instructions: {custom_instructions}"

        response = client.models.generate_content(
            model=settings.DEFAULT_MODEL,
            contents=f"Extract data from this document:\n\n{context}",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_json_schema=target_model.model_json_schema(),
                temperature=0.1
            )
        )

        extracted_data = json.loads(response.text)
        return {
            "schema_type": schema_type,
            "data": extracted_data,
            "doc_id": doc["doc_id"]
        }

    @staticmethod
    def compare_documents(
        doc_a: Dict[str, Any],
        doc_b: Dict[str, Any],
        api_key: Optional[str] = None
    ) -> CompareResponse:
        client = get_gemini_client(api_key)
        context_a = IntelligenceService._build_context(doc_a)
        context_b = IntelligenceService._build_context(doc_b)

        prompt = (
            f"--- DOCUMENT A: {doc_a.get('filename')} ---\n{context_a}\n\n"
            f"--- DOCUMENT B: {doc_b.get('filename')} ---\n{context_b}\n\n"
            "Compare Document A and Document B. Identify:\n"
            "1. Semantic similarity score (e.g. '85% similar - updated commercial terms')\n"
            "2. Added clauses or requirements in Document B\n"
            "3. Removed clauses from Document A\n"
            "4. Modified clauses with before/after comparison\n"
            "5. Overall risk and legal/business impact evaluation"
        )

        response = client.models.generate_content(
            model=settings.DEFAULT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_json_schema=CompareResponse.model_json_schema(),
                temperature=0.2
            )
        )

        parsed = json.loads(response.text)
        parsed["base_title"] = doc_a.get("filename", "Doc A")
        parsed["comparison_title"] = doc_b.get("filename", "Doc B")
        return CompareResponse(**parsed)
