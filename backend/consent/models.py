from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class Consent(Base):
    __tablename__ = "consent"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, ForeignKey("users.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))

    granted = Column(Boolean, default=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)