import os
import shutil
import uuid
from fastapi import UploadFile

UPLOAD_DIR = "uploads/documents"

# Create folder if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_file(file: UploadFile) -> str:
    # Keep original extension
    extension = os.path.splitext(file.filename)[1].lower()

    filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save binary file correctly
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path