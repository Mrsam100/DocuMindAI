import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import pymupdf
from app.core.config import settings

class DocumentParser:
    @staticmethod
    def parse_pdf(file_path: str, doc_id: str) -> Dict[str, Any]:
        """
        Parses a PDF file:
        - Extracts text per page
        - Renders page preview PNG images
        - Extracts metadata and calculates word/character counts
        - Persists parsed metadata to doc_id.json
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        doc = pymupdf.open(str(path))
        pages_data: List[Dict[str, Any]] = []
        full_text_parts: List[str] = []

        doc_pages_dir = settings.PAGES_DIR / doc_id
        doc_pages_dir.mkdir(parents=True, exist_ok=True)

        for page_idx in range(len(doc)):
            page_num = page_idx + 1
            page = doc[page_idx]
            
            # Extract plain text
            page_text = page.get_text("text").strip()
            full_text_parts.append(f"--- [Page {page_num}] ---\n{page_text}")
            
            # Render page image (150 DPI for crisp visual rendering)
            pix = page.get_pixmap(dpi=150)
            img_filename = f"page_{page_num}.png"
            img_path = doc_pages_dir / img_filename
            pix.save(str(img_path))
            
            rect = page.rect
            pages_data.append({
                "page_number": page_num,
                "text": page_text,
                "char_count": len(page_text),
                "word_count": len(page_text.split()),
                "image_filename": img_filename,
                "image_url": f"/api/documents/{doc_id}/pages/{page_num}/image",
                "width": float(rect.width),
                "height": float(rect.height)
            })

        metadata = doc.metadata or {}
        summary_info = {
            "doc_id": doc_id,
            "filename": path.name,
            "file_size": path.stat().st_size,
            "total_pages": len(doc),
            "title": metadata.get("title") or path.stem,
            "author": metadata.get("author") or "",
            "subject": metadata.get("subject") or "",
            "creation_date": metadata.get("creationDate") or "",
            "pages": pages_data,
            "full_text": "\n\n".join(full_text_parts),
            "total_words": sum(p["word_count"] for p in pages_data),
            "is_scanned": all(p["word_count"] < 10 for p in pages_data)
        }
        
        doc.close()

        # Cache parsed data
        cache_path = settings.UPLOAD_DIR / f"{doc_id}.json"
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(summary_info, f, indent=2, ensure_ascii=False)

        return summary_info

    @staticmethod
    def get_parsed_doc(doc_id: str) -> Optional[Dict[str, Any]]:
        cache_path = settings.UPLOAD_DIR / f"{doc_id}.json"
        if not cache_path.exists():
            return None
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def search_text_rects(file_path: str, page_number: int, query: str) -> List[Dict[str, float]]:
        """
        Search for text occurrence on a specific page and return bounding boxes.
        """
        doc = pymupdf.open(file_path)
        if page_number < 1 or page_number > len(doc):
            doc.close()
            return []
        
        page = doc[page_number - 1]
        rects = page.search_for(query)
        result = [
            {"x0": r.x0, "y0": r.y0, "x1": r.x1, "y1": r.y1}
            for r in rects
        ]
        doc.close()
        return result
