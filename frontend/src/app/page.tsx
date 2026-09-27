"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/shared/Navbar";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { AtmosphericBackground } from "@/components/shared/AtmosphericBackground";
import { 
  ArrowRight, 
  BrainCircuit, 
  ShieldCheck, 
  Activity, 
  FileText, 
  Lock, 
  Calendar, 
  Stethoscope,
  ChevronDown,
  UploadCloud,
  FileCheck2,
  Share2,
  Layers,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const scrollToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} id="top" className="min-h-screen bg-[#051f19] text-[#f2f9f5] relative selection:bg-emerald-500/30 selection:text-white">
      {/* Global Reusable Background Atmosphere */}
      <AtmosphericBackground />
      <Navbar />

      <main>
        {/* 01 — HERO (100svh Viewport) */}
        <section className="relative min-h-[100svh] flex flex-col justify-between px-6 pt-28 pb-8 overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-[0.2em] mb-6 opacity-80"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI-Powered Digital Health Locker
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6 text-white font-brand hover:brightness-110 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-500 cursor-default"
              >
                Your Health.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-100 to-white">
                  One Secure Place.
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-emerald-100/70 max-w-2xl leading-relaxed mb-10 hover:text-emerald-100/90 transition-colors duration-500 cursor-default"
              >
                Organize your lifetime medical history, gain AI-assisted clinical summaries, and share encrypted records seamlessly with trusted doctors.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto"
              >
                <Link href="/patient/register" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full sm:w-auto rounded-full h-13 px-8 text-base group">
                    Create Health Locker
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/doctor/register" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto rounded-full h-13 px-8 text-base">
                    <Stethoscope className="w-4 h-4 mr-2 text-emerald-400" />
                    Doctor Access
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Scroll Cue */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => scrollToSection("how-it-works")}
              className="flex flex-col items-center gap-1.5 text-emerald-200/60 hover:text-white transition-colors cursor-pointer group"
              aria-label="Scroll to How It Works section"
            >
              <span className="text-xs font-mono uppercase tracking-widest">Explore Architecture</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* 02 — HOW IT WORKS ("Every report. One place.") */}
        <section id="how-it-works" className="py-28 px-6 relative z-10 border-t border-emerald-500/15">
          <div className="max-w-6xl mx-auto">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">
                Core Journey
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6 font-heading">
                Every report.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-400">
                  One place.
                </span>
              </h2>
              <p className="text-emerald-100/80 text-lg leading-relaxed">
                SwasthyaVault eliminates scattered PDFs and lost paper files. Upload once, and let intelligent processing turn chaotic medical data into a structured lifetime asset.
              </p>
            </motion.div>

            {/* 5-Step Process Sequence */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5"
            >
              {/* Step 1 */}
              <motion.div variants={fadeUp} className="glass-card p-6 rounded-3xl relative flex flex-col justify-between border border-emerald-500/20 group hover:border-emerald-400/40 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-300">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-emerald-400/20 transition-all">
                    <UploadCloud className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-wider">01 • UPLOAD</span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-2">Upload Files</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    Upload lab reports, prescriptions, or imaging files in PDF or image formats.
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div variants={fadeUp} className="glass-card p-6 rounded-3xl relative flex flex-col justify-between border border-emerald-500/20 group hover:border-emerald-400/40 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-300">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-emerald-400/20 transition-all">
                    <FileCheck2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-wider">02 • OCR</span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-2">Automated OCR</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    High-precision text extraction reads raw tables, values, and clinical notes.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div variants={fadeUp} className="glass-card p-6 rounded-3xl relative flex flex-col justify-between border border-emerald-500/20 group hover:border-emerald-400/40 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-300">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-emerald-400/20 transition-all">
                    <BrainCircuit className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-wider">03 • AI STRUCTURING</span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-2">AI Structuring</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    AI synthesizes medical terms into clean summaries and key biomarkers.
                  </p>
                </div>
              </motion.div>

              {/* Step 4 */}
              <motion.div variants={fadeUp} className="glass-card p-6 rounded-3xl relative flex flex-col justify-between border border-emerald-500/20 group hover:border-emerald-400/40 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-300">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-emerald-400/20 transition-all">
                    <Calendar className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-wider">04 • TIMELINE</span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-2">Timeline</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    Records arrange automatically into a chronological longitudinal record.
                  </p>
                </div>
              </motion.div>

              {/* Step 5 */}
              <motion.div variants={fadeUp} className="glass-card p-6 rounded-3xl relative flex flex-col justify-between border border-emerald-500/20 group hover:border-emerald-400/40 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-300">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-emerald-400/20 transition-all">
                    <Share2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-wider">05 • SHARING</span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-2">Grant Consent</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    Share encrypted access with authorized doctors with a single click.
                  </p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* 03 & 04 — HEALTH LOCKER & SMART CASE-TAKING */}
        <section className="py-28 px-6 relative z-10">
          <div className="max-w-6xl mx-auto space-y-24">
            
            {/* Feature Block 1: Health Locker */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid lg:grid-cols-12 gap-12 items-center"
            >
              <motion.div variants={fadeUp} className="lg:col-span-6 space-y-6">
                <div className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">
                  03 • Health Locker
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight font-heading">
                  Medical documents organized securely.
                </h2>
                <p className="text-emerald-100/80 text-base leading-relaxed">
                  Your health locker serves as a centralized, encrypted repository for all medical documents. Never worry about misplacing physical lab reports or blood tests again.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="lg:col-span-6">
                <div className="glass-card p-8 rounded-[2.5rem] border border-emerald-400/20 relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Centralized Document Management</h3>
                      <p className="text-xs text-emerald-200/60">Unified storage format</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-[#06241e]/90 border border-emerald-500/20 flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Full Blood Count (FBC)</span>
                      <span className="text-xs font-mono text-emerald-400">PDF • OCR Synced</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#06241e]/90 border border-emerald-500/20 flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Lipid Profile Report</span>
                      <span className="text-xs font-mono text-emerald-400">JPG • Analyzed</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature Block 2: Smart Case-Taking */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid lg:grid-cols-12 gap-12 items-center lg:flex-row-reverse"
            >
              <motion.div variants={fadeUp} className="lg:col-span-6 lg:order-2 space-y-6">
                <div className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">
                  04 • Smart Case-Taking
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight font-heading">
                  Turn scattered info into structured history.
                </h2>
                <p className="text-emerald-100/80 text-base leading-relaxed">
                  Raw health reports are transformed into structured clinical context. Key vitals, allergies, and diagnoses are indexed automatically for immediate review.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="lg:col-span-6 lg:order-1">
                <div className="glass-dark p-8 rounded-[2.5rem] border border-emerald-500/20 relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Clinical Data Indexing</h3>
                      <p className="text-xs text-emerald-200/60">Structured extraction</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                      <span className="text-emerald-200/70">Extracted Diagnosis:</span>
                      <span className="text-white font-semibold">Acute Pharyngitis</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                      <span className="text-emerald-200/70">Prescribed Regimen:</span>
                      <span className="text-white font-semibold">Amoxicillin 500mg • 7 Days</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* 05 & 06 — MEDICAL TIMELINE & AI HEALTH BRIEF */}
        <section className="py-28 px-6 relative z-10 border-t border-emerald-500/15">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            
            {/* 05 Medical Timeline */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-card p-8 md:p-10 rounded-[2.5rem] border border-emerald-400/20 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center mb-8">
                  <Calendar className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">05 • Timeline</div>
                <h3 className="text-2xl font-bold text-white mb-4">Medical Timeline</h3>
                <p className="text-emerald-100/70 text-sm leading-relaxed mb-8">
                  View your complete healthcare progression chronologically. Trace consultations, follow-ups, and lab trends across years in one unified view.
                </p>
                
                <div className="border-l-2 border-emerald-500/30 ml-4 space-y-6 my-6">
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-[#051f19] bg-emerald-500" />
                    <p className="text-sm font-bold text-white">General Consultation</p>
                    <p className="text-xs text-emerald-200/60">Annual Routine Checkup</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-[#051f19] bg-emerald-400" />
                    <p className="text-sm font-bold text-white">Blood Diagnostic Sync</p>
                    <p className="text-xs text-emerald-200/60">Biomarker Baseline</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 06 AI Health Brief */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="glass-dark p-8 md:p-10 rounded-[2.5rem] border border-emerald-500/25 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center mb-8">
                  <BrainCircuit className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">06 • AI Health Brief</div>
                <h3 className="text-2xl font-bold text-white mb-4">Understand records faster.</h3>
                <p className="text-emerald-100/70 text-sm leading-relaxed mb-8">
                  SwasthyaVault AI translates complex medical jargon into readable summaries, highlighting essential actions and doctor recommendations.
                </p>
                
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> AI Synthesis
                    </span>
                    <span className="text-emerald-200/50">Instant Parsing</span>
                  </div>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">
                    "Patient presents clear resolution of respiratory symptoms following complete antibiotic course. Vitals stable."
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* 07 — PATIENT-CONTROLLED SHARING */}
        <section className="py-28 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-card p-10 md:p-14 rounded-[3rem] border border-emerald-400/25 text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">07 • Patient Ownership</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 max-w-2xl mx-auto font-heading">
                Patient-Controlled Sharing & Active Consent
              </h2>
              <p className="text-emerald-100/80 text-base max-w-2xl mx-auto leading-relaxed mb-8">
                You retain complete authority over your healthcare narrative. Grant temporary, revocable access to specific doctors so clinicians have complete context when treating you.
              </p>

              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#06241e] border border-emerald-400/30 text-xs font-medium text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Revocable Doctor Sharing Protocols Engaged</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 08 — ABOUT US SECTION (Text-only card, no team photos) */}
        <section id="about-us" className="py-28 px-6 relative z-10 border-t border-emerald-500/15">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-card p-10 md:p-16 rounded-[3rem] border border-emerald-400/25 relative overflow-hidden text-center"
            >
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
                08 • About Us
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 font-heading">
                Our Team
              </h2>

              <div className="space-y-6 text-emerald-100/85 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                <p>
                  We are building SwasthyaVault to make personal healthcare information easier to organize, understand, and share.
                </p>
                <p>
                  Scattered medical history creates friction for patients and delays critical clinical decisions. Our team is dedicated to solving this problem by providing patients with full ownership over their digital health locker while equipping doctors with structured, actionable context when it matters most.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 09 — MINIMAL PREMIUM FOOTER */}
      <footer className="border-t border-emerald-500/20 bg-[#031713] py-16 px-6 relative z-10 text-emerald-200/70">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2.5 select-none">
              <div className="bg-emerald-500/20 border border-emerald-400/30 p-1.5 rounded-lg">
                <BrandLogo className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight font-brand cursor-default select-none">SwasthyaVault</span>
            </div>
            <p className="text-xs text-emerald-200/60">AI-Powered Digital Health Locker & Clinical Intelligence</p>
          </div>

          <div className="text-xs text-emerald-200/50 mt-4 md:mt-0">
            © {new Date().getFullYear()} SwasthyaVault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
