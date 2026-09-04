from pydantic import BaseModel
from datetime import datetime


class ConsentCreate(BaseModel):
    doctor_id: int
    expires_at: datetime


class ConsentResponse(ConsentCreate):
    id: int
    granted: bool

    class Config:
        from_attributes = True