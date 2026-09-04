import os
import shutil
from uuid import uuid4
from fastapi import UploadFile

# Folder where reports will be stored
UPLOAD_DIR = "uploads/documents"

# Create folder automatically if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_file(file: UploadFile):

    # Get original extension
    extension = file.filename.split(".")[-1]

    # Generate unique filename
    unique_filename = f"{uuid4()}.{extension}"

    # Full path
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path