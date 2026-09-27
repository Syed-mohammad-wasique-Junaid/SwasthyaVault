"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Activity, 
  Calendar, 
  Sparkles, 
  AlertTriangle,
  Phone, 
  MapPin, 
  Droplet, 
  CheckCircle2, 
  X,
  ClipboardList,
  Pill,
  Stethoscope,
  RefreshCw,
  Clock,
  BrainCircuit,
  FileCheck2,
  FileWarning,
  Layers,
  Plus,
  UploadCloud,
  Download,
  ExternalLink,
  Eye,
  Copy,
  Check,
  Building2,
  FileCheck,
  AlertCircle,
  FileUp,
  Maximize2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface PatientProfile {
  id: number;
  name: string;
  email: string;
  age: number | string;
  dob?: string;
  gender: string;
  blood_group: string;
  height?: string;
  weight?: string;
  ayush_status?: string;
  abha_id?: string;
  phone?: string;
  address?: string;
  status: string;
}

interface DocumentItem {
  id: number;
  user_id: number;
  title: string;
  document_type: string;
  file_path: string;
  ocr_status: boolean;
  ocr_text?: string;
  ai_summary?: string;
  uploaded_at?: string;
  created_at?: string;
}

interface TimelineItem {
  id: number;
  user_id: number;
  visit_date: string;
  diagnosis: string;
  doctor: string;
  document_title: string;
  created_at?: string;
}

interface AIReportAnalysis {
  document: string;
  document_type?: string;
  uploaded_at?: string;
  file_path?: string;
  ocr_text: string;
  summary: {
    document_type?: string;
    patient_name?: string;
    diagnosis?: string;
    doctor?: string;
    visit_date?: string;
    main_findings?: string;
    measurements?: string[] | string;
    medicines?: string[] | string;
    follow_up?: string;
    summary?: string;
    disclaimer?: string;
  };
  timeline_id?: number;
}

interface PatientHealthBrief {
  overall_summary: string;
  key_conditions: string[];
  important_findings: string[];
  vital_signs_and_measurements: string[];
  medications: string[];
  clinical_history: string[];
  recent_developments: string[];
  follow_up_items: string[];
  record_gaps_or_conflicts: string[];
  source_documents: string[];
  total_records_analyzed: number;
  disclaimer: string;
}

function cleanOverallSummary(summary: any): string {
  if (!summary) return "No clinical summary available for this patient.";
  if (typeof summary !== "string") {
    if (typeof summary === "object" && summary !== null) {
      return summary.overall_summary || summary.summary || "Clinical assessment recorded.";
    }
    return String(summary);
  }
  const trimmed = summary.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("```")) {
    try {
      const cleanStr = trimmed.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanStr);
      if (parsed && typeof parsed.overall_summary === "string") {
        return parsed.overall_summary;
      }
      if (parsed && typeof parsed.summary === "string") {
        return parsed.summary;
      }
    } catch {
      const match = trimmed.match(/"overall_summary"\s*:\s*"([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  return trimmed;
}

function normalizeBrief(raw: any): PatientHealthBrief | null {
  if (!raw) return null;

  let briefData = raw;
  if (typeof raw === "string") {
    try {
      briefData = JSON.parse(raw);
    } catch {
      return {
        overall_summary: cleanOverallSummary(raw),
        key_conditions: [],
        important_findings: [],
        vital_signs_and_measurements: [],
        medications: [],
        clinical_history: [],
        recent_developments: [],
        follow_up_items: [],
        record_gaps_or_conflicts: [],
        source_documents: [],
        total_records_analyzed: 0,
        disclaimer: "AI-generated longitudinal clinical summary based on available authorized medical records."
      };
    }
  }

  const cleanList = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.map((item) => {
        if (typeof item === "string") return item.trim();
        if (typeof item === "object" && item !== null) {
          return item.value || item.measurement || item.name || item.text || item.condition || JSON.stringify(item);
        }
        return String(item).trim();
      }).filter(Boolean);
    }
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          return cleanList(parsed);
        } catch {
          return [trimmed];
        }
      }
      return [trimmed];
    }
    return [];
  };

  return {
    overall_summary: cleanOverallSummary(briefData.overall_summary || briefData.summary),
    key_conditions: cleanList(briefData.key_conditions),
    important_findings: cleanList(briefData.important_findings),
    vital_signs_and_measurements: cleanList(briefData.vital_signs_and_measurements || briefData.vitals_and_measurements || briefData.measurements),
    medications: cleanList(briefData.medications || briefData.medicines),
    clinical_history: cleanList(briefData.clinical_history || briefData.longitudinal_history),
    recent_developments: cleanList(briefData.recent_developments),
    follow_up_items: cleanList(briefData.follow_up_items || briefData.follow_up_recommendations || briefData.follow_up),
    record_gaps_or_conflicts: cleanList(briefData.record_gaps_or_conflicts),
    source_documents: cleanList(briefData.source_documents),
    total_records_analyzed: typeof briefData.total_records_analyzed === "number" ? briefData.total_records_analyzed : cleanList(briefData.source_documents).length,
    disclaimer: typeof briefData.disclaimer === "string" ? briefData.disclaimer : "AI-generated longitudinal clinical summary based on available authorized medical records. Verify information against primary source documents."
  };
}

const DOCUMENT_TYPE_OPTIONS = [
  "Blood Test",
  "Prescription",
  "Radiology / Imaging",
  "Discharge Summary",
  "Diagnostic Lab Report",
  "Clinical Notes",
  "Cardiology / ECG",
  "Vaccination Record",
  "AYUSH Consultation",
  "Other"
];

