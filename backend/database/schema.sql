-- ==========================
-- SWASTHYAVAULT DATABASE
-- PostgreSQL Schema
-- ==========================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('patient','doctor')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    abha_id VARCHAR(20) UNIQUE,
    dob DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    phone VARCHAR(15),
    address TEXT
);

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(80),
    hospital VARCHAR(120),
    registration_no VARCHAR(50)
);

CREATE TABLE consultations (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    doctor_id INT REFERENCES doctors(id),
    chief_complaint TEXT,
    history_present_illness TEXT,
    ayush_notes TEXT,
    diagnosis TEXT,
    consultation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_url TEXT,
    document_type VARCHAR(50),
    ocr_status BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE timeline (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    event_type VARCHAR(50),
    title VARCHAR(150),
    reference_id INT,
    event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consent (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    doctor_id INT REFERENCES doctors(id),
    permission VARCHAR(30),
    expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);