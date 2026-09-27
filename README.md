# 🏥 SwasthyaVault
### Your Health Records. Secure, Organized, and Accessible.

SwasthyaVault is an AI-powered digital healthcare record management platform developed as part of **Smart India Hackathon (SIH) 2026**.

The platform aims to simplify how patients store, organize, access, and share their medical records. By combining secure document management, Optical Character Recognition (OCR), offline AI processing, and automated medical timelines, SwasthyaVault transforms scattered medical documents into an organized digital health history.

Built using **Next.js, FastAPI, PostgreSQL, Tesseract OCR, and Ollama**, the project focuses on improving healthcare accessibility while keeping patients in control of their personal medical information.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Application Workflow](#-application-workflow)
- [AI and Document Processing](#-ai-and-document-processing)
- [Security and Privacy](#-security-and-privacy)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Current Development Status](#-current-development-status)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [Disclaimer](#-disclaimer)
- [Acknowledgements](#-acknowledgements)

---

## 🌟 Overview

Medical records are often scattered across hospitals, diagnostic laboratories, physical documents, and personal devices. Retrieving the right information during a medical consultation can become difficult when records are incomplete, unorganized, or inaccessible.

SwasthyaVault addresses this challenge by providing a centralized digital health locker where patients can manage their medical documents and build an organized record of their health history.

The platform combines document storage with AI-assisted processing to help users retrieve information more efficiently and understand their medical records.

### Our Objectives

- Centralize personal medical records in a digital health locker.
- Simplify the storage and retrieval of medical documents.
- Extract text from scanned documents using OCR.
- Generate AI-assisted summaries of medical reports.
- Organize available medical information into a chronological timeline.
- Enable patient-controlled sharing of health records.
- Explore multilingual and inclusive healthcare accessibility.

---

## 🎯 Problem Statement

Managing personal healthcare information can be challenging due to fragmented records, unstructured documents, and limited access to historical medical information.

### 1. Fragmented Medical Records

Patients often maintain prescriptions, diagnostic reports, laboratory results, and consultation records across multiple healthcare providers and physical locations.

### 2. Difficult Information Retrieval

Locating a specific medical report or understanding the sequence of past medical events can be time-consuming.

### 3. Unstructured Documents

Medical information is frequently stored in PDFs, scanned reports, and images. Extracting useful information from these documents manually can be tedious.

### 4. Limited Continuity of Care

When relevant medical history is unavailable during a consultation, healthcare professionals may not have access to the complete set of records needed to understand a patient's documented history.

### 5. Patient Data Control

Patients need a convenient way to manage their records and control when their personal medical information is shared.

### 6. Accessibility Barriers

Complex medical terminology and language differences can make health information difficult for some patients to understand.

SwasthyaVault aims to address these challenges through centralized record management, AI-assisted document processing, and consent-based information sharing.

---

## 💡 Our Solution

SwasthyaVault provides a centralized platform for storing, processing, organizing, and accessing personal medical records.

The application combines a digital health locker with an AI-powered document-processing pipeline.

### How It Works

1. **Upload:** Patients upload their medical documents to their digital health locker.
2. **Extract:** OCR and document-processing tools extract text from supported files.
3. **Process:** Extracted information is processed into structured data.
4. **Summarize:** An AI model generates a concise summary of the medical document.
5. **Organize:** Available medical information is associated with a chronological health timeline.
6. **Review:** Patients can access and manage their stored records.
7. **Share:** Patients can authorize access to selected medical information through a consent-based workflow.

The goal is to make healthcare information more organized, accessible, and patient-centric.

---

## ✨ Key Features

### 🔐 1. Digital Health Locker

A centralized repository for personal medical documents.

- Store medical documents digitally.
- Manage and retrieve uploaded records.
- Associate documents with the patient's profile.
- Keep medical information organized in one place.
- Reduce dependence on physical copies of medical reports.

### 📄 2. Medical Document Management

The document management module handles medical records within the application.

- Upload and manage medical documents.
- Maintain document information and metadata.
- Associate records with the relevant patient.
- Retrieve stored documents when needed.
- Support document processing through the backend.

### 🔍 3. Offline Optical Character Recognition (OCR)

SwasthyaVault uses **Tesseract OCR** to extract machine-readable text from supported scanned medical documents.

The OCR pipeline helps make otherwise unsearchable documents available for further processing.

Key capabilities include:

- Text extraction from supported scanned documents.
- Processing of OCR output for downstream AI tasks.
- Support for digitizing information contained in medical records.
- Reduced dependence on external OCR services.

### 🧠 4. AI-Powered Medical Summarization

The platform uses **Ollama and Llama 3.2** for offline AI-assisted medical text summarization.

The AI pipeline processes extracted document text and generates a concise, structured summary to help users review their records.

- Summarize lengthy medical documents.
- Make extracted information easier to review.
- Support offline inference using a locally hosted model.
- Reduce dependence on external AI APIs for supported workflows.

AI-generated summaries are intended to supplement the original medical documents, not replace them.

### 🗓️ 5. Automatic Medical Timeline

SwasthyaVault organizes available medical information into a chronological timeline.

The timeline is intended to provide a consolidated view of a patient's documented health history.

It can help users review records such as:

- Medical reports
- Diagnostic records
- Prescriptions
- Consultation-related information
- Other dated medical documents

The timeline depends on the information available in the stored records and extracted data.

### 👤 6. Patient Profile Management

The patient module provides a dedicated space for patient-related information.

- Maintain patient profile information.
- Associate medical records with the relevant patient.
- Support personalized health-record management.
- Provide a foundation for patient-specific features.

### 🤝 7. Consent Management

SwasthyaVault incorporates a consent-management workflow to support patient-controlled sharing of medical information.

The objective is to ensure that access to personal health records is managed through explicit authorization.

The broader workflow is designed around:

- Managing patient consent.
- Supporting authorized access to medical information.
- Connecting consent with healthcare record sharing.
- Providing a foundation for controlled access and revocation.

### 🩺 8. Doctor Dashboard

The broader project scope includes a doctor-facing interface for reviewing authorized patient information.

The intended functionality includes access to relevant medical records, summaries, and organized health history.

Access to patient information should be governed by the application's authorization and consent mechanisms.

### 🌿 9. AYUSH Record Support

The project scope includes support for AYUSH-related health information, with the goal of accommodating relevant traditional healthcare records alongside other medical documents.

### 🌐 10. Multilingual Accessibility

Multilingual accessibility is part of the broader SwasthyaVault vision.

The objective is to make the platform and its health information more accessible to users from different language backgrounds.

---

## 🏗️ System Architecture

SwasthyaVault follows a frontend–backend architecture with a relational database and a document-processing pipeline.

```text
                       ┌─────────────────────┐
                       │        User         │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │      Frontend       │
                       │      Next.js        │
                       │    Tailwind CSS     │
                       └──────────┬──────────┘
                                  │
                            REST API
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │   FastAPI Backend   │
                       └──────────┬──────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │ Authentication  │  │   PostgreSQL    │  │    Document     │
    │ & Authorization │  │    Database     │  │   Management    │
    └─────────────────┘  └─────────────────┘  └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   OCR Engine    │
                                              │   Tesseract     │
                                              └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   Offline AI    │
                                              │ Ollama /        │
                                              │ Llama 3.2       │
                                              └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Structured Data │
                                              │ Summaries &     │
                                              │ Medical Timeline│
                                              └─────────────────┘
```

### Architecture Components

| Component | Responsibility |
|---|---|
| Next.js frontend | User interface and client-side interactions |
| FastAPI backend | API endpoints and application logic |
| PostgreSQL | Persistent storage for structured application data |
| JWT authentication | Token-based authentication |
| Document module | Medical document management |
| Tesseract OCR | Text extraction from supported scanned documents |
| Ollama | Local AI model execution |
| Llama 3.2 | AI-assisted medical text summarization |
| Consent module | Management of patient consent |

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js | Frontend framework |
| React | Component-based user interface |
| TypeScript | Type-safe JavaScript development |
| Tailwind CSS | Utility-first CSS styling |

### Backend

| Technology | Purpose |
|---|---|
| Python | Backend programming language |
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| PostgreSQL | Relational database |
| SQLAlchemy | Database ORM |
| JWT | Token-based authentication |

### AI and Document Processing

| Technology | Purpose |
|---|---|
| Tesseract OCR | Offline text extraction |
| Ollama | Local model execution |
| Llama 3.2 | AI-assisted text summarization |
| PyMuPDF | PDF text extraction and processing |

### Development Tools

- Git and GitHub
- Visual Studio Code
- Node.js and npm
- Python
- PostgreSQL

---

## 📂 Project Structure

```text
SwasthyaVault/
│
├── frontend/
│   ├── app/                       # Next.js application
│   ├── public/                    # Static assets
│   ├── package.json               # Frontend dependencies
│   ├── package-lock.json          # Locked npm dependencies
│   ├── next.config.ts             # Next.js configuration
│   ├── postcss.config.mjs         # PostCSS configuration
│   └── tsconfig.json              # TypeScript configuration
│
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entry point
│   │   ├── config.py              # Application configuration
│   │   ├── database.py            # Database configuration
│   │   ├── security.py            # Security utilities
│   │   │
│   │   ├── auth/
│   │   │   ├── models.py
│   │   │   ├── routes.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── patient/
│   │   │   ├── models.py
│   │   │   ├── routes.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── documents/
│   │   │   ├── models.py
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   │
│   │   ├── consent/
│   │   │   ├── models.py
│   │   │   └── routes.py
│   │   │
│   │   ├── timeline/
│   │   │   ├── models.py
│   │   │   └── routes.py
│   │   │
│   │   ├── doctor/
│   │   │   └── routes.py
│   │   │
│   │   └── consultation/
│   │
│   ├── ai/
│   │   ├── prompts.py              # AI prompts
│   │   ├── routes.py               # AI API routes
│   │   ├── service.py              # AI processing logic
│   │   └── __init__.py
│   │
│   ├── update_db.py                # Database update utility
│   └── verify_ai_pipeline.py       # AI pipeline verification
│
├── .gitignore
└── README.md
```

*Note: This is a representative overview of the repository. Additional files, generated assets, and configuration files may be present.*

---

## 🔄 Application Workflow

### 1. Authentication

The user authenticates with the application. The backend validates the request and provides access to protected functionality according to the authentication and authorization logic.

### 2. Document Upload

The patient uploads a medical document through the application.

The backend receives the document and associates it with the appropriate patient record.

### 3. Text Extraction

The document-processing pipeline extracts text from supported documents.

- Text-based PDFs can be processed using PDF text extraction.
- Scanned documents can be processed using OCR.
- Extracted text is prepared for further processing.

### 4. AI Processing

The extracted text is passed to the configured AI service.

The AI model generates a structured summary of the available medical information.

### 5. Timeline Generation

Relevant information from the medical record is used to organize the patient's documented history chronologically.

### 6. Patient Review

The patient can access their stored records and review the associated information.

### 7. Consent-Based Sharing

When records need to be shared, the consent-management workflow provides a mechanism for managing patient authorization.

---

## 🤖 AI and Document Processing

A key component of SwasthyaVault is its AI-assisted document-processing pipeline.

### Document Processing Pipeline

```text
Medical Document
       │
       ▼
PDF / Image Processing
       │
       ▼
Text Extraction
       │
       ▼
Extracted Medical Text
       │
       ▼
AI-Assisted Processing
       │
       ▼
Structured Summary
       │
       ▼
Medical Record / Timeline
```

### Offline AI with Ollama

SwasthyaVault uses a locally hosted AI workflow based on Ollama and Llama 3.2.

Local inference can reduce the need to send medical document contents to an external AI provider for supported operations.

It can also allow AI processing without depending on a cloud inference API, provided the required model is installed and the local environment has sufficient resources.

### Design Considerations

- Preserve the original medical document.
- Treat generated summaries as supplementary information.
- Validate extracted information before using it in structured records.
- Handle incomplete or unreadable documents gracefully.
- Avoid treating AI-generated content as a medical diagnosis.
- Allow users to refer back to the original source document.

---

## 🔒 Security and Privacy

Medical information is sensitive. SwasthyaVault is designed with authentication, controlled access, and patient consent as important considerations.

### Authentication

JWT-based authentication is used to support protected API access.

### Patient-Controlled Sharing

The consent-management module provides a foundation for managing authorization to access patient information.

### Local AI Processing

The offline AI pipeline reduces dependence on external AI services for supported document-processing operations.

### Security Considerations

A production deployment should implement and verify:

- HTTPS for data in transit.
- Secure password hashing.
- Authorization checks for protected resources.
- File type and file size validation.
- Secure storage of uploaded medical documents.
- Protection of database credentials and application secrets.
- Database backups and recovery procedures.
- Audit logging for sensitive record access.
- Appropriate data retention and deletion policies.
- Consent validation and revocation enforcement.

Security controls should be tested before the application is used to store real patient information.

---

## 🚀 Getting Started

Follow these instructions to set up SwasthyaVault locally.

### Prerequisites

Install the following tools:

| Requirement | Purpose |
|---|---|
| Git | Clone the repository |
| Node.js and npm | Run the frontend |
| Python | Run the backend |
| PostgreSQL | Database |
| Tesseract OCR | OCR processing |
| Ollama | Local AI inference |

### 1. Clone the Repository

```bash
git clone https://github.com/Syed-mohammad-wasique-Junaid/SwasthyaVault.git
cd SwasthyaVault
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows Command Prompt:

```cmd
.venv\Scripts\activate
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

If a `requirements.txt` file is not present in your checkout, install the dependencies specified by the project's actual dependency configuration.

### 3. Configure PostgreSQL

Install and start PostgreSQL.

Create a database for the application:

```sql
CREATE DATABASE swasthyavault;
```

Configure the database connection using the settings expected by:

```text
backend/app/config.py
backend/app/database.py
```

Use your local database credentials. Do not commit passwords or secrets to GitHub.

### 4. Configure the AI Pipeline

Install Tesseract OCR and ensure it is accessible to the backend.

Install Ollama and download the model:

```bash
ollama pull llama3.2
```

Start the Ollama service if it is not already running:

```bash
ollama serve
```

Ensure that the model name and service configuration match the application's AI service implementation.

### 5. Start the Backend

From the **repository root**, run:

```bash
python -m uvicorn backend.app.main:app --reload
```

Alternatively, from inside the `backend` directory, run:

```bash
python -m uvicorn app.main:app --reload
```

The backend should be available at:

```text
http://127.0.0.1:8000
```

### 6. Set Up the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend should be available at:

```text
http://localhost:3000
```

### 7. Verify the Application

Once the backend is running, open the interactive API documentation:

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

Once the frontend is running, open:

[http://localhost:3000](http://localhost:3000)

If a service fails to start, check the terminal output for missing dependencies, configuration errors, database connectivity issues, or port conflicts.

---

## ⚙️ Environment Configuration

The backend requires configuration for its database and any additional services used by the application.

Create a local environment file in the location expected by the backend configuration.

The following is an **illustrative example**. The variable names must be adjusted to match those read by `backend/app/config.py` and `backend/app/database.py`.

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/swasthyavault

SECRET_KEY=replace_with_a_secure_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

Do not commit real credentials, API keys, JWT secrets, or database passwords to the repository.

---

## 📡 API Documentation

The backend is built using FastAPI and exposes API endpoints for the application's modules.

Once the backend is running, access the interactive documentation:

- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

The backend includes modules covering areas such as:

| Module | Responsibility |
|---|---|
| Authentication | User authentication |
| Patient | Patient profile management |
| Documents | Medical document management |
| Consent | Patient consent management |
| Timeline | Chronological medical history |
| Doctor | Doctor-related functionality |
| Consultation | Consultation-related functionality |
| AI | AI-assisted document processing |

For the exact endpoint paths, request schemas, response formats, and HTTP methods, refer to the live Swagger documentation.

---

## 📊 Current Development Status

SwasthyaVault is an evolving project developed for SIH 2026.

The backend has been developed around the following core capabilities:

- [x] JWT authentication
- [x] Patient profile management
- [x] Medical document management
- [x] Offline OCR using Tesseract
- [x] AI-assisted medical summarization using Ollama and Llama 3.2
- [x] Automatic medical timeline generation
- [x] Consent management

The broader project scope includes a patient-facing health locker, doctor-facing access, AYUSH record support, and multilingual accessibility.

The implementation status of individual features may vary. Refer to the current codebase and running application for the functionality available in the latest version.

---

## 🛣️ Future Enhancements

Potential areas for further development include:

- **Enhanced document parsing:** Improve extraction from different medical document formats.
- **Summary verification:** Help users compare AI-generated summaries with original documents.
- **Advanced search:** Search records by date, document type, or extracted content.
- **Healthcare interoperability:** Explore standardized healthcare data formats such as HL7 FHIR.
- **Granular consent controls:** Support more detailed sharing permissions and access duration.
- **Audit trail:** Maintain a transparent history of access and sharing activity.
- **Multilingual support:** Expand language options for the interface and document summaries.
- **Doctor dashboard:** Improve the presentation of authorized patient records.
- **AYUSH integration:** Improve support for traditional healthcare documentation.
- **Testing:** Expand automated tests for authentication, document processing, and permissions.
- **Deployment:** Introduce production deployment, monitoring, backup, and recovery workflows.

---

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the affected functionality.
5. Commit your changes with a descriptive message.
6. Open a pull request explaining your changes.

Example:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Please do not commit secrets, private medical records, database dumps, or other sensitive information.

---

## ⚠️ Disclaimer

SwasthyaVault is a student-developed project intended to demonstrate digital health-record management and AI-assisted document processing.

It is **not a substitute for professional medical advice, diagnosis, or treatment**.

AI-generated summaries may omit, misinterpret, or incorrectly extract information. Always refer to the original medical document and consult a qualified healthcare professional before making medical decisions.

The application should not be considered production-ready for real patient data until its security, privacy, reliability, and applicable regulatory requirements have been appropriately reviewed.

---

## 🙏 Acknowledgements

Developed as part of **Smart India Hackathon (SIH) 2026**.

We acknowledge the open-source technologies that support this project:

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [Ollama](https://ollama.com/)
- [PyMuPDF](https://pymupdf.readthedocs.io/)

---

<p align="center">
  <strong>SwasthyaVault — Making Healthcare Records More Accessible, Organized, and Patient-Centric.</strong>
</p>