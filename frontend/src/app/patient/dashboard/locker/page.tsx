"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, FileText, Download, Eye, File, 
  Sparkles, AlertCircle, CheckCircle2, RefreshCw, 
  X, Calendar, Stethoscope, Pill, AlertTriangle, ArrowRight,
  Activity, ClipboardList, Clock, Check, Trash2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface DocumentItem {
  id: number;
  user_id: number;
  title: string;
  document_type: string;
  file_path: string;
  uploaded_at: string;
  ocr_status?: boolean;
}

interface AIAnalysisResult {
  document: string;
  document_type?: string;
  uploaded_at?: string;
  file_path?: string;
  ocr_text: string;
  summary: {
    document_type?: string;
    patient_name?: string;
    diagnosis?: string;
    main_findings?: string;
    measurements?: string[] | string;
    medicines?: string[] | string;
    doctor?: string;
    visit_date?: string;
    follow_up?: string;
    summary?: string;
    disclaimer?: string;
  };
  timeline_id?: number;
}

export default function HealthLocker() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("Blood Test");
  const [customDocType, setCustomDocType] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<"IDLE" | "UPLOADING" | "EXTRACTING" | "SUMMARIZING" | "SUCCESS" | "ERROR">("IDLE");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Analysis modal / drawer
  const [activeAnalysis, setActiveAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analyzingDocId, setAnalyzingDocId] = useState<number | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Real Document Viewer states (Open Report)
  const [viewerDoc, setViewerDoc] = useState<DocumentItem | null>(null);
  const [viewerBlobUrl, setViewerBlobUrl] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);

  // Delete modal & feedback states
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await api.get("/documents/");
      setDocuments(res.data || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setFetchError("Your session has expired. Please log in again.");
      } else {
        setFetchError("Unable to load medical reports. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDocuments();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewerDoc) {
          closeViewer();
        } else if (docToDelete && !deleting) {
          setDocToDelete(null);
        } else if (activeAnalysis) {
          setActiveAnalysis(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAnalysis, viewerDoc, docToDelete, deleting, viewerBlobUrl]);

  useEffect(() => {
    return () => {
      if (viewerBlobUrl) {
        URL.revokeObjectURL(viewerBlobUrl);
      }
    };
  }, [viewerBlobUrl]);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      return "Unsupported file type. Allowed: PDF, JPG, PNG";
    }

    if (file.size > 10 * 1024 * 1024) {
      return "File is too large (maximum 10MB allowed).";
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setUploadError(null);
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setSelectedFile(file);
    // Auto populate title with clean filename without extension
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    setDocTitle(cleanName);
    setUploadState("IDLE");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    // Validation for "Other" document type
    let finalDocType = docType;
    if (docType === "Other") {
      if (!customDocType.trim()) {
        setUploadError("Please enter a specific document type (e.g. MRI Report, ECG).");
        return;
      }
      finalDocType = customDocType.trim();
    }

    try {
      setUploadState("UPLOADING");
      setUploadError(null);
      setUploadMessage("Uploading report to secure vault...");

      const formData = new FormData();
      formData.append("title", docTitle.trim() || selectedFile.name);
      formData.append("document_type", finalDocType);
      formData.append("file", selectedFile);

      const uploadRes = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newDocId = uploadRes.data.document_id;
      
      // Step 2: OCR text extraction
      setUploadState("EXTRACTING");
      setUploadMessage("Document saved. Extracting text via OCR...");

      // Step 3: Trigger AI Analysis
      try {
        setUploadState("SUMMARIZING");
        setUploadMessage("Generating structured health summary...");
        const aiRes = await api.get(`/ai/analyze?document_id=${newDocId}`);
        setActiveAnalysis(aiRes.data);
      } catch (aiErr: any) {
        const detailMsg = aiErr?.response?.data?.detail || aiErr?.message;
        console.warn("AI analysis note:", detailMsg);
        setAnalysisError("Document saved, but automated analysis is currently unavailable. You can view or re-analyze it anytime.");
      }

      setUploadState("SUCCESS");
      setUploadMessage("Analysis complete");
      setSelectedFile(null);
      setDocTitle("");
      setCustomDocType("");
      setDocType("Blood Test");

      // Refresh list
      await fetchDocuments();

      setTimeout(() => {
        setUploadState("IDLE");
        setUploadMessage(null);
      }, 3000);

    } catch (err: any) {
      setUploadState("ERROR");
      if (err.response?.status === 400) {
        setUploadError(err.response?.data?.detail || "Invalid document upload parameters.");
      } else if (err.response?.status === 403) {
        setUploadError("Only authenticated patients can upload documents.");
      } else if (err.response?.status === 401) {
        setUploadError("Your session has expired. Please log in again.");
      } else {
        setUploadError(err.response?.data?.detail || "Unable to upload this report. Please check your connection and try again.");
      }
    }
  };

  const handleOpenReport = async (doc: DocumentItem) => {
    try {
      setViewerDoc(doc);
      setViewerLoading(true);
      setViewerError(null);
      if (viewerBlobUrl) {
        URL.revokeObjectURL(viewerBlobUrl);
        setViewerBlobUrl(null);
      }
      const res = await api.get(`/documents/${doc.id}/file`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      setViewerBlobUrl(url);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setViewerError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setViewerError("You are not authorized to view this document.");
      } else if (err.response?.status === 404) {
        setViewerError("Document file was not found on the server.");
      } else {
        setViewerError("Unable to open the original report file. Please try again.");
      }
    } finally {
      setViewerLoading(false);
    }
  };

  const closeViewer = () => {
    if (viewerBlobUrl) {
      URL.revokeObjectURL(viewerBlobUrl);
      setViewerBlobUrl(null);
    }
    setViewerDoc(null);
    setViewerError(null);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      setDeleting(true);
      setDeleteErrorMsg(null);
      await api.delete(`/documents/${docToDelete.id}`);
      const deletedTitle = docToDelete.title;
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
      setDocToDelete(null);
      setDeleteSuccessMsg(`"${deletedTitle}" was permanently deleted from your health locker.`);
      setTimeout(() => {
        setDeleteSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setDeleteErrorMsg("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setDeleteErrorMsg("You are not authorized to delete this document.");
      } else {
        setDeleteErrorMsg(err.response?.data?.detail || "Unable to delete report. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleViewAnalysis = async (docId: number) => {
    try {
      setAnalyzingDocId(docId);
      setAnalysisError(null);
      const res = await api.get(`/ai/analyze?document_id=${docId}`);
      setActiveAnalysis(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAnalysisError("Your session has expired. Please log in again.");
      } else {
        setAnalysisError(err.response?.data?.detail || "Document analysis is currently unavailable. Please try again after OCR/AI services are configured.");
      }
    } finally {
      setAnalyzingDocId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white font-heading">Health Locker</h3>
          <p className="text-emerald-200/60 text-sm">Securely store, organize, view, and manage your medical documents</p>
        </div>
        {/* Hidden file picker input */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Global Success / Alert Banner */}
      {deleteSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-400/40 text-emerald-200 text-xs flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{deleteSuccessMsg}</span>
          </div>
          <Button onClick={() => setDeleteSuccessMsg(null)} variant="outline" className="h-7 text-xs rounded-lg border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/15">
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Upload Dropzone & Staged File Area */}
      <div className="space-y-4">
        {!selectedFile ? (
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
              isDragging 
                ? "border-emerald-400 bg-emerald-500/15 scale-[1.01]" 
                : "border-emerald-500/30 bg-[#031511]/60 hover:bg-[#031511]/90 hover:border-emerald-400/50"
            }`}
          >
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Drag & Drop medical reports here</h4>
            <p className="text-emerald-200/60 text-sm mb-6 max-w-sm mx-auto">
              Upload diagnostic tests, prescriptions, lab results, or discharge summaries (PDF, JPG, PNG up to 10MB)
            </p>
            <Button 
              type="button" 
              variant="outline" 
              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 rounded-full px-8"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-400/40 bg-gradient-to-b from-[#062921]/90 to-[#031814]/90 space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                  <File className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white break-all">{selectedFile.name}</h4>
                  <p className="text-xs text-emerald-200/60 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || "Document"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setUploadState("IDLE");
                  setUploadError(null);
                  setCustomDocType("");
                }}
                disabled={uploadState === "UPLOADING" || uploadState === "EXTRACTING" || uploadState === "SUMMARIZING"}
                className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-200/60 hover:text-white transition-colors"
                title="Cancel selection"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Document Type Inputs */}
            <div className="space-y-4 pt-2 border-t border-emerald-500/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-200/70 uppercase tracking-wider mb-1.5">
                    Report Title
                  </label>
                  <input 
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Complete Blood Count (CBC)"
                    disabled={uploadState === "UPLOADING" || uploadState === "EXTRACTING" || uploadState === "SUMMARIZING"}
                    className="w-full bg-[#031511] border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200/70 uppercase tracking-wider mb-1.5">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => {
                      setDocType(e.target.value);
                      if (e.target.value !== "Other") {
                        setCustomDocType("");
                      }
                    }}
                    disabled={uploadState === "UPLOADING" || uploadState === "EXTRACTING" || uploadState === "SUMMARIZING"}
                    className="w-full bg-[#031511] border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Blood Test">Blood Test</option>
                    <option value="Prescription">Prescription</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="Scan">Scan</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Diagnostic Report">Diagnostic Report</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Specific Document Type (Shown when 'Other' is selected) */}
              <AnimatePresence>
                {docType === "Other" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="block text-xs font-bold text-emerald-200/80 uppercase tracking-wider">
                      Specific Document Type <span className="text-emerald-400">*</span>
                    </label>
                    <input 
                      type="text"
                      value={customDocType}
                      onChange={(e) => setCustomDocType(e.target.value)}
                      placeholder="e.g. MRI Report, ECG Report, Dental Report, Medical Certificate..."
                      disabled={uploadState === "UPLOADING" || uploadState === "EXTRACTING" || uploadState === "SUMMARIZING"}
                      className="w-full bg-[#031511] border border-emerald-400/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-300 shadow-inner"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons & Status */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs">
                {uploadState === "UPLOADING" && (
                  <span className="text-emerald-300 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    {uploadMessage || "Uploading report..."}
                  </span>
                )}
                {uploadState === "EXTRACTING" && (
                  <span className="text-emerald-300 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    {uploadMessage || "Extracting text via OCR..."}
                  </span>
                )}
                {uploadState === "SUMMARIZING" && (
                  <span className="text-emerald-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse text-emerald-400" />
                    {uploadMessage || "Generating health summary..."}
                  </span>
                )}
                {uploadState === "SUCCESS" && (
                  <span className="text-emerald-300 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {uploadMessage || "Analysis complete"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setCustomDocType("");
                  }}
                  disabled={uploadState === "UPLOADING" || uploadState === "EXTRACTING" || uploadState === "SUMMARIZING"}
                  className="w-full sm:w-auto rounded-full border-emerald-500/20 text-emerald-200/70 hover:bg-emerald-500/10"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleUploadAndAnalyze}
                  disabled={uploadState === "UPLOADING" || uploadState === "EXTRACTING" || uploadState === "SUMMARIZING"}
                  className="w-full sm:w-auto rounded-full px-8 flex items-center justify-center gap-2"
                >
                  {uploadState === "UPLOADING" 
                    ? "Uploading..." 
                    : uploadState === "EXTRACTING" 
                    ? "Extracting Text..." 
                    : uploadState === "SUMMARIZING" 
                    ? "Analyzing..." 
                    : "Save to Vault"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
            <Button onClick={() => setUploadError(null)} variant="outline" className="h-7 text-xs rounded-lg border-red-500/30 text-red-200">
              Dismiss
            </Button>
          </motion.div>
        )}
      </div>

      {/* Document Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-white tracking-tight">Your Medical Records</h4>
          <span className="text-xs text-emerald-200/60 font-medium">{documents.length} Reports</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        ) : fetchError ? (
          <div className="glass-card p-8 rounded-3xl border border-red-500/20 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">{fetchError}</p>
            <Button onClick={fetchDocuments} variant="outline" className="mt-4 rounded-full text-xs">
              Retry
            </Button>
          </div>
        ) : documents.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl border border-emerald-500/20 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-4 text-emerald-400">
              <FileText className="w-8 h-8" />
            </div>
            <h5 className="text-lg font-bold text-white mb-1">No medical reports yet.</h5>
            <p className="text-emerald-200/60 text-sm max-w-sm mb-6">
              Upload your first report to start building your Health Locker and get AI-assisted insights.
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline" 
              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 rounded-full px-6"
            >
              Upload First Report
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-emerald-500/20 hover:border-emerald-400/40 transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2.5 py-1 bg-emerald-500/15 rounded-lg border border-emerald-400/20">
                      {doc.document_type || "Report"}
                    </span>
                    <span className="text-xs text-emerald-200/50 font-mono">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "Uploaded"}
                    </span>
                  </div>

                  <h5 className="font-bold text-white text-base mb-1 group-hover:text-emerald-300 transition-colors line-clamp-2" title={doc.title}>
                    {doc.title}
                  </h5>
                  <p className="text-xs text-emerald-200/50 break-all font-mono text-[11px] mt-1 truncate" title={doc.file_path}>
                    {doc.file_path.split("/").pop()?.split("\\").pop()}
                  </p>
                </div>

                {/* Report Action Area: Open Report + Delete + AI Summary */}
                <div className="mt-5 pt-4 border-t border-emerald-500/15 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenReport(doc)}
                      variant="outline"
                      className="flex-1 text-xs rounded-xl bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 hover:text-white flex items-center justify-center gap-1.5 h-9 font-medium shadow-sm transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      Open Report
                    </Button>
                    <Button
                      onClick={() => {
                        setDeleteErrorMsg(null);
                        setDocToDelete(doc);
                      }}
                      variant="outline"
                      className="text-xs rounded-xl border-red-500/30 text-red-300/80 hover:bg-red-500/20 hover:text-red-200 hover:border-red-400/50 flex items-center justify-center px-3 h-9 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleViewAnalysis(doc.id)}
                    disabled={analyzingDocId === doc.id}
                    variant="ghost"
                    className="w-full text-xs text-emerald-200/70 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl flex items-center justify-center gap-1.5 h-7 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    {analyzingDocId === doc.id ? "Analyzing..." : "AI Summary & Detail"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Error Alert */}
      {analysisError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>{analysisError}</span>
          </div>
          <Button onClick={() => setAnalysisError(null)} variant="outline" className="h-7 text-xs rounded-lg border-amber-500/30 text-amber-200">
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* 1. Real Document Viewer Modal (Open Report) */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {viewerDoc && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeViewer}
                className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
                aria-hidden="true"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ duration: 0.2 }}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 glass-dark border border-emerald-400/30 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col p-6 sm:p-7 shadow-2xl text-white overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-emerald-500/20 pb-4 mb-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold font-heading truncate max-w-md">{viewerDoc.title}</h3>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 bg-emerald-500/15 rounded-md border border-emerald-400/20">
                          {viewerDoc.document_type || "Report"}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200/60 mt-0.5 font-mono">
                        {viewerDoc.uploaded_at ? new Date(viewerDoc.uploaded_at).toLocaleDateString() : ""} • {viewerDoc.file_path.split("/").pop()?.split("\\").pop()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {viewerBlobUrl && (
                      <>
                        <Button
                          onClick={() => window.open(viewerBlobUrl, "_blank")}
                          variant="outline"
                          className="h-8 text-xs rounded-xl border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5"
                          title="Open in new window"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">New Tab</span>
                        </Button>
                        <a
                          href={viewerBlobUrl}
                          download={viewerDoc.title || "medical-report"}
                          className="h-8 px-3 text-xs rounded-xl border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5 transition-colors"
                          title="Download original file"
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

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto min-h-[320px] flex items-center justify-center bg-[#020e0b]/80 rounded-2xl border border-emerald-500/15 p-2">
                  {viewerLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                      <p className="text-xs text-emerald-200/70 font-medium">Loading document from secure vault...</p>
                    </div>
                  ) : viewerError ? (
                    <div className="text-center p-8 space-y-3">
                      <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                      <p className="text-xs text-red-200">{viewerError}</p>
                      <Button onClick={() => handleOpenReport(viewerDoc)} variant="outline" className="text-xs rounded-xl border-emerald-500/30 text-emerald-300">
                        Retry
                      </Button>
                    </div>
                  ) : viewerBlobUrl ? (
                    viewerDoc.file_path.toLowerCase().endsWith(".pdf") ? (
                      <iframe
                        src={viewerBlobUrl}
                        className="w-full h-[65vh] rounded-xl border-0"
                        title={viewerDoc.title}
                      />
                    ) : (
                      <div className="max-h-[65vh] overflow-auto flex items-center justify-center p-2 w-full">
                        <img
                          src={viewerBlobUrl}
                          alt={viewerDoc.title}
                          className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg border border-emerald-500/20"
                        />
                      </div>
                    )
                  ) : null}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-2 border-t border-emerald-500/15 flex items-center justify-between flex-shrink-0">
                  <Button
                    onClick={() => {
                      const docId = viewerDoc.id;
                      closeViewer();
                      handleViewAnalysis(docId);
                    }}
                    variant="outline"
                    className="text-xs rounded-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    View AI Summary & OCR Details
                  </Button>
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

      {/* 2. Destructive Action Confirmation Dialog (Delete Report) */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {docToDelete && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !deleting && setDocToDelete(null)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
                aria-hidden="true"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                role="alertdialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 glass-dark border border-red-500/40 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-white space-y-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Delete Report?</h3>
                    <p className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
                      Are you sure you want to permanently delete this report? This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#02100d] rounded-xl border border-red-500/20 text-xs">
                  <p className="text-[10px] uppercase font-bold text-red-300/80 mb-0.5">Report to delete</p>
                  <p className="text-white font-medium truncate">{docToDelete.title}</p>
                  <p className="text-[11px] text-emerald-200/50 font-mono mt-0.5">
                    {docToDelete.document_type} • {docToDelete.uploaded_at ? new Date(docToDelete.uploaded_at).toLocaleDateString() : ""}
                  </p>
                </div>

                {deleteErrorMsg && (
                  <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{deleteErrorMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDocToDelete(null)}
                    disabled={deleting}
                    className="rounded-full px-5 text-xs border-emerald-500/20 text-emerald-200/80 hover:bg-emerald-500/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="rounded-full px-6 text-xs bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-900/40 border-0 flex items-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Report
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 3. Real AI & OCR Document Detail / Analysis Modal Rendered via Viewport Portal */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {activeAnalysis && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
              {/* Sibling 1: Viewport-wide Translucent Frosted Glass Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setActiveAnalysis(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                aria-hidden="true"
              />

              {/* Sibling 2: Centered Sharp Modal Content Dialog */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ duration: 0.2 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="analysis-modal-title"
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 glass-dark border border-emerald-400/30 rounded-3xl max-w-3xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl text-white"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-emerald-500/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 id="analysis-modal-title" className="text-xl font-bold font-heading">{activeAnalysis.document}</h3>
                      <p className="text-xs text-emerald-200/60 mt-0.5">Medical Document Detail & AI-Assisted Clinical Summary</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveAnalysis(null)}
                    className="p-2 hover:bg-emerald-500/20 rounded-xl text-emerald-200/60 hover:text-white transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 1. DOCUMENT INFORMATION */}
                <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/20 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" /> 1. Document Information
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-emerald-200/50 text-[10px] uppercase font-semibold">Report Title</p>
                      <p className="text-white font-medium mt-0.5 break-words">{activeAnalysis.document}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200/50 text-[10px] uppercase font-semibold">Document Type</p>
                      <p className="text-emerald-300 font-medium mt-0.5">
                        {activeAnalysis.document_type || activeAnalysis.summary?.document_type || "Report"}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-200/50 text-[10px] uppercase font-semibold">Date</p>
                      <p className="text-white font-medium mt-0.5">
                        {activeAnalysis.summary?.visit_date || (activeAnalysis.uploaded_at ? new Date(activeAnalysis.uploaded_at).toLocaleDateString() : "N/A")}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-200/50 text-[10px] uppercase font-semibold">Source File</p>
                      <p className="text-emerald-200/80 font-mono text-[11px] mt-0.5 truncate" title={activeAnalysis.file_path || ""}>
                        {activeAnalysis.file_path ? activeAnalysis.file_path.split("/").pop() : "Vault Storage"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. EXTRACTED OCR TEXT */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> 2. Extracted OCR Text
                    </h4>
                    <span className="text-[10px] text-emerald-200/60 font-mono">
                      {activeAnalysis.ocr_text ? `${activeAnalysis.ocr_text.length} characters extracted` : "0 characters"}
                    </span>
                  </div>
                  <div className="p-4 bg-[#02100d]/90 rounded-2xl border border-emerald-500/20 max-h-44 overflow-y-auto">
                    <pre className="text-[11px] font-mono text-emerald-100/90 whitespace-pre-wrap break-all leading-relaxed">
                      {activeAnalysis.ocr_text || "No text could be extracted from this document."}
                    </pre>
                  </div>
                  <p className="text-[10px] text-emerald-200/50 italic">
                    * OCR text extracted directly from the uploaded report via Tesseract OCR engine.
                  </p>
                </div>

                {/* 3. AI HEALTH SUMMARY */}
                <div className="space-y-4 pt-2 border-t border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> 3. Structured AI Health Summary
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Ollama Llama 3.2
                    </span>
                  </div>

                  {/* Structured Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Diagnosis */}
                    <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/15">
                      <p className="text-[10px] font-bold text-emerald-200/60 uppercase">Primary Diagnosis / Condition</p>
                      <p className="text-sm font-bold text-white mt-1">
                        {activeAnalysis.summary?.diagnosis || "None explicitly stated"}
                      </p>
                    </div>

                    {/* Doctor & Date */}
                    <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/15">
                      <p className="text-[10px] font-bold text-emerald-200/60 uppercase">Consulting Physician / Facility</p>
                      <p className="text-sm font-bold text-white mt-1">
                        {activeAnalysis.summary?.doctor || "Clinical Care Provider"}
                      </p>
                    </div>
                  </div>

                  {/* Main Findings */}
                  <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/15">
                    <p className="text-[10px] font-bold text-emerald-200/60 uppercase mb-1">Main Findings & Observations</p>
                    <p className="text-xs text-emerald-100/90 leading-relaxed">
                      {activeAnalysis.summary?.main_findings || activeAnalysis.summary?.summary || "Document processed successfully."}
                    </p>
                  </div>

                  {/* Measurements / Results (if present) */}
                  {activeAnalysis.summary?.measurements && Array.isArray(activeAnalysis.summary.measurements) && activeAnalysis.summary.measurements.length > 0 && (
                    <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/15">
                      <p className="text-[10px] font-bold text-emerald-200/60 uppercase mb-2 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" /> Measurements & Test Results
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeAnalysis.summary.measurements.map((meas, idx) => (
                          <div key={idx} className="text-xs p-2 rounded-xl bg-emerald-500/10 border border-emerald-400/15 text-emerald-200">
                            {meas}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prescribed Medicines */}
                  <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/15">
                    <p className="text-[10px] font-bold text-emerald-200/60 uppercase mb-2 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-emerald-400" /> Prescribed Medications
                    </p>
                    {Array.isArray(activeAnalysis.summary?.medicines) ? (
                      activeAnalysis.summary.medicines.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {activeAnalysis.summary.medicines.map((med, idx) => (
                            <span key={idx} className="text-xs px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 font-medium">
                              {med}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-200/60">No specific medications identified in document</p>
                      )
                    ) : (
                      <p className="text-xs text-emerald-200/90">{String(activeAnalysis.summary?.medicines || "None mentioned")}</p>
                    )}
                  </div>

                  {/* Follow-up / Next Steps */}
                  {activeAnalysis.summary?.follow_up && activeAnalysis.summary.follow_up !== "None explicitly mentioned" && (
                    <div className="p-4 bg-[#031511]/90 rounded-2xl border border-emerald-500/15">
                      <p className="text-[10px] font-bold text-emerald-200/60 uppercase mb-1">Follow-up / Recommended Next Steps</p>
                      <p className="text-xs text-emerald-100/90 leading-relaxed">
                        {activeAnalysis.summary.follow_up}
                      </p>
                    </div>
                  )}
                </div>

                {/* Assistive Disclaimer Banner */}
                <div className="p-3.5 bg-emerald-950/60 border border-emerald-400/30 rounded-2xl text-[11px] text-emerald-200/80 leading-relaxed flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>AI Assistance Notice:</strong> {activeAnalysis.summary?.disclaimer || "AI-generated summary for information support. Verify medical information with a qualified healthcare professional."}
                  </span>
                </div>

                {/* Modal Footer */}
                <div className="pt-2 flex justify-end">
                  <Button 
                    onClick={() => setActiveAnalysis(null)} 
                    variant="outline" 
                    className="rounded-full px-6 text-xs border-emerald-500/30 text-emerald-200"
                  >
                    Close Detail
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

