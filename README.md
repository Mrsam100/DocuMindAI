# DocuMindAI — Enterprise Document Intelligence Workstation

<p align="center">
  <strong>High-throughput document analysis, factual grounding with exact page citations, schema-driven data extraction, and semantic clause diffing.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js%2015%20(React%2019)-black?style=flat-square&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/AI%20Engine-Google%20Gemini-4285F4?style=flat-square&logo=google" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/PDF%20Engine-PyMuPDF%202.1-red?style=flat-square" alt="PyMuPDF" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Language-TypeScript%20%7C%20Python-blue?style=flat-square" alt="TypeScript / Python" />
</p>

---

## 📌 Overview

**DocuMindAI** is an enterprise-grade document intelligence platform engineered for legal, financial, and operational document analysis. Unlike typical chatbot wrappers, DocuMindAI is built as a **utilitarian analysis workstation** (inspired by platforms like *Linear*, *Stripe*, *Carta*, and *Adobe Acrobat Pro*).

It bridges deterministic layout parsing (via **PyMuPDF**) with multimodal reasoning (via **Google Gemini**) to deliver verifiable citations, validated tabular data extraction, executive audits, and revision comparisons.

---

## ⚡ Key Capabilities

### 1. Dual-Mode Document Viewport
- **High-Resolution Canvas Mode**: 150 DPI page rendering generated server-side with zero browser font-drift or PDF.js quirks.
- **Native PDF Mode**: Built-in PDF reader with browser-native controls.
- **Navigation Controls**: Left thumbnail rail, direct page jumping (`p.1`, `p.2`), and zoom engine (50% to 200%).
- **Interactive Focus**: Clicking citations in analysis panels automatically scrolls and focuses the viewer on the exact page.

### 2. Query & Citations Console
- Grounded document Q&A strictly constrained to document facts to eliminate hallucinations.
- Every claim returns verified page citations (`p.1`, `p.2`) and exact supporting quotes.
- Pre-configured queries for financial figures, obligations, penalties, and counterparties.

### 3. Schema-Driven Field Extraction
- Automated schema detection or template-driven parsing:
  - **Invoices / Accounts Payable**: Vendor, customer, invoice ID, issue date, due date, itemized line items table, taxes, and total balance due.
  - **Commercial Agreements / MSAs**: Counterparties, governing law, obligations, termination clauses, and liability caps.
  - **Personnel / Resumes**: Candidate profile, contact info, skills inventory, timeline, and education.
  - **Generic Key-Values**: Dynamically extracts key-value pairs and tabular data from unstructured files.
- **1-Click Export**: Download structured data directly as **CSV** or **JSON**, or copy the JSON payload.

### 4. Document Audit & Executive Digest
- C-level executive briefing summarizing document scope.
- Itemized lists of key provisions, operational deadlines, and compliance requirements.
- Flags liabilities, indemnities, penalties, and identified counterparties.

### 5. Revision & Clause Diff Engine
- Computes semantic alignment between two revisions of a contract or agreement.
- Itemizes **Added Provisions** (`+`), **Removed Provisions** (`-`), and **Modified Terms** (e.g., changes from Net 30 to Net 15).
- Evaluates commercial and legal liability shifts.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DocuMindAI Workstation                          │
├───────────────────────────────────┬────────────────────────────────────┤
│ Left Pane: Document Canvas        │ Right Pane: Analysis Studio        │
│ • 150 DPI PyMuPDF page rendering  │ • [1] Query & Citations Console    │
│ • Dual Mode: Canvas vs Native PDF │ • [2] Field & Schema Extraction    │
│ • Zoom engine (50% to 200%)       │ • [3] Document Audit & Digest      │
│ • Page rail thumbnails & jumping  │ • [4] Revision & Clause Diff       │
└─────────────────▲─────────────────┴─────────────────▲──────────────────┘
                  │                                   │
                  └───────────────┬───────────────────┘
                                  │ REST / JSON (Port 8000)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Service                         │
