import pymupdf
from pathlib import Path

def create_sample_invoice(out_path: str):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842) # A4
    
    # Header
    page.insert_text((50, 60), "INVOICE", fontsize=24, fontname="helv", color=(0.1, 0.2, 0.4))
    page.insert_text((50, 90), "DocuMind Technologies Inc.", fontsize=12, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text((50, 105), "100 AI Boulevard, Suite 500, San Francisco, CA 94107", fontsize=10, fontname="helv", color=(0.4, 0.4, 0.4))
    page.insert_text((50, 120), "billing@documind.ai | +1 (555) 019-2834", fontsize=10, fontname="helv", color=(0.4, 0.4, 0.4))

    # Meta
    page.insert_text((380, 60), "Invoice #: INV-2026-8891", fontsize=11, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text((380, 78), "Date: November 15, 2026", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))
    page.insert_text((380, 95), "Due Date: December 15, 2026", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))
    page.insert_text((380, 112), "Payment Terms: Net 30", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))

    # Bill To
    page.insert_text((50, 160), "BILLED TO:", fontsize=11, fontname="helv", color=(0.1, 0.2, 0.4))
    page.insert_text((50, 178), "Apex Global Logistics Corp.", fontsize=11, fontname="helv")
    page.insert_text((50, 194), "Attn: Accounts Payable", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))
    page.insert_text((50, 209), "742 Evergreen Terrace, Chicago, IL 60601", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))

    # Table Header Line
    page.draw_rect(pymupdf.Rect(50, 240, 545, 260), color=(0.9, 0.94, 0.98), fill=(0.9, 0.94, 0.98))
    page.insert_text((60, 254), "Item Description", fontsize=10, fontname="helv", color=(0.1, 0.2, 0.4))
    page.insert_text((320, 254), "Qty", fontsize=10, fontname="helv", color=(0.1, 0.2, 0.4))
    page.insert_text((390, 254), "Unit Price", fontsize=10, fontname="helv", color=(0.1, 0.2, 0.4))
    page.insert_text((470, 254), "Total ($)", fontsize=10, fontname="helv", color=(0.1, 0.2, 0.4))

    # Rows
    items = [
        ("DocuMind Enterprise AI License (Annual)", "1", "12,000.00", "12,000.00"),
        ("Custom Document Parsing Model Fine-Tuning", "2", "3,500.00", "7,000.00"),
        ("Multi-Cloud Dedicated Processing Nodes", "12", "450.00", "5,400.00"),
        ("24/7 Premium SLA Support & Training", "1", "2,500.00", "2,500.00")
    ]

    y = 285
    for desc, qty, price, total in items:
        page.insert_text((60, y), desc, fontsize=10, fontname="helv")
        page.insert_text((325, y), qty, fontsize=10, fontname="helv")
        page.insert_text((390, y), f"${price}", fontsize=10, fontname="helv")
        page.insert_text((470, y), f"${total}", fontsize=10, fontname="helv")
        page.draw_line((50, y + 8), (545, y + 8), color=(0.85, 0.85, 0.85), width=0.5)
        y += 28

    # Totals
    ty = y + 20
    page.insert_text((370, ty), "Subtotal:", fontsize=10, fontname="helv")
    page.insert_text((470, ty), "$26,900.00", fontsize=10, fontname="helv")
    
    page.insert_text((370, ty + 20), "Tax (8.25%):", fontsize=10, fontname="helv")
    page.insert_text((470, ty + 20), "$2,219.25", fontsize=10, fontname="helv")
    
    page.draw_line((360, ty + 30), (545, ty + 30), color=(0.2, 0.2, 0.2), width=1)
    page.insert_text((360, ty + 48), "Total Amount Due:", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))
    page.insert_text((470, ty + 48), "$29,119.25", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))

    # Notes
    page.insert_text((50, ty + 90), "Payment Instructions:", fontsize=10, fontname="helv", color=(0.1, 0.2, 0.4))
    page.insert_text((50, ty + 105), "Wire Transfer: Silicon Valley Bank, Routing # 121000358, Acct # 9928374112", fontsize=9, fontname="helv", color=(0.3, 0.3, 0.3))
    page.insert_text((50, ty + 120), "Please include Invoice # INV-2026-8891 on all remittances.", fontsize=9, fontname="helv", color=(0.3, 0.3, 0.3))

    doc.save(out_path)
    doc.close()

