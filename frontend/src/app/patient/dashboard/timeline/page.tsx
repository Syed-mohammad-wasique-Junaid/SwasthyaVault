"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Activity, User, FileText, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Link from "next/link";

interface TimelineEvent {
  id: number;
  user_id: number;
  visit_date: string;
  diagnosis: string;
  doctor: string;
  document_title: string;
}

export default function MedicalTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/timeline/");
      setEvents(res.data || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Unable to load medical timeline records.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white font-heading">Medical Timeline</h3>
          <p className="text-emerald-200/60 text-sm">Your chronological health history generated from clinical reports & consultations</p>
        </div>
        <Link href="/patient/dashboard/locker">
          <Button variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 rounded-full text-xs">
            + Upload Report to Timeline
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      ) : error ? (
        <div className="glass-card p-8 rounded-3xl border border-red-500/20 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-white text-sm">{error}</p>
          <Button onClick={fetchTimeline} variant="outline" className="mt-4 rounded-full text-xs">
            Retry
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-emerald-500/20 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-4 text-emerald-400">
            <Activity className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">No timeline records yet.</h4>
          <p className="text-emerald-200/60 text-sm max-w-sm mb-6">
            Upload medical reports in your Health Locker to automatically populate your longitudinal health timeline.
          </p>
          <Link href="/patient/dashboard/locker">
            <Button variant="primary" className="rounded-full px-6 text-xs">
              Go to Health Locker
            </Button>
          </Link>
        </div>
      ) : (
        <div className="relative border-l-2 border-emerald-500/20 ml-6 space-y-6 pb-8">
          {events.map((event, i) => (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={event.id}
              className="relative pl-8"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-emerald-400 border-4 border-[#031511]" />

              <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.visit_date || "Date N/A"}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/20 w-fit">
                    Clinical Encounter
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white mb-2">{event.diagnosis || "Medical Assessment"}</h4>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-emerald-200/70 pt-2 border-t border-emerald-500/10">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Physician: <strong className="text-emerald-100">{event.doctor || "Clinical Care Provider"}</strong></span>
                  </div>

                  {event.document_title && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Source: <strong className="text-emerald-100 font-mono">{event.document_title}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

