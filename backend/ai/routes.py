from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.database import get_db
from documents.models import Document
from timeline.models import Timeline
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
        raise HTTPException(status_code=404, detail="No uploaded document found")

    text = extract_text(document.file_path)
    summary = generate_summary(text)

    # Convert AI date safely
    raw_date = str(summary.get("visit_date", "")).strip()

    try:
        visit_date = datetime.strptime(raw_date, "%Y-%m-%d").date()
    except Exception:
        visit_date = date.today()

    print("AI SUMMARY:", summary)
    print("RAW DATE:", raw_date)
    print("PARSED DATE:", visit_date)
    print(type(visit_date))
    
    event = Timeline(
        user_id=1,
        visit_date=visit_date,
        diagnosis=summary.get("diagnosis", ""),
        doctor=summary.get("doctor", ""),
        document_title=document.title,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "document": document.title,
        "ocr_text": text,
        "summary": summary,
        "timeline_id": event.id
    }