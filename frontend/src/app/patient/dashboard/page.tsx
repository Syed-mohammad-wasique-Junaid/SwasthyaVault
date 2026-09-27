"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Activity, BrainCircuit, Droplet, FileText, CalendarDays, 
  ShieldCheck, Pill, Stethoscope, ArrowRight, Sparkles,
  UserCheck, AlertCircle, Phone, User, Shield, CheckCircle2,
  Clock, HeartPulse, RefreshCw, UploadCloud
} from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PatientProfile {
  id?: number;
  user_id?: number;
  full_name?: string;
  email?: string;
  abha_id?: string;
  dob?: string;
  gender?: string;
  blood_group?: string;
  height?: string;
  weight?: string;
  ayush_status?: string;
  phone?: string;
  address?: string;
}

interface DocumentItem {
  id: number;
  user_id: number;
  title: string;
  document_type: string;
  file_path: string;
  uploaded_at: string;
  ocr_status?: boolean;
}

interface TimelineItem {
  id: number;
  user_id: number;
  visit_date: string;
  diagnosis: string;
  doctor: string;
  document_title: string;
}

interface ConsentItem {
  id: number;
  doctor_id: number;
  doctor_name?: string;
  doctor_email?: string;
  granted: boolean;
  expires_at?: string;
  created_at?: string;
}

interface StructuredAIBrief {
  overall_summary?: string;
  key_conditions?: string[] | string;
  important_findings?: string[] | string;
  medications?: string[] | string;
  vitals_and_measurements?: string[] | string;
  longitudinal_history?: string;
  recent_developments?: string;
  follow_up_recommendations?: string[] | string;
  source_documents?: string[];
  disclaimer?: string;
}

function normalizeContent(data: any): any {
  if (data === null || data === undefined) return null;
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeContent(parsed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (Array.isArray(data)) {
    return data.map(item => normalizeContent(item)).filter(Boolean);
  }
  if (typeof data === "object") {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      res[k] = normalizeContent(v);
    }
    return res;
  }
  return data;
}

