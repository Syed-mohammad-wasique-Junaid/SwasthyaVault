from pydantic import BaseModel
from datetime import date

class PatientCreate(BaseModel):
    abha_id: str
    dob: date
    gender: str
    blood_group: str
    phone: str
    address: str

class PatientResponse(PatientCreate):
    id: int

    class Config:
        from_attributes = True