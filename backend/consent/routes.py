from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from consent.models import Consent
from consent.schemas import ConsentCreate

router = APIRouter(prefix="/consent", tags=["Consent"])


@router.post("/grant")
def grant_consent(
    data: ConsentCreate,
    db: Session = Depends(get_db)
):

    consent = Consent(
        patient_id=1,
        doctor_id=data.doctor_id,
        expires_at=data.expires_at,
        granted=True
    )

    db.add(consent)
    db.commit()
    db.refresh(consent)

    return consent


@router.get("/")
def get_consents(db: Session = Depends(get_db)):
    return db.query(Consent).filter(
        Consent.patient_id == 1
    ).all()