"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doctorRegister, doctorLogin } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, ArrowLeft, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import Link from "next/link";
import { motion } from "framer-motion";
import { AtmosphericBackground } from "@/components/shared/AtmosphericBackground";

const formSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid work email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function DoctorRegister() {
  const { login } = useAuth();
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");
    try {
      // Step 1: Submit doctor registration with role="doctor" and full_name schema
      await doctorRegister({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      // Step 2: Auto-authenticate doctor user
      try {
        const loginData = await doctorLogin({
          email: values.email,
          password: values.password,
        });

        if (loginData.access_token) {
          login(loginData.access_token, "doctor");
          return;
        }
      } catch {
        // Fallback to doctor login page
      }

      window.location.href = "/doctor/login?registered=true";
    } catch (err: any) {
      console.error("Doctor Registration Error:", err);
      const backendMessage = err.response?.data?.detail;
      if (typeof backendMessage === "string") {
        if (backendMessage.toLowerCase().includes("already registered")) {
          setError("This email is already registered. Please sign in.");
        } else {
          setError(backendMessage);
        }
      } else if (Array.isArray(backendMessage)) {
        setError(backendMessage.map((e) => e.msg).join(", "));
      } else if (err.message === "Network Error" || !err.response) {
        setError("Unable to connect to authentication server. Please ensure the backend server is running.");
      } else {
        setError("Registration failed. Please check your information.");
      }
    }
  };

  return (
    <div className="min-h-screen flex relative selection:bg-emerald-500/30 selection:text-white">
      <AtmosphericBackground />

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-16 md:px-24 lg:px-32 relative z-10 py-12">
        <Link
          href="/"
          className="absolute top-8 left-8 sm:left-12 flex items-center gap-2 text-emerald-200/70 hover:text-white transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight font-heading">Provider Access Application</h2>
            <p className="text-emerald-200/70 text-sm">Join the SwasthyaVault clinical network.</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-emerald-100 font-medium text-sm">Full Name</Label>
              <Input
                id="name"
                placeholder="Dr. Sarah Jenkins"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-400 font-medium">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-100 font-medium text-sm">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="dr.jenkins@hospital.org"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-400 font-medium">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-emerald-100 font-medium text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-400 font-medium">{form.formState.errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 rounded-xl text-base mt-2"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting Application..." : "Apply for Provider Access"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-emerald-200/60">
            Already registered as a provider?{" "}
            <Link href="/doctor/login" className="text-white hover:text-emerald-400 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Visual Section */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden border-l border-emerald-500/10">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#041a15] via-[#082a22] to-transparent opacity-80" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 glass-card p-10 rounded-[2.5rem] max-w-lg shadow-2xl border border-emerald-400/20"
        >
          <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center mb-6">
            <BrandLogo className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 leading-snug">Structured Clinical Intelligence</h3>
          <p className="text-emerald-100/70 text-sm leading-relaxed mb-6">
            Review patient timelines, structured OCR summaries, and verified medical records with authorized consent.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Instant longitudinal patient timeline summaries</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Consent-backed HIPAA compliant record sharing</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