export default function PatientDashboard() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [profileMissing, setProfileMissing] = useState<boolean>(false);
  const [patientName, setPatientName] = useState<string>("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [aiBrief, setAiBrief] = useState<StructuredAIBrief | null>(null);
  const [aiSourceDoc, setAiSourceDoc] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Profile
        const profPromise = api.get("/patient/profile")
          .then((res) => {
            if (isMounted && res.data) {
              setProfile(res.data);
              setProfileMissing(false);
              if (res.data.full_name) {
                setPatientName(res.data.full_name);
                if (typeof window !== "undefined") {
                  localStorage.setItem("patient_name", res.data.full_name);
                }
              }
            }
            return res.data;
          })
          .catch((err) => {
            if (err.response?.status === 404 && isMounted) {
              setProfileMissing(true);
            }
            return null;
          });

        // 2. Fetch Documents
        const docsPromise = api.get("/documents/")
          .then((res) => {
            const docsList: DocumentItem[] = res.data || [];
            if (isMounted) setDocuments(docsList);
            return docsList;
          })
          .catch((err) => {
            console.warn("Could not load documents:", err);
            return [];
          });

        // 3. Fetch Timeline
        const timelinePromise = api.get("/timeline/")
          .then((res) => {
            const tlList: TimelineItem[] = res.data || [];
            if (isMounted) setTimeline(tlList);
            return tlList;
          })
          .catch((err) => {
            console.warn("Could not load timeline:", err);
            return [];
          });

        // 4. Fetch Consents
        const consentPromise = api.get("/consent/")
          .then((res) => {
            const conList: ConsentItem[] = res.data || [];
            if (isMounted) setConsents(conList);
            return conList;
          })
          .catch((err) => {
            console.warn("Could not load consents:", err);
            return [];
          });

        const [_, docsList] = await Promise.all([profPromise, docsPromise, timelinePromise, consentPromise]);

        // 5. Fetch AI Health Brief
        if (isMounted) {
          if (docsList && docsList.length > 0) {
            setAiLoading(true);
            try {
              // Try patient-level longitudinal synthesis first
              const aiRes = await api.get("/ai/patient-summary");
              if (isMounted && aiRes.data?.brief) {
                const normalized = normalizeContent(aiRes.data.brief);
                setAiBrief(normalized);
                if (aiRes.data.brief.source_documents && Array.isArray(aiRes.data.brief.source_documents)) {
                  setAiSourceDoc(aiRes.data.brief.source_documents.join(", "));
                } else if (docsList.length > 0) {
                  setAiSourceDoc(`${docsList.length} report(s) analyzed`);
                }
              }
            } catch (synthErr) {
              // Fallback to latest single document summary
              try {
                const latest = docsList[docsList.length - 1];
                const docAiRes = await api.get(`/ai/analyze?document_id=${latest.id}`);
                if (isMounted && docAiRes.data?.summary) {
                  const s = normalizeContent(docAiRes.data.summary);
                  setAiBrief({
                    overall_summary: s.main_findings || s.summary || "Medical assessment completed.",
                    key_conditions: s.diagnosis ? [s.diagnosis] : [],
                    medications: s.medicines || [],
                    vitals_and_measurements: s.measurements || [],
                    follow_up_recommendations: s.follow_up ? [s.follow_up] : [],
                    disclaimer: s.disclaimer
                  });
                  setAiSourceDoc(latest.title);
                }
              } catch (e) {
                console.warn("AI brief unavailable:", e);
              }
            } finally {
              if (isMounted) setAiLoading(false);
            }
          } else {
            setAiLoading(false);
            setAiBrief(null);
          }
        }

      } catch (err) {
        console.error("Dashboard initial load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  const age = calculateAge(profile?.dob);
  const activeConsents = consents.filter(c => c.granted);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-12">
      
      {/* 1. Welcome / Patient Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
            {patientName ? `Good to see you, ${patientName}` : "Good to see you"}
          </h2>
          <p className="text-emerald-200/60 text-sm mt-1">
            Welcome to your unified clinical vault and health summary.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/patient/dashboard/locker">
            <Button variant="primary" className="rounded-full text-xs px-5 flex items-center gap-1.5 shadow-sm">
              <UploadCloud className="w-4 h-4" />
              <span>Upload Medical Report</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Profile Incomplete Warning Banner (if applicable) */}
      {profileMissing && (
        <motion.div 
          variants={item}
          className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Complete your health profile</p>
              <p className="text-xs text-amber-200/70 mt-0.5">
                Add your ABHA ID, blood group, and emergency contact details for a complete medical profile.
              </p>
            </div>
          </div>
          <Link href="/patient/onboarding">
            <Button variant="outline" className="border-amber-500/40 text-amber-200 hover:bg-amber-500/10 text-xs rounded-full whitespace-nowrap">
              Complete Profile
            </Button>
          </Link>
        </motion.div>
      )}

      {/* 2. Health Profile Overview Cards (Real Profile Data) */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blood Group */}
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 flex items-center gap-4 shadow-sm hover:border-emerald-400/30 transition-all">
          <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-emerald-200/60 uppercase font-bold tracking-wider">Blood Group</p>
            <p className="text-lg font-bold text-white tracking-tight mt-0.5">
              {profile?.blood_group || "Not Set"}
            </p>
          </div>
        </div>

        {/* ABHA ID */}
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 flex items-center gap-4 shadow-sm hover:border-emerald-400/30 transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] text-emerald-200/60 uppercase font-bold tracking-wider">ABHA ID</p>
            <p className="text-base font-bold text-white tracking-tight mt-0.5 truncate" title={profile?.abha_id || "None"}>
              {profile?.abha_id || "Not Linked"}
            </p>
          </div>
        </div>

        {/* Age & Gender */}
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 flex items-center gap-4 shadow-sm hover:border-emerald-400/30 transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-emerald-200/60 uppercase font-bold tracking-wider">Age / Gender</p>
            <p className="text-base font-bold text-white tracking-tight mt-0.5">
              {age ? `${age} Y` : "N/A"} {profile?.gender ? `/ ${profile.gender}` : ""}
            </p>
          </div>
        </div>

        {/* Contact Phone */}
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 flex items-center gap-4 shadow-sm hover:border-emerald-400/30 transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] text-emerald-200/60 uppercase font-bold tracking-wider">Contact</p>
            <p className="text-sm font-bold text-white tracking-tight mt-0.5 truncate" title={profile?.phone || "None"}>
              {profile?.phone || "Not Registered"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3. AI Health Brief (Longitudinal Patient Summary) */}
      <motion.div variants={item} className="glass-dark rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-xl relative overflow-hidden">
        <BrainCircuit className="absolute -top-10 -right-10 w-56 h-56 text-white/5 pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Longitudinal AI Health Brief</span>
            </div>
            {aiSourceDoc && (
              <span className="text-xs text-emerald-200/60 font-mono">
                Source: {aiSourceDoc}
              </span>
            )}
          </div>
          
          {aiLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
              <p className="text-xs text-emerald-200/70 font-medium">Synthesizing clinical records & health brief...</p>
            </div>
          ) : aiBrief ? (
            <div className="space-y-6">
              {/* Primary Overall Summary */}
              <div>
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">Clinical Synthesis</p>
                <p className="text-white text-sm sm:text-base leading-relaxed max-w-4xl">
                  {typeof aiBrief.overall_summary === "string" 
                    ? aiBrief.overall_summary 
                    : "Longitudinal clinical summary generated from your medical records."}
                </p>
              </div>

              {/* Conditions & Important Findings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Conditions / Diagnoses */}
                {aiBrief.key_conditions && (
                  <div className="bg-[#020e0b]/90 rounded-2xl p-4 border border-emerald-500/15 space-y-2">
                    <p className="text-emerald-200/60 text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-400" /> Key Conditions & Diagnoses
                    </p>
                    {Array.isArray(aiBrief.key_conditions) ? (
                      aiBrief.key_conditions.length > 0 ? (
                        <ul className="space-y-1">
                          {aiBrief.key_conditions.map((c, i) => (
                            <li key={i} className="text-xs text-emerald-100 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                              <span>{String(c)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-emerald-200/60">No specific chronic conditions identified</p>
                      )
                    ) : (
                      <p className="text-xs text-emerald-100">{String(aiBrief.key_conditions)}</p>
                    )}
                  </div>
                )}

                {/* Important Findings */}
                {aiBrief.important_findings && (
                  <div className="bg-[#020e0b]/90 rounded-2xl p-4 border border-emerald-500/15 space-y-2">
                    <p className="text-emerald-200/60 text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-emerald-400" /> Clinical Observations
                    </p>
                    {Array.isArray(aiBrief.important_findings) ? (
                      aiBrief.important_findings.length > 0 ? (
                        <ul className="space-y-1">
                          {aiBrief.important_findings.map((f, i) => (
                            <li key={i} className="text-xs text-emerald-100 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                              <span>{String(f)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-emerald-200/60">Reports indicate stable observations</p>
                      )
                    ) : (
                      <p className="text-xs text-emerald-100">{String(aiBrief.important_findings)}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Prescribed Medications & Measurements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Medications */}
                <div className="bg-[#020e0b]/90 rounded-2xl p-4 border border-emerald-500/15">
                  <p className="text-emerald-200/60 text-[11px] uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-400" /> Prescribed Medications
                  </p>
                  {Array.isArray(aiBrief.medications) ? (
                    aiBrief.medications.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {aiBrief.medications.map((med, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 font-medium">
                            {String(med)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-200/60">No active medications identified</p>
                    )
                  ) : (
                    <p className="text-xs text-emerald-100">{String(aiBrief.medications || "None listed")}</p>
                  )}
                </div>

                {/* Vitals / Measurements */}
                <div className="bg-[#020e0b]/90 rounded-2xl p-4 border border-emerald-500/15">
                  <p className="text-emerald-200/60 text-[11px] uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" /> Measurements & Vitals
                  </p>
                  {Array.isArray(aiBrief.vitals_and_measurements) ? (
                    aiBrief.vitals_and_measurements.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {aiBrief.vitals_and_measurements.map((v, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/15 text-emerald-200">
                            {String(v)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-200/60">Vitals recorded within expected parameters</p>
                    )
                  ) : (
                    <p className="text-xs text-emerald-100">{String(aiBrief.vitals_and_measurements || "Normal")}</p>
                  )}
                </div>
              </div>

              {/* Follow-up Recommendations if present */}
              {aiBrief.follow_up_recommendations && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/20">
                  <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider mb-1">Recommended Follow-up</p>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    {Array.isArray(aiBrief.follow_up_recommendations) 
                      ? aiBrief.follow_up_recommendations.join(". ") 
                      : String(aiBrief.follow_up_recommendations)}
                  </p>
                </div>
              )}

              {/* Footer row: Disclaimer + Link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-emerald-500/20">
                <p className="text-[11px] text-emerald-200/70 italic">
                  * {aiBrief.disclaimer || "AI-generated longitudinal summary for clinical support. Always verify medical information with a qualified healthcare professional."}
                </p>
                <Link href="/patient/dashboard/locker">
                  <Button variant="outline" className="text-xs rounded-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5 h-8">
                    <span>Manage Health Locker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <h3 className="text-lg font-bold tracking-tight text-white font-heading">No Health Brief Generated Yet</h3>
              <p className="text-emerald-100/70 text-sm max-w-lg">
                Upload a medical report to your Health Locker to generate an automated AI clinical brief and extract longitudinal insights.
              </p>
              <Link href="/patient/dashboard/locker">
                <Button variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 rounded-full text-xs mt-2">
                  Upload Medical Report
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* 4. Dual Columns: Recent Reports & Timeline Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Reports */}
        <motion.div variants={item} className="glass-card p-6 rounded-3xl border border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-heading">
              <FileText className="w-4 h-4 text-emerald-400" /> Recent Reports
            </h3>
            <Link href="/patient/dashboard/locker" className="text-xs text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1 font-medium">
              View All ({documents.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.slice(-3).reverse().map((doc) => (
                <Link href="/patient/dashboard/locker" key={doc.id}>
                  <div className="p-4 rounded-2xl bg-[#031511]/70 border border-emerald-500/15 hover:border-emerald-400/30 transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors truncate" title={doc.title}>
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-emerald-200/60 mt-0.5">
                          {doc.document_type || "Report"} • {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "Uploaded"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-300/70 group-hover:text-emerald-200 whitespace-nowrap ml-2 font-medium">
                      Open &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#031511]/40 border border-dashed border-emerald-500/20 text-center flex flex-col items-center">
              <FileText className="w-8 h-8 text-emerald-500/40 mb-2" />
              <p className="text-sm font-semibold text-white">No reports uploaded yet</p>
              <p className="text-xs text-emerald-200/50 mt-1 mb-3">Upload diagnostic tests, scans, or prescriptions.</p>
              <Link href="/patient/dashboard/locker">
                <Button variant="outline" className="text-xs rounded-full border-emerald-500/30 text-emerald-300 h-8">
                  Upload Report
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Medical Timeline Preview */}
        <motion.div variants={item} className="glass-card p-6 rounded-3xl border border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-heading">
              <Activity className="w-4 h-4 text-emerald-400" /> Longitudinal Timeline
            </h3>
            <Link href="/patient/dashboard/timeline" className="text-xs text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1 font-medium">
              View Full ({timeline.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {timeline.length > 0 ? (
            <div className="space-y-3">
              {timeline.slice(0, 3).map((event) => (
                <div key={event.id} className="p-4 rounded-2xl bg-[#031511]/70 border border-emerald-500/15 flex items-start justify-between">
                  <div className="overflow-hidden">
                    <p className="font-bold text-white text-sm truncate" title={event.diagnosis}>
                      {event.diagnosis || "Clinical Encounter"}
                    </p>
                    <p className="text-[11px] text-emerald-200/60 mt-0.5">
                      Provider: {event.doctor || "Clinical Care Provider"}
                    </p>
                    {event.document_title && (
                      <span className="inline-block mt-1.5 text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-full">
                        Ref: {event.document_title}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-emerald-300/80 whitespace-nowrap ml-2">
                    {event.visit_date || "Recent"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#031511]/40 border border-dashed border-emerald-500/20 text-center flex flex-col items-center">
              <Activity className="w-8 h-8 text-emerald-500/40 mb-2" />
              <p className="text-sm font-semibold text-white">No timeline records yet</p>
              <p className="text-xs text-emerald-200/50 mt-1 mb-3">Timeline events are created automatically as medical reports are analyzed.</p>
              <Link href="/patient/dashboard/locker">
                <Button variant="outline" className="text-xs rounded-full border-emerald-500/30 text-emerald-300 h-8">
                  Go to Health Locker
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* 5. Doctor Consent Overview (Real Consent Data) */}
      <motion.div variants={item} className="glass-card p-6 rounded-3xl border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight font-heading">Active Clinical Consents</h3>
              <p className="text-xs text-emerald-200/60">Healthcare providers authorized to review your health records</p>
            </div>
          </div>
          <Link href="/patient/dashboard/consent">
            <Button variant="outline" className="text-xs rounded-full border-emerald-500/30 text-emerald-300 h-8 font-medium">
              Manage Access ({activeConsents.length})
            </Button>
          </Link>
        </div>

        {activeConsents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeConsents.slice(0, 3).map((c) => (
              <div key={c.id} className="p-3.5 bg-[#031511]/80 rounded-xl border border-emerald-500/15 flex items-center justify-between">
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{c.doctor_name || `Doctor #${c.doctor_id}`}</p>
                  <p className="text-[10px] text-emerald-200/60 truncate">{c.doctor_email || "Verified Physician"}</p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-400/20 flex-shrink-0 ml-2">
                  Active
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-emerald-200/60 py-2">
            No doctors currently have active consent. You can grant access anytime from the Consent tab.
          </p>
        )}
      </motion.div>

    </motion.div>
  );
}

