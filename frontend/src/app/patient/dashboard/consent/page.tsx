"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  UserCheck, 
  X, 
  AlertCircle,
  Calendar,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface ConsentRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  doctor_name?: string;
  doctor_email?: string;
  granted: boolean;
  expires_at?: string;
  created_at?: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ConsentPage() {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [searchingDoctors, setSearchingDoctors] = useState(false);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [validityMonths, setValidityMonths] = useState<number>(3);
  const [granting, setGranting] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);

  // Revoke Action State
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const fetchConsents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/consent/");
      setConsents(res.data || []);
    } catch (err: any) {
      console.log("Failed to fetch consents:", err?.message);
      setError("Unable to load consent records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  const searchDoctors = async (query: string) => {
    try {
      setSearchingDoctors(true);
      const res = await api.get(`/doctor/search?q=${encodeURIComponent(query)}`);
      setDoctorsList(res.data || []);
    } catch (err: any) {
      console.log("Doctor search failed:", err?.message);
    } finally {
      setSearchingDoctors(false);
    }
  };

  const handleOpenModal = () => {
    setSelectedDoctor(null);
    setDoctorSearch("");
    setGrantError(null);
    setIsModalOpen(true);
    searchDoctors("");
  };

  const handleGrantConsent = async () => {
    if (!selectedDoctor) {
      setGrantError("Please select a doctor to grant access.");
      return;
    }

    try {
      setGranting(true);
      setGrantError(null);

      const expiresDate = new Date();
      expiresDate.setMonth(expiresDate.getMonth() + Number(validityMonths));

      await api.post("/consent/grant", {
        doctor_id: selectedDoctor.id,
        expires_at: expiresDate.toISOString(),
      });

      setIsModalOpen(false);
      await fetchConsents();
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      setGrantError(typeof msg === "string" ? msg : "Failed to grant consent. Please try again.");
    } finally {
      setGranting(false);
    }
  };

  const handleRevokeConsent = async (consentId: number) => {
    try {
      setRevokingId(consentId);
      await api.post("/consent/revoke", { consent_id: consentId });
      await fetchConsents();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to revoke consent. Please try again.");
    } finally {
      setRevokingId(null);
    }
  };

  const formatExpiry = (dateStr?: string) => {
    if (!dateStr) return "Indefinite";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getStatus = (consent: ConsentRecord) => {
    if (!consent.granted) {
      return { label: "Revoked", color: "bg-red-500/20 text-red-300 border-red-500/30", active: false };
    }
    if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
      return { label: "Expired", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", active: false };
    }
    return { label: "Active", color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30", active: true };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground font-heading">Consent Management</h3>
          <p className="text-muted-foreground">Control clinical providers authorized to view your health locker</p>
        </div>
        <Button 
          onClick={handleOpenModal}
          variant="primary" 
          className="flex items-center gap-2 rounded-full px-6 shadow-lg shadow-emerald-500/20"
        >
          <ShieldAlert className="w-4 h-4" />
          Grant New Access
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      ) : error ? (
        <div className="glass-card p-8 rounded-2xl border border-red-500/20 text-center text-red-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p>{error}</p>
          <Button onClick={fetchConsents} variant="outline" className="mt-4 rounded-full">Retry</Button>
        </div>
      ) : consents.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-emerald-500/20 text-center flex flex-col items-center justify-center min-h-[320px]">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            <ShieldAlert className="w-8 h-8 text-emerald-400/70" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2 font-heading">No active consents</h4>
          <p className="text-emerald-200/60 max-w-md text-sm leading-relaxed mb-6">
            No doctors have access to your records yet. Click &ldquo;Grant New Access&rdquo; to share your health locker with a verified doctor.
          </p>
          <Button onClick={handleOpenModal} variant="primary" className="rounded-full px-6">
            Grant New Access
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {consents.map((consent, i) => {
            const status = getStatus(consent);
            return (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card bg-surface-warm p-6 rounded-2xl border-l-4 ${status.active ? 'border-l-primary' : 'border-l-border'} shadow-sm flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{consent.doctor_name || `Doctor #${consent.doctor_id}`}</h4>
                        <p className="text-xs text-muted-foreground">{consent.doctor_email || "Verified Clinical Provider"}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${status.color}`}>
                      {status.active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {status.label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Expires: {formatExpiry(consent.expires_at)}
                  </div>
                  {status.active && (
                    <button 
                      onClick={() => handleRevokeConsent(consent.id)}
                      disabled={revokingId === consent.id}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold hover:underline flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      {revokingId === consent.id ? "Revoking..." : "Revoke Access"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Grant New Access Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#051c17] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-heading">Grant Health Locker Access</h3>
                    <p className="text-xs text-emerald-200/60">Authorize a registered doctor to review your medical history</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-emerald-500/20 text-emerald-200/70 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {grantError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs font-medium text-center">
                  {grantError}
                </div>
              )}

              {/* Step 1: Search Doctor */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Search Registered Doctor</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-200/50" />
                  <Input
                    className="pl-9 h-11 bg-[#031511] border border-emerald-500/20 rounded-xl text-white placeholder:text-emerald-200/40 text-sm"
                    placeholder="Search doctor by name or email..."
                    value={doctorSearch}
                    onChange={(e) => {
                      setDoctorSearch(e.target.value);
                      searchDoctors(e.target.value);
                    }}
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {searchingDoctors ? (
                    <div className="p-4 text-center text-xs text-emerald-200/50">Searching registered providers...</div>
                  ) : doctorsList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-emerald-200/50">No matching registered doctors found.</div>
                  ) : (
                    doctorsList.map((doc) => {
                      const isSelected = selectedDoctor?.id === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected 
                              ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm' 
                              : 'bg-[#031511]/60 border-emerald-500/10 text-emerald-100 hover:border-emerald-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-emerald-400 text-black' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              <Stethoscope className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{doc.name}</p>
                              <p className="text-xs text-emerald-200/60">{doc.email}</p>
                            </div>
                          </div>
                          {isSelected && <UserCheck className="w-5 h-5 text-emerald-400" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Step 2: Access Duration */}
              <div className="space-y-3 pt-2 border-t border-emerald-500/10">
                <label className="text-xs font-semibold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Access Duration
                </label>
                <select
                  value={validityMonths}
                  onChange={(e) => setValidityMonths(Number(e.target.value))}
                  className="w-full h-11 bg-[#031511] border border-emerald-500/20 rounded-xl px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value={1}>1 Month (Standard Consultation)</option>
                  <option value={3}>3 Months (Quarterly Review)</option>
                  <option value={6}>6 Months (Chronic Care)</option>
                  <option value={12}>1 Year (Primary Physician)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-500/20">
                <Button 
                  onClick={() => setIsModalOpen(false)} 
                  variant="outline" 
                  className="rounded-xl border-emerald-500/20 text-emerald-200 hover:bg-emerald-500/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGrantConsent}
                  disabled={!selectedDoctor || granting}
                  variant="primary"
                  className="rounded-xl px-6"
                >
                  {granting ? "Granting Access..." : "Confirm Access"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

