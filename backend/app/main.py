from fastapi import FastAPI

# Database
from app.database import Base, engine

# Import ALL models so SQLAlchemy registers them
from auth.models import User
from patient.models import Patient

# Routers
from auth.routes import router as auth_router
from patient.routes import router as patient_router

# Create tables in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SwasthyaVault API",
    version="1.0.0",
    description="AI-powered Digital Health Locker"
)

# Register routers
app.include_router(auth_router)
app.include_router(patient_router)

# Root endpoint
@app.get("/")
def root():
    return {
        "project": "SwasthyaVault",
        "status": "running",
        "version": "1.0.0"
    }