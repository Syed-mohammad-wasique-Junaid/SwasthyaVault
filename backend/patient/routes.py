from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from patient.models import Patient
from patient.schemas import PatientCreate

router = APIRouter(prefix="/patient", tags=["Patient"])


@router.post("/profile")
def create_profile(data: PatientCreate, db: Session = Depends(get_db)):

    user_id = 1  # Temporary until JWT integration

    # Check if profile already exists
    existing = db.query(Patient).filter(Patient.user_id == user_id).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Patient profile already exists"
        )

    patient = Patient(
        user_id=user_id,
        abha_id=data.abha_id,
        dob=data.dob,
        gender=data.gender,
        blood_group=data.blood_group,
        phone=data.phone,
        address=data.address
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return patient


@router.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    user_id = 1

    patient = db.query(Patient).filter(Patient.user_id == user_id).first()

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found"
        )

    return patient