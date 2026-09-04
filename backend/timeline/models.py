from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base

class Timeline(Base):
    __tablename__ = "timeline"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    visit_date = Column(Date)
    diagnosis = Column(String)
    doctor = Column(String)
    document_title = Column(String)