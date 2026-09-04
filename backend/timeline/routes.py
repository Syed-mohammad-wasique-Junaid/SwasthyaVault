from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from timeline.models import Timeline

router = APIRouter(prefix="/timeline", tags=["Health Timeline"])


@router.get("/")
def get_timeline(db: Session = Depends(get_db)):

    records = (
        db.query(Timeline)
        .filter(Timeline.user_id == 1)
        .order_by(Timeline.visit_date.desc())
        .all()
    )

    return records