export default function DoctorPatientDetailPage() {
  const params = useParams();
  const patientId = params?.id as string;

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isAccessRevoked, setIsAccessRevoked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "documents">("overview");

  // Patient-Level AI Health Brief State
  const [healthBrief, setHealthBrief] = useState<PatientHealthBrief | null>(null);
  const [briefUpdatedAt, setBriefUpdatedAt] = useState<string | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);

  // Success Notification Banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Add Clinical Record Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addDocType, setAddDocType] = useState("Blood Test");
  const [addCustomDocType, setAddCustomDocType] = useState("");
  const [addDocTitle, setAddDocTitle] = useState("");
  const [addHospital, setAddHospital] = useState("");
  const [addDoctorName, setAddDoctorName] = useState("");
  const [addRecordDate, setAddRecordDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [addDepartment, setAddDepartment] = useState("");
  const [addClinicalNotes, setAddClinicalNotes] = useState("");
  const [addSelectedFile, setAddSelectedFile] = useState<File | null>(null);
  const [addIsDragging, setAddIsDragging] = useState(false);
  const [addUploadState, setAddUploadState] = useState<"IDLE" | "UPLOADING" | "EXTRACTING" | "SUMMARIZING" | "SUCCESS" | "ERROR">("IDLE");
  const [addUploadMessage, setAddUploadMessage] = useState<string | null>(null);
  const [addUploadError, setAddUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Full Document Viewer Modal State
  const [viewerDoc, setViewerDoc] = useState<DocumentItem | null>(null);
  const [viewerBlobUrl, setViewerBlobUrl] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [viewerActiveSection, setViewerActiveSection] = useState<"summary" | "preview" | "ocr">("summary");
  const [viewerAnalysis, setViewerAnalysis] = useState<AIReportAnalysis | null>(null);
  const [viewerAnalyzing, setViewerAnalyzing] = useState(false);
  const [viewerAnalysisError, setViewerAnalysisError] = useState<string | null>(null);
  const [viewerCopiedOcr, setViewerCopiedOcr] = useState(false);

  // Inline Quick Analyze State for Card Action
  const [analyzingDocId, setAnalyzingDocId] = useState<number | null>(null);
  const [cardActionError, setCardActionError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (viewerBlobUrl) {
        URL.revokeObjectURL(viewerBlobUrl);
      }
    };
  }, [viewerBlobUrl]);

  // Keyboard Escape listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewerDoc) {
          closeViewer();
        } else if (isAddModalOpen && addUploadState !== "UPLOADING" && addUploadState !== "EXTRACTING" && addUploadState !== "SUMMARIZING") {
          setIsAddModalOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewerDoc, isAddModalOpen, addUploadState, viewerBlobUrl]);

  // 1. Fetch Patient Core Clinical Record
  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setIsAccessRevoked(false);
      setErrorMessage(null);

      // Fetch Patient Profile
      const patientRes = await api.get(`/doctor/patient/${patientId}`);
      setPatient(patientRes.data);

      // Fetch Patient Documents (Scoped strictly to this patient ID)
      try {
        const docsRes = await api.get(`/documents/?patient_id=${patientId}`);
        setDocuments(docsRes.data || []);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setIsAccessRevoked(true);
          return;
        }
      }

      // Fetch Patient Timeline (Scoped strictly to this patient ID)
      try {
        const timelineRes = await api.get(`/timeline/?patient_id=${patientId}`);
        setTimeline(timelineRes.data || []);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setIsAccessRevoked(true);
          return;
        }
      }

    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsAccessRevoked(true);
      } else if (err.response?.status === 404) {
        setErrorMessage("Patient record not found.");
      } else {
        setErrorMessage(err.response?.data?.detail || "Failed to load patient medical records.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch or Generate Longitudinal Patient-Level AI Health Brief
  const fetchPatientHealthBrief = async (forceRefresh: boolean = false) => {
    try {
      setLoadingBrief(true);
      setBriefError(null);
      const url = `/ai/patient-summary?patient_id=${patientId}${forceRefresh ? "&force_refresh=true" : ""}`;
      const res = await api.get(url);
      if (res.data?.brief) {
        setHealthBrief(normalizeBrief(res.data.brief));
        setBriefUpdatedAt(res.data.updated_at || null);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsAccessRevoked(true);
      } else if (err.response?.status === 503) {
        setBriefError("AI clinical summarization service (Ollama) is currently unreachable. Please ensure the local LLM server is active.");
      } else {
        setBriefError(err.response?.data?.detail || "Unable to generate longitudinal AI health brief at this time.");
      }
    } finally {
      setLoadingBrief(false);
    }
  };

  useEffect(() => {
    // Reset previous patient state on patient ID change to guarantee strict data isolation
    setPatient(null);
    setDocuments([]);
    setTimeline([]);
    setHealthBrief(null);
    setBriefUpdatedAt(null);
    setErrorMessage(null);
    setIsAccessRevoked(false);

    fetchPatientData();
    fetchPatientHealthBrief(false);
  }, [patientId]);

  // ==========================================
  // ADD RECORD HANDLERS
  // ==========================================
  const validateAddFile = (file: File): string | null => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      return "Unsupported file type. Allowed formats: PDF, JPG, PNG.";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File is too large (maximum 10MB allowed).";
    }
    return null;
  };

  const handleAddFileSelect = (file: File) => {
    setAddUploadError(null);
    const err = validateAddFile(file);
    if (err) {
      setAddUploadError(err);
      return;
    }
    setAddSelectedFile(file);
    if (!addDocTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setAddDocTitle(cleanName);
    }
  };

  const resetAddForm = () => {
    setAddSelectedFile(null);
    setAddDocTitle("");
    setAddDocType("Blood Test");
    setAddCustomDocType("");
    setAddHospital("");
    setAddDoctorName("");
    setAddRecordDate(new Date().toISOString().split("T")[0]);
    setAddDepartment("");
    setAddClinicalNotes("");
    setAddUploadState("IDLE");
    setAddUploadMessage(null);
    setAddUploadError(null);
  };

  const openAddModal = () => {
    resetAddForm();
    setIsAddModalOpen(true);
  };

  const handleAddRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSelectedFile) {
      setAddUploadError("Please upload a clinical document file (PDF, JPG, or PNG).");
      return;
    }

    let finalDocType = addDocType;
    if (addDocType === "Other") {
      if (!addCustomDocType.trim()) {
        setAddUploadError("Please specify the document type.");
        return;
      }
      finalDocType = addCustomDocType.trim();
    }

    const finalTitle = addDocTitle.trim() || addSelectedFile.name;

    try {
      setAddUploadState("UPLOADING");
      setAddUploadError(null);
      setAddUploadMessage("Uploading clinical document to secure patient vault...");

      const formData = new FormData();
      formData.append("title", finalTitle);
      formData.append("document_type", finalDocType);
      formData.append("file", addSelectedFile);
      formData.append("patient_id", patientId);

      // 1. Upload file via authenticated Axios client
      const uploadRes = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newDocId = uploadRes.data.document_id;

      // 2. OCR text extraction & 3. AI analysis via existing pipeline
      setAddUploadState("EXTRACTING");
      setAddUploadMessage("Document stored. Performing Tesseract OCR extraction...");

      try {
        setAddUploadState("SUMMARIZING");
        setAddUploadMessage("Analyzing clinical document with Ollama Llama 3.2...");
        await api.get(`/ai/analyze?document_id=${newDocId}`);
      } catch (aiErr: any) {
        console.warn("Note on AI analysis during upload:", aiErr?.response?.data?.detail || aiErr?.message);
        // Document is safely saved in PostgreSQL; analysis can be re-run
      }

      setAddUploadState("SUCCESS");
      setAddUploadMessage("Clinical record added successfully.");

      // Refresh documents and medical timeline without page reload
      await Promise.all([
        fetchPatientData(),
        fetchPatientHealthBrief(false)
      ]);

      setSuccessBanner(`Clinical record "${finalTitle}" added successfully.`);
      setTimeout(() => setSuccessBanner(null), 5000);

      setTimeout(() => {
        setIsAddModalOpen(false);
        resetAddForm();
      }, 1000);

    } catch (err: any) {
      setAddUploadState("ERROR");
      if (err.response?.status === 401) {
        setAddUploadError("Your doctor session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setAddUploadError("Clinical consent is required to add records for this patient.");
      } else if (err.response?.status === 404) {
        setAddUploadError("Patient or clinical record not found.");
      } else if (err.response?.status === 413) {
        setAddUploadError("File is too large (maximum 10MB allowed).");
      } else if (err.response?.status === 422) {
        setAddUploadError("Please check the record details and try again.");
      } else if (err.response?.status === 503) {
        setAddUploadError("Document uploaded, but AI analysis is currently unavailable (Ollama unreachable).");
      } else {
        setAddUploadError(err.response?.data?.detail || "Unable to upload clinical record. Please verify your connection.");
      }
    }
  };

  // ==========================================
  // FULL DOCUMENT VIEWER HANDLERS
  // ==========================================
  const handleOpenDocumentViewer = async (doc: DocumentItem) => {
    setViewerDoc(doc);
    setViewerActiveSection("summary");
    setViewerLoading(true);
    setViewerError(null);
    setViewerAnalysis(null);
    setViewerAnalysisError(null);
    setViewerCopiedOcr(false);

    if (viewerBlobUrl) {
      URL.revokeObjectURL(viewerBlobUrl);
      setViewerBlobUrl(null);
    }

    // 1. Fetch the physical document blob
    try {
      const res = await api.get(`/documents/${doc.id}/file`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      setViewerBlobUrl(url);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setViewerError("Your doctor session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setViewerError("You do not have clinical access to view this document.");
      } else if (err.response?.status === 404) {
        setViewerError("Document file was not found on the server.");
      } else {
        setViewerError("Unable to load the original report file. Please try again.");
      }
    } finally {
      setViewerLoading(false);
    }

    // 2. Fetch or load cached AI summary & OCR text
    try {
      setViewerAnalyzing(true);
      const aiRes = await api.get(`/ai/analyze?document_id=${doc.id}`);
      setViewerAnalysis(aiRes.data);
    } catch (aiErr: any) {
      if (aiErr.response?.status === 503) {
        setViewerAnalysisError("Document uploaded and OCR completed, but AI analysis is currently unavailable.");
      } else {
        setViewerAnalysisError(aiErr.response?.data?.detail || "AI analysis not available for this record yet.");
      }
    } finally {
      setViewerAnalyzing(false);
    }
  };

  const closeViewer = () => {
    if (viewerBlobUrl) {
      URL.revokeObjectURL(viewerBlobUrl);
      setViewerBlobUrl(null);
    }
    setViewerDoc(null);
    setViewerError(null);
    setViewerAnalysis(null);
    setViewerAnalysisError(null);
  };

  const handleReanalyzeInViewer = async () => {
    if (!viewerDoc) return;
    try {
      setViewerAnalyzing(true);
      setViewerAnalysisError(null);
      const aiRes = await api.get(`/ai/analyze?document_id=${viewerDoc.id}`);
      setViewerAnalysis(aiRes.data);
      // Refresh documents list to sync cached summary in parent
      await fetchPatientData();
    } catch (err: any) {
      if (err.response?.status === 503) {
        setViewerAnalysisError("AI analysis is currently unavailable (Ollama unreachable).");
      } else {
        setViewerAnalysisError(err.response?.data?.detail || "Failed to re-analyze document.");
      }
    } finally {
      setViewerAnalyzing(false);
    }
  };

  const handleCopyOcrText = () => {
    const textToCopy = viewerAnalysis?.ocr_text || viewerDoc?.ocr_text || "";
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setViewerCopiedOcr(true);
    setTimeout(() => setViewerCopiedOcr(false), 2500);
  };

  // Quick Analyze from Card
  const handleQuickAnalyzeCard = async (doc: DocumentItem) => {
    try {
      setAnalyzingDocId(doc.id);
      setCardActionError(null);
      await api.get(`/ai/analyze?document_id=${doc.id}`);
      await fetchPatientData();
      handleOpenDocumentViewer(doc);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsAccessRevoked(true);
      } else if (err.response?.status === 503) {
        setCardActionError("Document uploaded and OCR completed, but AI analysis is currently unavailable.");
      } else {
        setCardActionError(err.response?.data?.detail || "Unable to extract summary for this medical report.");
      }
    } finally {
      setAnalyzingDocId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="w-10 h-10 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-emerald-200/60 text-sm font-medium">Verifying consent & retrieving clinical locker...</p>
      </div>
    );
  }

  if (isAccessRevoked) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12">
        <div className="glass-card p-10 rounded-3xl border border-red-500/30 text-center flex flex-col items-center justify-center bg-red-950/20 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/30">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-3 font-heading">
            Access to this patient&apos;s records has been revoked.
          </h3>
          <p className="text-red-200/70 text-sm leading-relaxed max-w-md mb-8">
            The patient has withdrawn clinical consent or the authorization period has expired. In compliance with SwasthyaVault security policies, access to clinical documents and history has been restricted.
          </p>
          <Link href="/doctor/dashboard">
            <Button variant="outline" className="border-red-500/30 text-red-200 hover:bg-red-500/10 rounded-full px-6 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (errorMessage || !patient) {
    return (
      <div className="glass-card p-10 rounded-3xl border border-red-500/20 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">{errorMessage || "Patient Not Found"}</h3>
        <Link href="/doctor/dashboard">
          <Button variant="outline" className="mt-4 rounded-full">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link 
          href="/doctor/dashboard" 
          className="inline-flex items-center gap-2 text-emerald-200/70 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Active Clinical Consent Verified
          </span>
        </div>
      </div>

      {/* Global Success Notification Banner */}
      {successBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 text-xs flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium text-white">{successBanner}</span>
          </div>
          <Button onClick={() => setSuccessBanner(null)} variant="outline" className="h-7 text-xs rounded-lg border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/15">
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Patient Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/20 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading flex items-center gap-3">
                {patient.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-emerald-200/70 mt-1">
                <span>{patient.age && patient.age !== "Unknown" && patient.age !== 0 ? `${patient.age} Yrs` : "Age N/A"}</span>
                <span>•</span>
                <span>{patient.gender || "Gender N/A"}</span>
                <span>•</span>
                <span>ABHA: <strong className="text-emerald-100">{patient.abha_id || "N/A"}</strong></span>
                <span>•</span>
                <span>DOB: {patient.dob || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            <div className="p-3 bg-[#031511]/80 rounded-xl border border-emerald-500/10 text-center">
              <p className="text-[10px] text-emerald-200/60 uppercase font-bold">Blood Group</p>
              <p className="text-base font-bold text-white mt-0.5 flex items-center justify-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-red-400" /> {patient.blood_group || "N/A"}
              </p>
            </div>
            <div className="p-3 bg-[#031511]/80 rounded-xl border border-emerald-500/10 text-center">
              <p className="text-[10px] text-emerald-200/60 uppercase font-bold">Height</p>
              <p className="text-base font-bold text-white mt-0.5">{patient.height ? `${patient.height} cm` : "N/A"}</p>
            </div>
            <div className="p-3 bg-[#031511]/80 rounded-xl border border-emerald-500/10 text-center">
              <p className="text-[10px] text-emerald-200/60 uppercase font-bold">Weight</p>
              <p className="text-base font-bold text-white mt-0.5">{patient.weight ? `${patient.weight} kg` : "N/A"}</p>
            </div>
            <div className="p-3 bg-[#031511]/80 rounded-xl border border-emerald-500/10 text-center">
              <p className="text-[10px] text-emerald-200/60 uppercase font-bold">AYUSH Pref</p>
              <p className="text-xs font-bold text-emerald-300 mt-1 truncate" title={patient.ayush_status || "Standard"}>
                {patient.ayush_status || "None"}
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Address Bar */}
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-emerald-500/10 text-xs text-emerald-200/80">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{patient.phone || "No phone registered"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{patient.address || "No address on file"}</span>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-emerald-500/20 gap-8">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === "overview" ? "text-emerald-400" : "text-emerald-200/60 hover:text-white"
          }`}
        >
          Clinical Overview
          {activeTab === "overview" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === "timeline" ? "text-emerald-400" : "text-emerald-200/60 hover:text-white"
          }`}
        >
          Medical Timeline
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">{timeline.length}</span>
          {activeTab === "timeline" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === "documents" ? "text-emerald-400" : "text-emerald-200/60 hover:text-white"
          }`}
        >
          Clinical Documents & Reports
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">{documents.length}</span>
          {activeTab === "documents" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
        </button>
      </div>

      {/* Card Action Error Alert */}
      {cardActionError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>{cardActionError}</span>
          </div>
          <Button onClick={() => setCardActionError(null)} variant="outline" className="h-7 text-xs rounded-lg border-amber-500/30 text-amber-200">
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* Tab 1: Clinical Overview (Patient-Level Longitudinal Brief) */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          
          {/* 1. LARGE PATIENT-LEVEL AI HEALTH BRIEF (Primary Clinical Workspace Card) */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-[#06241e]/95 via-[#041a15]/95 to-[#02100d]/95 shadow-2xl relative overflow-hidden space-y-6">
            <BrainCircuit className="absolute -top-12 -right-12 w-64 h-64 text-emerald-500/5 pointer-events-none" />

            {/* Brief Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight flex items-center gap-3">
                    AI Health Brief
                  </h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30 uppercase tracking-wider">
                    Ollama Llama 3.2
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-200/70">
                  Longitudinal clinical summary based on the patient&apos;s available medical records.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {briefUpdatedAt && (
                  <span className="text-[11px] text-emerald-200/60 font-mono hidden md:inline">
                    Updated: {new Date(briefUpdatedAt).toLocaleDateString()}
                  </span>
                )}
                <Button
                  onClick={() => fetchPatientHealthBrief(true)}
                  disabled={loadingBrief}
                  variant="outline"
                  className="rounded-full text-xs px-4 h-8 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBrief ? "animate-spin text-emerald-400" : ""}`} />
                  <span>{loadingBrief ? "Synthesizing..." : "Refresh Brief"}</span>
                </Button>
              </div>
            </div>

            {/* Brief Body Content */}
            {loadingBrief && !healthBrief ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-emerald-400 animate-pulse mx-auto" />
                <p className="text-sm font-semibold text-white">Synthesizing longitudinal records with Llama 3.2...</p>
                <p className="text-xs text-emerald-200/60 max-w-md mx-auto">
                  Analyzing all shared clinical reports, OCR texts, diagnostic tests, and encounter history.
                </p>
              </div>
            ) : briefError ? (
              <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>{briefError}</span>
                </div>
                <Button onClick={() => fetchPatientHealthBrief(true)} variant="outline" className="h-8 text-xs rounded-full border-amber-500/40 text-amber-200">
                  Retry Synthesis
                </Button>
              </div>
            ) : healthBrief ? (
              <div className="space-y-6">
                
                {/* 1. Overall Clinical Synthesis */}
                <div className="p-5 sm:p-6 bg-[#031511]/90 rounded-2xl border border-emerald-500/30 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-400" /> Overall Clinical Summary
                  </h4>
                  <p className="text-sm sm:text-base text-white/95 leading-relaxed font-normal">
                    {cleanOverallSummary(healthBrief.overall_summary)}
                  </p>
                </div>

                {/* 2. Structured 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Key Conditions */}
                  <div className="p-5 bg-[#031511]/80 rounded-2xl border border-emerald-500/20 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" /> Key Conditions & Diagnoses
                    </h5>
                    {healthBrief.key_conditions && healthBrief.key_conditions.length > 0 ? (
                      <ul className="space-y-2">
                        {healthBrief.key_conditions.map((item, idx) => (
                          <li key={idx} className="text-xs text-white flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-200/60">No specific chronic or acute conditions stated.</p>
                    )}
                  </div>

                  {/* Important Findings */}
                  <div className="p-5 bg-[#031511]/80 rounded-2xl border border-emerald-500/20 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" /> Important Findings
                    </h5>
                    {healthBrief.important_findings && healthBrief.important_findings.length > 0 ? (
                      <ul className="space-y-2">
                        {healthBrief.important_findings.map((item, idx) => (
                          <li key={idx} className="text-xs text-white flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-200/60">No significant diagnostic anomalies reported.</p>
                    )}
                  </div>

                  {/* Medications */}
                  <div className="p-5 bg-[#031511]/80 rounded-2xl border border-emerald-500/20 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-400" /> Prescribed Medications
                    </h5>
                    {healthBrief.medications && healthBrief.medications.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {healthBrief.medications.map((item, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-200/60">No medication information was identified in the available authorized records.</p>
                    )}
                  </div>
                </div>

                {/* 3. 2-Column Grid: Measurements & Clinical History */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vital Signs & Measurements */}
                  <div className="p-5 bg-[#031511]/80 rounded-2xl border border-emerald-500/20 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-emerald-400" /> Vital Signs & Measurements
                    </h5>
                    {healthBrief.vital_signs_and_measurements && healthBrief.vital_signs_and_measurements.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {healthBrief.vital_signs_and_measurements.map((item, idx) => (
                          <div key={idx} className="text-xs p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/15 text-emerald-200 font-medium">
                            {item}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-200/60">No specific measurement values recorded.</p>
                    )}
                  </div>

                  {/* Clinical History */}
                  <div className="p-5 bg-[#031511]/80 rounded-2xl border border-emerald-500/20 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" /> Longitudinal Clinical History
                    </h5>
                    {healthBrief.clinical_history && healthBrief.clinical_history.length > 0 ? (
                      <ul className="space-y-2">
                        {healthBrief.clinical_history.map((item, idx) => (
                          <li key={idx} className="text-xs text-white flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-200/60">No prior longitudinal history documented.</p>
                    )}
                  </div>
                </div>

                {/* 4. Recent Developments & Follow-ups */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recent Developments */}
                  <div className="p-5 bg-[#031511]/80 rounded-2xl border border-emerald-500/20 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Recent Developments & Changes
                    </h5>
                    {healthBrief.recent_developments && healthBrief.recent_developments.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-white">
                        {healthBrief.recent_developments.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-200/60">No acute recent changes flagged.</p>
                    )}
                  </div>

                  {/* Follow-up Items */}
                  <div className="p-5 bg-[#031511]/80 rounded-2xl border border-emerald-500/20 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Follow-up & Recommended Next Steps
                    </h5>
                    {healthBrief.follow_up_items && healthBrief.follow_up_items.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-white">
                        {healthBrief.follow_up_items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-200/60">No specific follow-up items scheduled.</p>
                    )}
                  </div>
                </div>

                {/* 5. Record Gaps or Conflicts (if any) */}
                {healthBrief.record_gaps_or_conflicts && healthBrief.record_gaps_or_conflicts.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold uppercase text-[11px] text-amber-300">
                      <FileWarning className="w-4 h-4 text-amber-400" /> Record Discrepancies & Noted Gaps
                    </div>
                    <ul className="space-y-1 pl-6 list-disc">
                      {healthBrief.record_gaps_or_conflicts.map((gap, idx) => (
                        <li key={idx}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Analyzed Source Documents Section */}
                <div className="p-4 bg-[#02100d]/80 rounded-2xl border border-emerald-500/15 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-emerald-200">
                      Based on {healthBrief.total_records_analyzed || documents.length} authorized clinical records:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-w-xl">
                    {healthBrief.source_documents && healthBrief.source_documents.length > 0 ? (
                      healthBrief.source_documents.map((src, idx) => (
                        <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 truncate max-w-[200px]">
                          {src}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-emerald-200/50">Primary Vault Locker</span>
                    )}
                  </div>
                </div>

                {/* 7. Assistive Clinical Disclaimer */}
                <div className="p-3.5 bg-emerald-950/60 border border-emerald-400/30 rounded-2xl text-[11px] text-emerald-200/80 leading-relaxed flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>AI Clinical Synthesis:</strong> {healthBrief.disclaimer || "AI-generated longitudinal clinical summary based on available authorized medical records. Verify information against primary source documents."}
                  </span>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <BrainCircuit className="w-10 h-10 text-emerald-400/40 mx-auto" />
                <h4 className="text-base font-bold text-white">No Health Brief Generated Yet</h4>
                <p className="text-xs text-emerald-200/60 max-w-md mx-auto">
                  Click below to synthesize all {documents.length} shared records into a longitudinal clinical brief.
                </p>
                <Button
                  onClick={() => fetchPatientHealthBrief(true)}
                  disabled={loadingBrief}
                  variant="primary"
                  className="rounded-full text-xs px-6 mt-2 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Generate AI Health Brief
                </Button>
              </div>
            )}
          </div>

          {/* 2. LONGITUDINAL MEDICAL TIMELINE (Chronological Context Preview) */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" /> Longitudinal Timeline
                </h3>
                <p className="text-xs text-emerald-200/60 mt-0.5">Chronological record of clinical encounters and diagnoses</p>
              </div>
              <button onClick={() => setActiveTab("timeline")} className="text-xs text-emerald-400 hover:underline">
                View Full Timeline ({timeline.length})
              </button>
            </div>

            {timeline.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#031511]/40 border border-dashed border-emerald-500/20 text-center">
                <p className="text-xs text-emerald-200/50">No longitudinal encounters recorded for this patient yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timeline.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-4 bg-[#031511]/70 rounded-2xl border border-emerald-500/10 flex items-start justify-between">
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate" title={item.diagnosis}>{item.diagnosis || "Medical Encounter"}</p>
                      <p className="text-xs text-emerald-200/60 mt-0.5">Physician: {item.doctor || "Clinical Care Provider"}</p>
                      {item.document_title && (
                        <span className="inline-block mt-2 text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-full">
                          Ref: {item.document_title}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-emerald-200/50 flex items-center gap-1 font-mono whitespace-nowrap ml-3">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {item.visit_date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* Tab 2: Full Medical Timeline                              */}
      {/* ========================================================= */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          {timeline.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-emerald-500/20 text-center">
              <Activity className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-white mb-1">No Timeline Events</h4>
              <p className="text-xs text-emerald-200/60">No longitudinal encounters recorded for this patient.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-emerald-500/20 ml-4 space-y-6 pb-6">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-6"
                >
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-400 border-4 border-[#031511]" />
                  <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className="text-base font-bold text-white">{item.diagnosis || "Medical Consultation"}</h4>
                      <span className="text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {item.visit_date}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/70">Consulting Physician: <strong className="text-emerald-100">{item.doctor || "Clinical Care Provider"}</strong></p>
                    {item.document_title && (
                      <p className="text-[11px] text-emerald-400 mt-2 font-mono">Associated Document: {item.document_title}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* Tab 3: Clinical Documents & Reports Workspace             */}
      {/* ========================================================= */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Section Heading with Prominent "+ Add Clinical Record" Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-[#031a14]/90 to-[#02100d]/90">
            <div>
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold text-white font-heading">Clinical Documents & Records</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {documents.length} {documents.length === 1 ? "Record" : "Records"}
                </span>
              </div>
              <p className="text-xs text-emerald-200/60 mt-1">
                Authorized clinical documents, laboratory tests, imaging reports, and prescriptions for this patient.
              </p>
            </div>
            
            <Button
              onClick={openAddModal}
              variant="primary"
              className="rounded-full text-xs font-semibold px-5 h-10 shadow-lg shadow-emerald-950/50 flex items-center gap-2 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Clinical Record</span>
            </Button>
          </div>

          {/* Document Cards Grid */}
          {documents.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-emerald-500/20 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">No Clinical Records Found</h4>
                <p className="text-xs text-emerald-200/60 max-w-md mx-auto mt-1">
                  There are no clinical documents uploaded for this patient yet. Use the action below to add a new clinical record.
                </p>
              </div>
              <Button
                onClick={openAddModal}
                variant="primary"
                className="rounded-full text-xs px-6 h-9 mt-2"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Clinical Record
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => {
                const parsedSummary = doc.ai_summary ? (() => {
                  try { return JSON.parse(doc.ai_summary); } catch { return null; }
                })() : null;

                const doctorName = parsedSummary?.doctor || "Clinical Care Provider";
                const encounterDate = parsedSummary?.visit_date || (doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "Recent");
                const isPdf = doc.file_path?.toLowerCase().endsWith(".pdf");

                return (
                  <div 
                    key={doc.id} 
                    className="glass-card p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-emerald-950/40 group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 truncate">
                          {doc.document_type || "Clinical Report"}
                        </span>
                        
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {doc.ocr_status ? (
                            <span className="text-[10px] text-emerald-300 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OCR Indexed
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-200/50 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                              <Clock className="w-3 h-3 text-emerald-200/40" /> OCR Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & File Name */}
                      <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1" title={doc.title}>
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-emerald-200/50 font-mono mt-1 truncate" title={doc.file_path}>
                        {isPdf ? "PDF Document" : "Image Document"} • {doc.file_path ? doc.file_path.split("/").pop()?.split("\\").pop() : "Locker File"}
                      </p>

                      {/* Metadata Row */}
                      <div className="mt-4 pt-3 border-t border-emerald-500/10 space-y-1.5 text-xs text-emerald-200/70">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase text-emerald-200/50 font-semibold">Clinician:</span>
                          <span className="font-medium text-white truncate max-w-[170px]" title={doctorName}>{doctorName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase text-emerald-200/50 font-semibold">Record Date:</span>
                          <span className="font-mono text-emerald-300 text-[11px]">{encounterDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase text-emerald-200/50 font-semibold">AI Analysis:</span>
                          {doc.ai_summary ? (
                            <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-400" /> Synthesized
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-300/80 font-medium">Ready to Analyze</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-emerald-500/10 flex items-center gap-2">
                      <Button
                        onClick={() => handleOpenDocumentViewer(doc)}
                        variant="primary"
                        className="flex-1 text-xs rounded-xl h-9 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </Button>
                      
                      {!doc.ai_summary && (
                        <Button
                          onClick={() => handleQuickAnalyzeCard(doc)}
                          disabled={analyzingDocId === doc.id}
                          variant="outline"
                          className="text-xs rounded-xl h-9 px-3 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5"
                          title="Run AI document analysis"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${analyzingDocId === doc.id ? "animate-spin text-emerald-400" : ""}`} />
                          <span className="hidden sm:inline">{analyzingDocId === doc.id ? "Analyzing..." : "Analyze"}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD CLINICAL RECORD MODAL                                 */}
      {/* ========================================================= */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (addUploadState !== "UPLOADING" && addUploadState !== "EXTRACTING" && addUploadState !== "SUMMARIZING") {
                    setIsAddModalOpen(false);
                  }
                }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
                aria-hidden="true"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-record-title"
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 glass-dark border border-emerald-400/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl text-white my-auto"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-emerald-500/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 id="add-record-title" className="text-xl font-bold font-heading">Add Clinical Record</h3>
                      <p className="text-xs text-emerald-200/60 mt-0.5">
                        Create a verified clinical document for patient: <strong className="text-white">{patient.name}</strong> (ABHA: {patient.abha_id || "N/A"})
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                    className="p-2 hover:bg-emerald-500/20 rounded-xl text-emerald-200/60 hover:text-white transition-colors disabled:opacity-30"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status / Error Banner */}
                {addUploadError && (
                  <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="font-medium">{addUploadError}</span>
                  </div>
                )}

                {/* Active Progress Pipeline Indicator */}
                {(addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING" || addUploadState === "SUCCESS") && (
                  <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 text-xs space-y-2">
                    <div className="flex items-center gap-3">
                      {addUploadState === "SUCCESS" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-white">
                          {addUploadState === "UPLOADING" && "Uploading document to secure locker..."}
                          {addUploadState === "EXTRACTING" && "Extracting clinical text via Tesseract OCR..."}
                          {addUploadState === "SUMMARIZING" && "Synthesizing record with Ollama Llama 3.2..."}
                          {addUploadState === "SUCCESS" && "Clinical record added and processed successfully!"}
                        </p>
                        <p className="text-[11px] text-emerald-200/70 mt-0.5">{addUploadMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Body */}
                <form onSubmit={handleAddRecordSubmit} className="space-y-4">
                  {/* Row 1: Document Type & Custom Type if Other */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                        Record Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={addDocType}
                        onChange={(e) => setAddDocType(e.target.value)}
                        disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                        className="w-full h-10 px-3 rounded-xl bg-[#031511] border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-colors"
                        required
                      >
                        {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#031511] text-white">{opt}</option>
                        ))}
                      </select>
                    </div>

                    {addDocType === "Other" ? (
                      <div>
                        <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                          Specify Type <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. MRI Brain, Echo Report, Biopsy"
                          value={addCustomDocType}
                          onChange={(e) => setAddCustomDocType(e.target.value)}
                          disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                          className="w-full h-10 px-3 rounded-xl bg-[#031511] border border-emerald-500/30 text-white text-xs placeholder:text-emerald-200/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                          Date of Record <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="date"
                          value={addRecordDate}
                          onChange={(e) => setAddRecordDate(e.target.value)}
                          disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                          className="w-full h-10 px-3 rounded-xl bg-[#031511] border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Row 2: Document Title */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                      Record / Document Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Complete Blood Count (CBC), Chest X-Ray PA View"
                      value={addDocTitle}
                      onChange={(e) => setAddDocTitle(e.target.value)}
                      disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                      className="w-full h-10 px-3 rounded-xl bg-[#031511] border border-emerald-500/30 text-white text-xs placeholder:text-emerald-200/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                      required
                    />
                  </div>

                  {/* Row 3: Hospital & Doctor Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                        Hospital / Healthcare Facility <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apollo Hospitals, City Clinic"
                        value={addHospital}
                        onChange={(e) => setAddHospital(e.target.value)}
                        disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                        className="w-full h-10 px-3 rounded-xl bg-[#031511] border border-emerald-500/30 text-white text-xs placeholder:text-emerald-200/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                        Doctor / Clinician Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Rajesh Sharma, MD"
                        value={addDoctorName}
                        onChange={(e) => setAddDoctorName(e.target.value)}
                        disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                        className="w-full h-10 px-3 rounded-xl bg-[#031511] border border-emerald-500/30 text-white text-xs placeholder:text-emerald-200/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 4: Optional Department / Specialty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                        Department / Specialty <span className="text-emerald-200/40 text-[10px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cardiology, Pathology, Orthopedics"
                        value={addDepartment}
                        onChange={(e) => setAddDepartment(e.target.value)}
                        disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                        className="w-full h-10 px-3 rounded-xl bg-[#031511] border border-emerald-500/30 text-white text-xs placeholder:text-emerald-200/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                      />
                    </div>
                    {addDocType === "Other" && (
                      <div>
                        <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                          Date of Record <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="date"
                          value={addRecordDate}
                          onChange={(e) => setAddRecordDate(e.target.value)}
                          disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                          className="w-full h-10 px-3 rounded-xl bg-[#031511] border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Optional Clinical Notes / Observations */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                      Clinical Notes / Observations <span className="text-emerald-200/40 text-[10px]">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter preliminary diagnosis, clinical indications, or reason for testing..."
                      value={addClinicalNotes}
                      onChange={(e) => setAddClinicalNotes(e.target.value)}
                      disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                      className="w-full p-3 rounded-xl bg-[#031511] border border-emerald-500/30 text-white text-xs placeholder:text-emerald-200/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 resize-none"
                    />
                  </div>

                  {/* File Dropzone & Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mb-1.5">
                      Upload Document File <span className="text-red-400">*</span>
                    </label>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleAddFileSelect(e.target.files[0]);
                        }
                      }}
                    />

                    {!addSelectedFile ? (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setAddIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setAddIsDragging(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setAddIsDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            handleAddFileSelect(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                          addIsDragging 
                            ? "border-emerald-400 bg-emerald-500/20" 
                            : "border-emerald-500/30 hover:border-emerald-400/60 bg-[#031511]/70"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-white">
                          Click to select or drag & drop clinical report
                        </p>
                        <p className="text-[11px] text-emerald-200/60">
                          Supports PDF, JPG, PNG up to 10MB
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-[#031511] border border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">{addSelectedFile.name}</p>
                            <p className="text-[11px] text-emerald-200/60 font-mono">
                              {(addSelectedFile.size / 1024 / 1024).toFixed(2)} MB • {addSelectedFile.type || "Document"}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setAddSelectedFile(null)}
                          disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                          variant="outline"
                          className="h-8 text-xs px-3 rounded-lg border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15"
                        >
                          Change File
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="pt-4 border-t border-emerald-500/20 flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      disabled={addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                      variant="outline"
                      className="rounded-full px-5 text-xs border-emerald-500/20 text-emerald-200/80 hover:bg-emerald-500/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!addSelectedFile || addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING"}
                      variant="primary"
                      className="rounded-full px-6 text-xs h-10 shadow-lg shadow-emerald-950/50 flex items-center gap-2"
                    >
                      {(addUploadState === "UPLOADING" || addUploadState === "EXTRACTING" || addUploadState === "SUMMARIZING") ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing Record...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Save & Process Record</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================================= */}
      {/* FULL CLINICAL DOCUMENT VIEWER MODAL                       */}
      {/* ========================================================= */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {viewerDoc && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeViewer}
                className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
                aria-hidden="true"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="doc-viewer-modal-title"
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 glass-dark border border-emerald-400/30 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col p-5 sm:p-7 shadow-2xl text-white overflow-hidden my-auto"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-emerald-500/20 pb-4 mb-4 flex-shrink-0">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 id="doc-viewer-modal-title" className="text-lg sm:text-xl font-bold font-heading truncate max-w-lg">
                          {viewerDoc.title}
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2.5 py-0.5 bg-emerald-500/15 rounded-md border border-emerald-400/20">
                          {viewerDoc.document_type || "Clinical Report"}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200/60 mt-0.5">
                        Patient: <strong className="text-white">{patient.name}</strong> • Document ID #{viewerDoc.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {viewerBlobUrl && (
                      <>
                        <Button
                          onClick={() => window.open(viewerBlobUrl, "_blank")}
                          variant="outline"
                          className="h-8 text-xs rounded-xl border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5"
                          title="Open original file in new window"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">New Tab</span>
                        </Button>
                        <a
                          href={viewerBlobUrl}
                          download={viewerDoc.title || "clinical-report"}
                          className="h-8 px-3 text-xs rounded-xl border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5 transition-colors"
                          title="Download original document"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      </>
                    )}
                    <button
                      onClick={closeViewer}
                      className="p-2 hover:bg-emerald-500/20 rounded-xl text-emerald-200/60 hover:text-white transition-colors"
                      title="Close viewer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Navigation Section Sub-Tabs */}
                <div className="flex border-b border-emerald-500/20 gap-6 mb-4 flex-shrink-0">
                  <button
                    onClick={() => setViewerActiveSection("summary")}
                    className={`pb-2.5 text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
                      viewerActiveSection === "summary" ? "text-emerald-400" : "text-emerald-200/60 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Clinical Summary
                    {viewerActiveSection === "summary" && <motion.div layoutId="viewerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
                  </button>
                  <button
                    onClick={() => setViewerActiveSection("preview")}
                    className={`pb-2.5 text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
                      viewerActiveSection === "preview" ? "text-emerald-400" : "text-emerald-200/60 hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Original Document Preview
                    {viewerActiveSection === "preview" && <motion.div layoutId="viewerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
                  </button>
                  <button
                    onClick={() => setViewerActiveSection("ocr")}
                    className={`pb-2.5 text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
                      viewerActiveSection === "ocr" ? "text-emerald-400" : "text-emerald-200/60 hover:text-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    OCR Extracted Text
                    {viewerActiveSection === "ocr" && <motion.div layoutId="viewerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
                  </button>
                </div>

                {/* Modal Body Container */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                  
                  {/* 1. DOCUMENT METADATA INFO BAR */}
                  <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-emerald-200/50 text-[10px] uppercase font-semibold">Document Title</p>
                      <p className="text-white font-medium mt-0.5 break-words">{viewerDoc.title}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200/50 text-[10px] uppercase font-semibold">Record Type</p>
                      <p className="text-emerald-300 font-medium mt-0.5">{viewerDoc.document_type || "Report"}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200/50 text-[10px] uppercase font-semibold">Encounter Date</p>
                      <p className="text-white font-medium mt-0.5">
                        {viewerAnalysis?.summary?.visit_date || (viewerDoc.uploaded_at ? new Date(viewerDoc.uploaded_at).toLocaleDateString() : "N/A")}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-200/50 text-[10px] uppercase font-semibold">Physician / Facility</p>
                      <p className="text-emerald-100 font-medium mt-0.5 truncate" title={viewerAnalysis?.summary?.doctor || "Clinical Care Provider"}>
                        {viewerAnalysis?.summary?.doctor || "Clinical Care Provider"}
                      </p>
                    </div>
                  </div>

                  {/* Section View 1: AI Clinical Summary */}
                  {viewerActiveSection === "summary" && (
                    <div className="space-y-4">
                      {viewerAnalyzing ? (
                        <div className="p-12 text-center space-y-3 bg-[#031511]/60 rounded-2xl border border-emerald-500/20">
                          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                          <p className="text-sm font-semibold text-white">Analyzing report with Ollama Llama 3.2...</p>
                          <p className="text-xs text-emerald-200/60">Extracting clinical diagnoses, findings, vitals, and medications from document text.</p>
                        </div>
                      ) : viewerAnalysisError ? (
                        <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <span>{viewerAnalysisError}</span>
                          </div>
                          <Button onClick={handleReanalyzeInViewer} variant="outline" className="h-8 text-xs rounded-full border-amber-500/40 text-amber-200">
                            Retry AI Analysis
                          </Button>
                        </div>
                      ) : viewerAnalysis?.summary ? (
                        <div className="space-y-4">
                          {/* Summary & Diagnosis Row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/20 space-y-1">
                              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Primary Diagnosis / Condition
                              </p>
                              <p className="text-sm font-bold text-white mt-1">
                                {viewerAnalysis.summary.diagnosis || "None explicitly stated"}
                              </p>
                            </div>

                            <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/20 space-y-1">
                              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Stethoscope className="w-3.5 h-3.5 text-emerald-400" /> Consulting Physician / Clinic
                              </p>
                              <p className="text-sm font-bold text-white mt-1">
                                {viewerAnalysis.summary.doctor || "Clinical Care Provider"}
                              </p>
                            </div>
                          </div>

                          {/* Main Findings */}
                          <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/20 space-y-2">
                            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                              <ClipboardList className="w-3.5 h-3.5 text-emerald-400" /> Key Clinical Findings & Observations
                            </p>
                            <p className="text-xs text-white/90 leading-relaxed">
                              {viewerAnalysis.summary.main_findings || viewerAnalysis.summary.summary || "Document processed successfully."}
                            </p>
                          </div>

                          {/* Measurements & Test Results */}
                          {viewerAnalysis.summary.measurements && Array.isArray(viewerAnalysis.summary.measurements) && viewerAnalysis.summary.measurements.length > 0 && (
                            <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/20 space-y-2">
                              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Droplet className="w-3.5 h-3.5 text-emerald-400" /> Vital Signs & Test Measurements
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {viewerAnalysis.summary.measurements.map((meas, idx) => (
                                  <div key={idx} className="text-xs p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/15 text-emerald-200 font-medium">
                                    {meas}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Prescribed Medications */}
                          <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/20 space-y-2">
                            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Pill className="w-3.5 h-3.5 text-emerald-400" /> Prescribed Medications
                            </p>
                            {Array.isArray(viewerAnalysis.summary.medicines) && viewerAnalysis.summary.medicines.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {viewerAnalysis.summary.medicines.map((med, idx) => (
                                  <span key={idx} className="text-xs px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 font-medium">
                                    {med}
                                  </span>
                                ))}
                              </div>
                            ) : typeof viewerAnalysis.summary.medicines === "string" && viewerAnalysis.summary.medicines.trim() ? (
                              <p className="text-xs text-emerald-100">{viewerAnalysis.summary.medicines}</p>
                            ) : (
                              <p className="text-xs text-emerald-200/60">No specific medications identified in document</p>
                            )}
                          </div>

                          {/* Follow-up / Recommendations */}
                          {viewerAnalysis.summary.follow_up && viewerAnalysis.summary.follow_up !== "None explicitly mentioned" && (
                            <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/20 space-y-1">
                              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Follow-up / Recommendations</p>
                              <p className="text-xs text-emerald-100/90 leading-relaxed">
                                {viewerAnalysis.summary.follow_up}
                              </p>
                            </div>
                          )}

                          {/* Disclaimer */}
                          <div className="p-3 bg-emerald-950/60 border border-emerald-400/20 rounded-2xl text-[11px] text-emerald-200/80 leading-relaxed flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>
                              <strong>AI Clinical Disclaimer:</strong> {viewerAnalysis.summary.disclaimer || "AI-generated individual document summary. Verify against primary clinical document."}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center space-y-3 bg-[#031511]/50 rounded-2xl border border-emerald-500/15">
                          <Sparkles className="w-8 h-8 text-emerald-400/40 mx-auto" />
                          <h4 className="text-sm font-bold text-white">No AI Summary Available</h4>
                          <p className="text-xs text-emerald-200/60">Click below to generate a document-level summary using Ollama Llama 3.2.</p>
                          <Button onClick={handleReanalyzeInViewer} variant="primary" className="rounded-full text-xs px-5 h-8">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Run AI Analysis
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section View 2: Original Document Preview */}
                  {viewerActiveSection === "preview" && (
                    <div className="space-y-3">
                      <div className="min-h-[420px] max-h-[65vh] flex items-center justify-center bg-[#020e0b]/90 rounded-2xl border border-emerald-500/20 p-2 overflow-hidden">
                        {viewerLoading ? (
                          <div className="flex flex-col items-center justify-center p-12 gap-3">
                            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                            <p className="text-xs text-emerald-200/70 font-medium">Loading document from secure vault...</p>
                          </div>
                        ) : viewerError ? (
                          <div className="text-center p-8 space-y-3">
                            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                            <p className="text-xs text-red-200">{viewerError}</p>
                            <Button onClick={() => handleOpenDocumentViewer(viewerDoc)} variant="outline" className="text-xs rounded-xl border-emerald-500/30 text-emerald-300">
                              Retry
                            </Button>
                          </div>
                        ) : viewerBlobUrl ? (
                          viewerDoc.file_path.toLowerCase().endsWith(".pdf") ? (
                            <iframe
                              src={viewerBlobUrl}
                              className="w-full h-[60vh] rounded-xl border-0 bg-white"
                              title={viewerDoc.title}
                            />
                          ) : (
                            <div className="max-h-[60vh] overflow-auto flex items-center justify-center p-2 w-full">
                              <img
                                src={viewerBlobUrl}
                                alt={viewerDoc.title}
                                className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-lg border border-emerald-500/20"
                              />
                            </div>
                          )
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Section View 3: OCR Extracted Text */}
                  {viewerActiveSection === "ocr" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                            Extracted OCR Text Content
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-emerald-200/60 font-mono">
                            {viewerAnalysis?.ocr_text?.length || viewerDoc.ocr_text?.length || 0} characters
                          </span>
                          <Button
                            onClick={handleCopyOcrText}
                            variant="outline"
                            className="h-7 text-xs px-3 rounded-lg border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5"
                          >
                            {viewerCopiedOcr ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-[#02100d]/90 rounded-2xl border border-emerald-500/20 max-h-[50vh] overflow-y-auto">
                        <pre className="text-xs font-mono text-emerald-100/90 whitespace-pre-wrap break-all leading-relaxed">
                          {viewerAnalysis?.ocr_text || viewerDoc.ocr_text || "OCR text extraction is in progress or unavailable for this record."}
                        </pre>
                      </div>
                      <p className="text-[10px] text-emerald-200/50 italic">
                        * OCR text extracted directly from the physical report file via Tesseract OCR engine.
                      </p>
                    </div>
                  )}

                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-3 border-t border-emerald-500/15 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleReanalyzeInViewer}
                      disabled={viewerAnalyzing}
                      variant="outline"
                      className="text-xs rounded-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${viewerAnalyzing ? "animate-spin text-emerald-400" : ""}`} />
                      <span>{viewerAnalyzing ? "Re-analyzing..." : "Re-analyze with AI"}</span>
                    </Button>
                  </div>
                  <Button
                    onClick={closeViewer}
                    variant="outline"
                    className="text-xs rounded-full border-emerald-500/20 text-emerald-200/80 px-6 hover:bg-emerald-500/10"
                  >
                    Close
                  </Button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
