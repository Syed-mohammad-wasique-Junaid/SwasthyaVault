from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from documents.models import Document
from documents.service import save_file

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload")
def upload_document(
    title: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save file locally
    path = save_file(file)

    # Save metadata in PostgreSQL
    document = Document(
        user_id=1,      # Temporary until JWT integration
        title=title,
        document_type=document_type,
        file_path=path
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully",
        "document_id": document.id,
        "file_path": document.file_path
    }


@router.get("/")
def get_documents(db: Session = Depends(get_db)):
    documents = (
        db.query(Document)
        .filter(Document.user_id == 1)
        .all()
    )

    return documents