from pydantic import BaseModel
from datetime import date

class TimelineCreate(BaseModel):
    visit_date: date
    diagnosis: str
    doctor: str
    document_title: str


class TimelineResponse(TimelineCreate):
    id: int

    class Config:
        from_attributes = True