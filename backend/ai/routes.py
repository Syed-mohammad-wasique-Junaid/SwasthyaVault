from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from documents.models import Document
from ai.service import extract_text, generate_summary

router = APIRouter(prefix="/ai", tags=["AI OCR"])


@router.get("/analyze")
def analyze_latest_document(db: Session = Depends(get_db)):

    document = (
        db.query(Document)
        .filter(Document.user_id == 1)
        .order_by(Document.id.desc())
        .first()
    )

    if not document:
        raise HTTPException(404, "No uploaded documents found")

    text = extract_text(document.file_path)

    summary = generate_summary(text)

    return {
        "document": document.title,
        "ocr_text": text,
        "summary": summary
    }