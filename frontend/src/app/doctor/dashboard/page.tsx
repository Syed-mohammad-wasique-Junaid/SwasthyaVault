"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, User, ShieldCheck, ArrowRight, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import Link from "next/link";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/doctor/patients");
      setPatients(res.data || []);
    } catch (e: any) {
      console.error(e);
      if (e.message === "Network Error" || e.code === "ERR_NETWORK") {
        setError("NETWORK_ERROR");
      } else {
        setError("UNKNOWN_ERROR");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      patient.name?.toLowerCase().includes(term) ||
      patient.abha_id?.toLowerCase().includes(term) ||
      patient.phone?.toLowerCase().includes(term)
    );
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    );
  }

  if (error === "UNAUTHORIZED") {
    return (
      <div className="glass-card p-12 rounded-3xl border border-red-500/20 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <UserX className="w-10 h-10 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight mb-2 font-heading">Session Expired</h3>
        <p className="text-red-200/70 max-w-md text-sm leading-relaxed mb-6">
          Your provider authentication session has expired. Please sign in again to access the patient directory.
        </p>
        <Link href="/doctor/login">
          <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors text-sm shadow-md">
            Sign In to Provider Portal
          </button>
        </Link>
      </div>
    );
  }

  if (error === "NETWORK_ERROR") {
    return (
      <div className="glass-card p-12 rounded-3xl border border-red-500/20 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <UserX className="w-10 h-10 text-red-500/50" />
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight mb-2 font-heading">Unable to connect to clinical server</h3>
        <p className="text-red-200/60 max-w-md text-sm leading-relaxed mb-6">
          Please verify your connection or ensure the clinical backend service is running.
        </p>
        <button onClick={fetchPatients} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors text-sm">
          Retry
        </button>
      </div>
    );
  }

  const formatAge = (age: any) => {
    if (!age || age === "Unknown" || age === "null") return "Age N/A";
    const num = Number(age);
    if (!isNaN(num) && num > 0) return `${num} Yrs`;
    return typeof age === "string" && age.trim() ? `${age} Yrs` : "Age N/A";
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight font-heading">Patient Directory</h3>
          <p className="text-emerald-200/70 text-xs mt-0.5">Patients who have authorized active clinical consent for your provider account</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-200/50" />
          <Input
            className="pl-9 h-11 bg-[#06241e]/90 border border-emerald-500/20 rounded-xl text-white placeholder:text-emerald-200/40 text-sm"
            placeholder="Search patient name or ABHA ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredPatients.map((patient) => (
            <Link key={patient.id} href={`/doctor/dashboard/patient/${patient.id}`}>
              <motion.div
                variants={item}
                className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/20 hover:border-emerald-400/50 hover:-translate-y-0.5 transition-all cursor-pointer group shadow-md hover:shadow-emerald-500/10"
              >

                <div className="flex items-center gap-4 min-w-[240px]">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors flex-shrink-0">
                    <User className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
                      {patient.name}
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    </h4>
                    <p className="text-xs text-emerald-200/60 mt-0.5">
                      {formatAge(patient.age)} {patient.gender ? `• ${patient.gender}` : ""} • ABHA: <strong className="text-emerald-200/90">{patient.abha_id || "N/A"}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex-1 px-4 md:px-6 md:border-l md:border-r border-emerald-500/20 py-1">
                  <p className="text-[10px] text-emerald-200/60 uppercase tracking-widest font-bold mb-1">Blood Group & Phone</p>
                  <p className="text-white font-semibold text-sm">
                    Group: <span className="text-emerald-300">{patient.blood_group || "Not Set"}</span> • Contact: {patient.phone || "Not Registered"}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                  <div className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                    {patient.status || "Active Consent"}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 group-hover:bg-emerald-600 transition-colors flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:text-white" />
                  </div>
                </div>

              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 rounded-3xl border border-emerald-500/20 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 text-emerald-400/70">
            <UserX className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2 font-heading">
            {searchTerm ? "No matching patients found" : "No Authorized Patients Yet"}
          </h3>
          <p className="text-emerald-200/60 max-w-md text-sm leading-relaxed">
            {searchTerm 
              ? `No authorized patients matched "${searchTerm}". Try checking ABHA ID or spelling.` 
              : "No patients have shared their medical health locker with your provider account yet. When a patient grants clinical consent, their record will appear here."}
          </p>
        </div>
      )}

    </motion.div>
  );
}

