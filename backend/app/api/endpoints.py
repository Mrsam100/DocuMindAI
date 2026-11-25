import uuid
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Query
from fastapi.responses import FileResponse

from app.core.config import settings
from app.services.document_parser import DocumentParser
from app.services.intelligence import IntelligenceService
from app.schemas.document import (
    DocumentDetail,
    ChatRequest,
    ChatResponse,
    SummaryResponse,
    ExtractionRequest,
    CompareRequest,
    CompareResponse
)

router = APIRouter()

@router.post("/upload", response_model=DocumentDetail)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are currently supported.")

    doc_id = str(uuid.uuid4())
    pdf_path = settings.UPLOAD_DIR / f"{doc_id}.pdf"

    # Save uploaded file
    try:
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Parse document and render preview pages
    try:
        parsed_data = DocumentParser.parse_pdf(str(pdf_path), doc_id)
        parsed_data["filename"] = file.filename
        return DocumentDetail(**parsed_data)
    except Exception as e:
        # Cleanup on failure
        if pdf_path.exists():
            pdf_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

@router.get("/documents", response_model=List[DocumentDetail])
async def list_documents():
    docs = []
    for json_file in settings.UPLOAD_DIR.glob("*.json"):
        try:
            doc = DocumentParser.get_parsed_doc(json_file.stem)
            if doc:
                docs.append(DocumentDetail(**doc))
        except Exception:
            continue
    return docs

@router.get("/documents/{doc_id}", response_model=DocumentDetail)
async def get_document(doc_id: str):
    doc = DocumentParser.get_parsed_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentDetail(**doc)

@router.get("/documents/{doc_id}/pdf")
async def get_document_pdf(doc_id: str):
    pdf_path = settings.UPLOAD_DIR / f"{doc_id}.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(
        str(pdf_path),
        media_type="application/pdf",
        filename=f"{doc_id}.pdf"
    )

@router.get("/documents/{doc_id}/pages/{page_num}/image")
async def get_page_image(doc_id: str, page_num: int):
    img_path = settings.PAGES_DIR / doc_id / f"page_{page_num}.png"
    if not img_path.exists():
        raise HTTPException(status_code=404, detail=f"Page image {page_num} not found")
    return FileResponse(str(img_path), media_type="image/png")

@router.get("/documents/{doc_id}/search")
async def search_document_text(
    doc_id: str,
    q: str = Query(..., min_length=1),
    page: Optional[int] = None
):
    pdf_path = settings.UPLOAD_DIR / f"{doc_id}.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found")

    doc = DocumentParser.get_parsed_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    results = []
    pages_to_search = [page] if page else range(1, doc["total_pages"] + 1)

    for p in pages_to_search:
        rects = DocumentParser.search_text_rects(str(pdf_path), p, q)
        if rects:
            results.append({
                "page_number": p,
                "matches": rects
            })

    return {"doc_id": doc_id, "query": q, "results": results}

@router.post("/chat", response_model=ChatResponse)
async def chat_with_doc(
    req: ChatRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key")
):
    doc = DocumentParser.get_parsed_doc(req.doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        response = IntelligenceService.chat_with_document(
            doc=doc,
            question=req.question,
            history=req.history,
            page_context=req.page_context,
            api_key=x_gemini_api_key
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize/{doc_id}", response_model=SummaryResponse)
async def summarize_doc(
    doc_id: str,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key")
):
    doc = DocumentParser.get_parsed_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        return IntelligenceService.generate_summary(doc, api_key=x_gemini_api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract")
async def extract_data(
    req: ExtractionRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key")
):
    doc = DocumentParser.get_parsed_doc(req.doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        return IntelligenceService.extract_structured(
            doc=doc,
            schema_type=req.schema_type,
            custom_instructions=req.custom_instructions,
            api_key=x_gemini_api_key
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compare", response_model=CompareResponse)
async def compare_docs(
    req: CompareRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key")
):
    doc_a = DocumentParser.get_parsed_doc(req.base_doc_id)
    doc_b = DocumentParser.get_parsed_doc(req.comparison_doc_id)
    if not doc_a or not doc_b:
        raise HTTPException(status_code=404, detail="One or both documents not found")

    try:
        return IntelligenceService.compare_documents(doc_a, doc_b, api_key=x_gemini_api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
