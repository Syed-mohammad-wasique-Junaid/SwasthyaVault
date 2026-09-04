from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    abha_id = Column(String(20), unique=True)
    dob = Column(Date)
    gender = Column(String(10))
    blood_group = Column(String(5))
    phone = Column(String(15))
    address = Column(String)