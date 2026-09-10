from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database
from app.database import Base, engine

# Models (IMPORTANT: register all models before create_all)
from auth.models import User
from patient.models import Patient
from documents.models import Document
from timeline.models import Timeline
from consent.models import Consent

# Routers
from auth.routes import router as auth_router
from patient.routes import router as patient_router
from documents.routes import router as document_router
from ai.routes import router as ai_router
from timeline.routes import router as timeline_router
from consent.routes import router as consent_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SwasthyaVault API",
    version="1.0.0",
    description="AI-powered Digital Health Locker"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(document_router)
app.include_router(ai_router)
app.include_router(timeline_router)
app.include_router(consent_router)


@app.get("/")
def root():
    return {
        "project": "SwasthyaVault",
        "status": "running",
        "version": "1.0.0"
    }