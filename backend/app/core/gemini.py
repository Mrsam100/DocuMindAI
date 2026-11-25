from typing import Optional
from google import genai
from app.core.config import settings

def get_gemini_client(api_key: Optional[str] = None) -> genai.Client:
    key = api_key or settings.GEMINI_API_KEY
    if not key:
        raise ValueError("GEMINI_API_KEY is not configured. Provide it in .env or via X-Gemini-API-Key header.")
    return genai.Client(api_key=key, http_options={"api_version": "v1beta"})
