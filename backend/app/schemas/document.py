from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PageInfo(BaseModel):
    page_number: int
    char_count: int
    word_count: int
    image_filename: str
    image_url: str
    width: float
    height: float

class DocumentDetail(BaseModel):
    doc_id: str
    filename: str
    file_size: int
    total_pages: int
    title: str
    author: str
    subject: str
    creation_date: str
    pages: List[PageInfo]
    total_words: int
    is_scanned: bool

class Citation(BaseModel):
    page_number: int
    quote: str
    explanation: Optional[str] = None

class ChatRequest(BaseModel):
    doc_id: str
    question: str
    history: Optional[List[Dict[str, str]]] = []
    page_context: Optional[int] = None # Filter to single page if user wants

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation] = []
    doc_id: str

class SummaryResponse(BaseModel):
    doc_id: str
    executive_summary: str
    key_points: List[str] = []
    action_items: List[str] = []
    risks_and_obligations: List[str] = []
    stakeholders_entities: List[str] = []

# --- Extraction Schemas ---

class InvoiceItem(BaseModel):
    description: str
    quantity: Optional[float] = 1.0
    unit_price: Optional[float] = 0.0
    total_price: Optional[float] = 0.0

class InvoiceSchema(BaseModel):
    vendor_name: Optional[str] = Field(None, description="Company or person issuing the invoice")
    vendor_address: Optional[str] = Field(None, description="Billing/physical address of vendor")
    client_name: Optional[str] = Field(None, description="Customer or billed entity")
    invoice_number: Optional[str] = Field(None, description="Invoice reference ID")
    invoice_date: Optional[str] = Field(None, description="Issue date")
    due_date: Optional[str] = Field(None, description="Payment due date")
    items: List[InvoiceItem] = Field(default_factory=list, description="Line items")
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    currency: Optional[str] = "USD"
    payment_terms: Optional[str] = None

class ContractSchema(BaseModel):
    contract_title: Optional[str] = None
    parties: List[str] = Field(default_factory=list, description="Parties entering into agreement")
    effective_date: Optional[str] = None
    expiration_date: Optional[str] = None
    governing_law: Optional[str] = None
    key_obligations: List[str] = Field(default_factory=list)
    termination_clauses: Optional[str] = None
    confidentiality_clause: Optional[str] = None
    liability_limitation: Optional[str] = None
    dispute_resolution: Optional[str] = None

class ResumeSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_or_website: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)

class GenericExtractionSchema(BaseModel):
    document_type_detected: str
    key_entities: Dict[str, Any] = Field(default_factory=dict)
    key_dates: List[Dict[str, str]] = Field(default_factory=list)
    financial_figures: List[Dict[str, Any]] = Field(default_factory=list)
    tabular_data: List[Dict[str, Any]] = Field(default_factory=list)
    critical_notes: List[str] = Field(default_factory=list)

class ExtractionRequest(BaseModel):
    doc_id: str
    schema_type: str = "auto" # "invoice", "contract", "resume", "generic", or "auto"
    custom_instructions: Optional[str] = None

class CompareRequest(BaseModel):
    base_doc_id: str
    comparison_doc_id: str

class CompareResponse(BaseModel):
    base_title: str
    comparison_title: str
    semantic_similarity: str
    added_clauses: List[str] = []
    removed_clauses: List[str] = []
    modified_clauses: List[Dict[str, str]] = []
    risk_evaluation: str
