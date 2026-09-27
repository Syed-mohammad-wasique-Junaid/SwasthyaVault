from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.security import get_current_user
from auth.models import User
from patient.models import Patient
from consent.models import Consent

router = APIRouter(prefix="/doctor", tags=["Doctor"])

def calculate_age(born):
    if not born:
        return "Unknown"
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

@router.get("/search")
def search_doctors(
    q: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User).filter(User.role == "doctor")
    if q.strip():
        term = f"%{q.strip()}%"
        query = query.filter((User.full_name.ilike(term)) | (User.email.ilike(term)))

    doctors = query.order_by(User.full_name.asc()).limit(20).all()
    return [
        {
            "id": d.id,
            "name": d.full_name,
            "email": d.email,
            "role": d.role
        }
        for d in doctors
    ]


@router.get("/patients")
def get_patients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view patient directory")
        
    consents = db.query(Consent).filter(Consent.doctor_id == current_user.id, Consent.granted == True).all()
    patient_ids = [c.patient_id for c in consents]
    
    patients = db.query(Patient, User).join(User, Patient.user_id == User.id).filter(Patient.user_id.in_(patient_ids)).all()
    
    results = []
    for p, u in patients:
        results.append({
            "id": p.user_id,
            "name": u.full_name,
            "age": calculate_age(p.dob),
            "gender": p.gender,
            "blood_group": p.blood_group,
            "abha_id": p.abha_id,
            "phone": p.phone,
            "address": p.address,
            "status": "Active Consent",
            "ailment": "Refer to timeline" 
        })
    return results


@router.get("/patient/{patient_id}")
def get_patient_detail(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view patient details")

    # Verify active consent
    consent = db.query(Consent).filter(
        Consent.doctor_id == current_user.id,
        Consent.patient_id == patient_id,
        Consent.granted == True
    ).first()

    if not consent:
        raise HTTPException(status_code=403, detail="No active consent for this patient")

    patient_user = (
        db.query(Patient, User)
        .join(User, Patient.user_id == User.id)
        .filter(Patient.user_id == patient_id)
        .first()
    )

    if not patient_user:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    p, u = patient_user
    return {
        "id": p.user_id,
        "name": u.full_name,
        "email": u.email,
        "age": calculate_age(p.dob),
        "dob": str(p.dob) if p.dob else None,
        "gender": p.gender,
        "blood_group": p.blood_group,
        "height": p.height,
        "weight": p.weight,
        "ayush_status": p.ayush_status,
        "abha_id": p.abha_id,
        "phone": p.phone,
        "address": p.address,
        "status": "Active Consent"
    }