│ • PyMuPDF (fitz) text extraction & 150 DPI page rendering              │
│ • Google Gemini SDK (gemini-2.5-flash / gemini-3.8-flash)              │
│ • Pydantic v2 structured output enforcement & validation               │
│ • Local file isolation & session state caching                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 15](https://nextjs.org/) (React 19) | App router with Turbopack for sub-second builds |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type-safety across components & API models |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Zinc monochrome palette, 1px mechanical borders |
| **Icons** | [Lucide React](https://lucide.dev/) | Utilitarian mechanical iconography |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.14) | Asynchronous, high-performance REST API |
| **Server** | [Uvicorn](https://www.uvicorn.org/) | Lightning-fast ASGI web server |
| **AI / LLM** | [Google GenAI SDK](https://github.com/googleapis/python-genai) | Gemini 2.5 Flash / 3.8 Flash multimodal reasoning |
| **PDF Engine** | [PyMuPDF](https://pymupdf.readthedocs.io/) | High-fidelity page extraction, rendering & coordinates |
| **Validation** | [Pydantic v2](https://docs.pydantic.dev/) | Structured data schema extraction & input validation |

---

## 📂 Project Structure

```
DocuMindAI/
├── frontend/                     # Next.js 15 Application
│   ├── src/
│   │   ├── app/                  # Main page, layout, globals.css
│   │   ├── components/           # Navbar, DocumentViewer, ChatTab,
│   │   │                         # ExtractionTab, SummaryTab, CompareTab, UploadModal
│   │   ├── lib/                  # REST API client
│   │   └── types/                # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── api/endpoints.py      # Endpoints (upload, chat, extract, audit, diff)
│   │   ├── core/                 # Config, Gemini SDK client, v1beta options
│   │   ├── services/
│   │   │   ├── document_parser.py# PyMuPDF text & 150 DPI page rendering
│   │   │   └── intelligence.py   # Grounded reasoning & structured extraction
│   │   ├── schemas/document.py   # Pydantic schemas (Invoice, Contract, Resume)
│   │   └── main.py               # FastAPI entry point & CORS configuration
│   ├── uploads/                  # Document storage & page caches
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore                    # Complete root ignore (Node, Python, .env secrets)
├── .env.example                  # Environment configuration template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **Python** >= 3.10
- A **Google Gemini API Key** (Free tier available at [Google AI Studio](https://aistudio.google.com/))

---

### Step 1: Clone Repository

```bash
git clone https://github.com/<your-username>/DocuMindAI.git
cd DocuMindAI
```

---

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure your environment
cp .env.example .env
```

Edit `backend/.env` with your Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
```

Start the backend server:
```bash
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
The API will be live at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

---

### Step 3: Frontend Setup

Open a new terminal in the project root:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Pre-Loaded Sample Documents

DocuMindAI includes 3 pre-indexed test documents for immediate evaluation:
1. **`sample_invoice.pdf`**: Commercial invoice (`INV-2026-8891`) featuring vendor/client metadata, 4 itemized line entries, tax calculation, and total balance due.
2. **`sample_contract_v1.pdf`**: Master Services Agreement (v1.0) with standard Net 30 payment terms and 12-month liability limitation.
3. **`sample_contract_v2.pdf`**: Revised Master Services Agreement (v2.0) with accelerated Net 15 payment terms, liability caps, and GDPR compliance clauses for revision diff testing.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/upload` | `POST` | Upload and process a PDF into text blocks and 150 DPI page previews |
| `/api/documents` | `GET` | List all parsed documents with page counts and metadata |
| `/api/documents/{id}` | `GET` | Retrieve full document metadata and page specifications |
| `/api/documents/{id}/pdf` | `GET` | Stream raw PDF binary for native browser rendering |
| `/api/documents/{id}/pages/{page}/image` | `GET` | Retrieve 150 DPI rendered PNG preview of a specific page |
| `/api/chat` | `POST` | Grounded multi-turn Q&A returning answers with exact citations |
| `/api/extract` | `POST` | Extract structured schema data (Invoice, MSA, Resume, Generic) |
| `/api/summarize/{id}` | `POST` | Generate comprehensive legal/operational document audit |
| `/api/compare` | `POST` | Compute clause-level semantic diff between two documents |

---

## 🔒 Security & Privacy

- **Bring Your Own Key (BYOK)**: API keys can be supplied via UI settings (stored in client `localStorage` and sent over request headers) or in server `.env`.
- **Zero Document Leakage**: Documents are parsed locally on the machine via PyMuPDF; only relevant context blocks are sent to Gemini.
- **Git Hygiene**: Environment files (`.env`), secrets, and user uploads are strictly excluded from source control.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
