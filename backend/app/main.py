from fastapi import FastAPI

# Database
from app.database import Base, engine

# Models (IMPORTANT: register all models before create_all)
from auth.models import User
from patient.models import Patient
from documents.models import Document

# Routers
from auth.routes import router as auth_router
from patient.routes import router as patient_router
from documents.routes import router as document_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SwasthyaVault API",
    version="1.0.0",
    description="AI-powered Digital Health Locker"
)

# Register routers
app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(document_router)


@app.get("/")
def root():
    return {
        "project": "SwasthyaVault",
        "status": "running",
        "version": "1.0.0"
    }