def create_sample_contract(out_path: str, version: int = 1):
    doc = pymupdf.open()
    
    # Page 1
    p1 = doc.new_page(width=595, height=842)
    p1.insert_text((50, 60), f"MASTER SERVICES AGREEMENT (v{version}.0)", fontsize=18, fontname="helv", color=(0.1, 0.2, 0.4))
    p1.insert_text((50, 90), "This Master Services Agreement is entered into as of November 1, 2026, by and between:", fontsize=10, fontname="helv")
    p1.insert_text((60, 115), "1. DocuMind Technologies Inc. ('Service Provider')", fontsize=10, fontname="helv")
    p1.insert_text((60, 130), "2. Apex Global Logistics Corp. ('Client')", fontsize=10, fontname="helv")

    p1.insert_text((50, 160), "SECTION 1: SCOPE OF SERVICES", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))
    p1.insert_text((50, 180), "Service Provider shall deliver intelligent document processing, OCR extraction, and automated", fontsize=10, fontname="helv")
    p1.insert_text((50, 195), "knowledge extraction infrastructure to Client under the agreed Service Level Agreement (SLA).", fontsize=10, fontname="helv")

    p1.insert_text((50, 230), "SECTION 2: PAYMENT AND FEES", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))
    if version == 1:
        p1.insert_text((50, 250), "Client agrees to pay all undisputed invoices within Net 30 days of receipt.", fontsize=10, fontname="helv")
        p1.insert_text((50, 265), "Late payments shall accrue interest at 1.0% per month.", fontsize=10, fontname="helv")
    else:
        p1.insert_text((50, 250), "Client agrees to pay all undisputed invoices within Net 15 days of receipt.", fontsize=10, fontname="helv")
        p1.insert_text((50, 265), "Late payments shall accrue interest at 2.5% per month plus recovery fees.", fontsize=10, fontname="helv")

    p1.insert_text((50, 300), "SECTION 3: CONFIDENTIALITY", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))
    p1.insert_text((50, 320), "Both parties agree to hold all proprietary trade secrets, customer data, and source code in strict", fontsize=10, fontname="helv")
    p1.insert_text((50, 335), "confidence for a minimum period of five (5) years following termination of this Agreement.", fontsize=10, fontname="helv")

    # Page 2
    p2 = doc.new_page(width=595, height=842)
    p2.insert_text((50, 60), "SECTION 4: LIMITATION OF LIABILITY", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))
    if version == 1:
        p2.insert_text((50, 80), "Except for breaches of confidentiality, neither party's aggregate liability under this agreement", fontsize=10, fontname="helv")
        p2.insert_text((50, 95), "shall exceed the total fees paid by Client during the preceding twelve (12) month period.", fontsize=10, fontname="helv")
    else:
        p2.insert_text((50, 80), "Under no circumstances shall Service Provider's liability exceed $50,000 USD regardless of cause.", fontsize=10, fontname="helv")
        p2.insert_text((50, 95), "Client shall indemnify and defend Service Provider against all third-party IP claims.", fontsize=10, fontname="helv")

    p2.insert_text((50, 130), "SECTION 5: GOVERNING LAW & ARBITRATION", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))
    p2.insert_text((50, 150), "This Agreement shall be construed in accordance with the laws of the State of California.", fontsize=10, fontname="helv")
    p2.insert_text((50, 165), "Any dispute arising hereunder shall be settled by binding arbitration in San Francisco, CA.", fontsize=10, fontname="helv")

    if version == 2:
        p2.insert_text((50, 200), "SECTION 6: DATA PRIVACY & GDPR COMPLIANCE (NEW)", fontsize=12, fontname="helv", color=(0.7, 0.1, 0.1))
        p2.insert_text((50, 220), "Client warrants that all processed documents comply with EU GDPR and California CCPA regulations.", fontsize=10, fontname="helv")
        p2.insert_text((50, 235), "Data retention shall not exceed ninety (90) days upon explicit account deactivation request.", fontsize=10, fontname="helv")

    # Signatures
    sy = 300 if version == 1 else 330
    p2.insert_text((50, sy), "IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.", fontsize=10, fontname="helv")
    p2.insert_text((50, sy + 40), "For DocuMind Technologies: _____________________    Date: Nov 1, 2026", fontsize=10, fontname="helv")
    p2.insert_text((50, sy + 70), "For Apex Global Logistics:  _____________________    Date: Nov 3, 2026", fontsize=10, fontname="helv")

    doc.save(out_path)
    doc.close()

if __name__ == "__main__":
    p = Path("backend/uploads")
    p.mkdir(parents=True, exist_ok=True)
    create_sample_invoice("backend/uploads/sample_invoice.pdf")
    create_sample_contract("backend/uploads/sample_contract_v1.pdf", version=1)
    create_sample_contract("backend/uploads/sample_contract_v2.pdf", version=2)
    print("Created sample PDF files successfully!")
