import os
import sys
import time
import requests
from fastapi.testclient import TestClient
from sqlalchemy import func

# Set current directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database import engine, SessionLocal
from auth.models import User
from documents.models import Document
from timeline.models import Timeline
from consent.models import Consent
from ai.service import get_tesseract_cmd, extract_text, generate_summary

def run_verification():
    print("==================================================")
    print("STARTING SWASTHYAVAULT AI PIPELINE END-TO-END TEST")
    print("==================================================")

    # 1. Verify Database
    print(f"\n[1] Verifying PostgreSQL Engine Dialect: {engine.dialect.name}")
    assert engine.dialect.name == "postgresql", "Database dialect must be PostgreSQL!"

    # 2. Verify Tesseract
    tesseract_path = get_tesseract_cmd()
    print(f"\n[2] Tesseract Executable: {tesseract_path}")
    assert tesseract_path and os.path.exists(tesseract_path), "Tesseract executable must exist!"

    # 3. Verify Ollama & llama3.2
    print("\n[3] Checking Ollama Service at http://127.0.0.1:11434...")
    tags_res = requests.get("http://127.0.0.1:11434/api/tags", timeout=10)
    assert tags_res.status_code == 200, f"Ollama tags endpoint returned {tags_res.status_code}"
    models = [m.get("name") for m in tags_res.json().get("models", [])]
    print(f"    Available models in Ollama: {models}")
    
    # 4. Create unique test patient
    client = TestClient(app)
    ts = int(time.time())
    patient_email = f"ai.test.patient.{ts}@swasthyavault.com"
    patient_password = "SecurePassword123!"
    
    print(f"\n[4] Registering new patient: {patient_email}")
    reg_res = client.post("/auth/register", json={
        "email": patient_email,
        "password": patient_password,
        "full_name": "AI Pipeline Test Patient",
        "role": "patient"
    })
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    patient_id = reg_res.json().get("user_id")
    print(f"    Patient registered with ID: {patient_id}")

    # 5. Login patient
    print(f"\n[5] Logging in patient...")
    login_res = client.post("/auth/login", json={
        "email": patient_email,
        "password": patient_password
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    patient_token = login_res.json().get("access_token")
    patient_headers = {"Authorization": f"Bearer {patient_token}"}
    print(f"    JWT Token received: {patient_token[:25]}...")

    # 6. Upload real medical report image
    sample_file = os.path.join(os.path.dirname(__file__), "uploads", "documents", "sample.png")
    if not os.path.exists(sample_file):
        # Fallback to any file in uploads/documents
        upload_dir = os.path.join(os.path.dirname(__file__), "uploads", "documents")
        existing_files = [os.path.join(upload_dir, f) for f in os.listdir(upload_dir) if f.endswith((".png", ".jpg", ".jpeg"))]
        sample_file = existing_files[0]

    print(f"\n[6] Uploading report: {sample_file}")
    with open(sample_file, "rb") as f:
        upload_res = client.post(
            "/documents/upload",
            data={
                "title": f"Diagnostic Report {ts}",
                "document_type": "Blood Test"
            },
            files={"file": ("report_sample.png", f, "image/png")},
            headers=patient_headers
        )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    doc_id = upload_res.json().get("document_id")
    print(f"    Document created in PostgreSQL with ID: {doc_id}")

    # Verify Document in PostgreSQL
    db = SessionLocal()
    doc_in_db = db.query(Document).filter(Document.id == doc_id).first()
    assert doc_in_db is not None, "Document not found in PostgreSQL!"
    print(f"    Verified in PostgreSQL: Title='{doc_in_db.title}', FilePath='{doc_in_db.file_path}'")

    # 7. Run AI OCR & Summarization via GET /ai/analyze
    print(f"\n[7] Triggering Real OCR & Ollama LLM Summarization for Doc ID {doc_id}...")
    ai_res = client.get(f"/ai/analyze?document_id={doc_id}", headers=patient_headers)
    assert ai_res.status_code == 200, f"AI Analysis failed: {ai_res.text}"
    ai_data = ai_res.json()
    print("    OCR Text Length:", len(ai_data.get("ocr_text", "")))
    print("    AI Summary Structure:", ai_data.get("summary"))
    print("    Timeline ID:", ai_data.get("timeline_id"))
    timeline_id_1 = ai_data.get("timeline_id")

    # 8. Verify Timeline event in PostgreSQL
    print(f"\n[8] Checking Timeline event in PostgreSQL (ID: {timeline_id_1})...")
    tl_event = db.query(Timeline).filter(Timeline.id == timeline_id_1).first()
    assert tl_event is not None, "Timeline event not found in PostgreSQL!"
    print(f"    Timeline Record: Diagnosis='{tl_event.diagnosis}', Doctor='{tl_event.doctor}', Date={tl_event.visit_date}")

    # 9. Verify Idempotency: Calling /ai/analyze again must NOT create duplicate timeline event
    print(f"\n[9] Testing Idempotency (calling /ai/analyze second time)...")
    ai_res_2 = client.get(f"/ai/analyze?document_id={doc_id}", headers=patient_headers)
    assert ai_res_2.status_code == 200, f"Second AI Analysis failed: {ai_res_2.text}"
    timeline_id_2 = ai_res_2.json().get("timeline_id")
    assert timeline_id_1 == timeline_id_2, f"Timeline IDs must match! Got {timeline_id_1} and {timeline_id_2}"
    
    tl_count = db.query(Timeline).filter(Timeline.document_title == doc_in_db.title, Timeline.user_id == doc_in_db.user_id).count()
    print(f"    Total timeline events for this report: {tl_count} (Expected: 1)")
    assert tl_count == 1, "Expected exactly 1 timeline event!"

    # 10. Test Doctor access with and without consent
    doctor_email = f"ai.test.doctor.{ts}@swasthyavault.com"
    print(f"\n[10] Testing Doctor Access & Consent with doctor: {doctor_email}")
    doc_reg_res = client.post("/auth/register", json={
        "email": doctor_email,
        "password": patient_password,
        "full_name": "Dr. AI Test Specialist",
        "role": "doctor"
    })
    doctor_id = doc_reg_res.json().get("user_id")
    doc_login_res = client.post("/auth/login", json={
        "email": doctor_email,
        "password": patient_password
    })
    doctor_token = doc_login_res.json().get("access_token")
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}

    # Doctor accessing without consent -> Should be 403 Forbidden
    doc_ai_no_consent = client.get(f"/ai/analyze?document_id={doc_id}", headers=doctor_headers)
    print(f"    Doctor accessing without consent: HTTP {doc_ai_no_consent.status_code} (Expected 403)")
    assert doc_ai_no_consent.status_code == 403, "Doctor should not access without consent!"

    # Grant consent
    consent = Consent(
        patient_id=patient_id,
        doctor_id=doctor_id,
        granted=True
    )
    db.add(consent)
    db.commit()
    print("    Granted clinical consent to doctor.")

    # Doctor accessing with consent -> Should be 200 OK
    doc_ai_with_consent = client.get(f"/ai/analyze?document_id={doc_id}", headers=doctor_headers)
    print(f"    Doctor accessing with consent: HTTP {doc_ai_with_consent.status_code} (Expected 200)")
    assert doc_ai_with_consent.status_code == 200, "Doctor should access with active consent!"

    db.close()
    print("\n==================================================")
    print("ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!")
    print("==================================================")

if __name__ == "__main__":
    run_verification()
