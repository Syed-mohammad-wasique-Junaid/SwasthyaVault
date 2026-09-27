"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { patientLogin } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import Link from "next/link";
import { motion } from "framer-motion";
import { AtmosphericBackground } from "@/components/shared/AtmosphericBackground";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function PatientLogin() {
  const { login } = useAuth();
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");
    try {
      const cleanEmail = values.email.toLowerCase().trim();
      const data = await patientLogin({
        email: cleanEmail,
        password: values.password,
      });
      if (data.access_token) {
        setSuccess(true);
        setTimeout(() => {
          login(data.access_token, "patient");
        }, 400);
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Patient Login Error:", err);
      if (err.code === "ERR_NETWORK" || err.message === "Network Error" || !err.response) {
        setError("Unable to connect to SwasthyaVault server. Please make sure the backend is running and try again.");
      } else if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        const backendMessage = err.response?.data?.detail;
        if (typeof backendMessage === "string") {
          setError(backendMessage);
        } else if (Array.isArray(backendMessage)) {
          setError(backendMessage.map((e: any) => e.msg || e).join(", "));
        } else {
          setError("Invalid email or password.");
        }
      }
    }
  };


  return (
    <div className="min-h-screen flex relative selection:bg-emerald-500/30 selection:text-white">
      <AtmosphericBackground />

      {/* Left Form Section */}
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
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight font-heading">Patient Portal</h2>
            <p className="text-emerald-200/70 text-sm">Sign in to securely access your health locker.</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-100 font-medium text-sm">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                {...form.register("email")} 
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-400 font-medium">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-emerald-100 font-medium text-sm">Password</Label>
              </div>
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

            <motion.div
              animate={success ? { scale: 0.98, opacity: 0.8 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button 
                type="submit" 
                variant="primary" 
                className={`w-full h-12 rounded-xl text-base mt-2 transition-all duration-300 ${success ? 'bg-emerald-600 hover:bg-emerald-600 border-emerald-500' : ''}`}
                disabled={form.formState.isSubmitting || success}
              >
                {form.formState.isSubmitting ? "Authenticating..." : success ? <span className="flex items-center gap-2">Success <Lock className="w-4 h-4"/></span> : "Sign In to Dashboard"}
              </Button>
            </motion.div>
          </form>

          <div className="mt-8 text-center text-sm text-emerald-200/60">
            Don't have a locker yet?{" "}
            <Link href="/patient/register" className="text-white hover:text-emerald-400 font-semibold transition-colors">
              Create your locker
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Visual Section */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden border-l border-emerald-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#041a15] via-[#082a22] to-transparent opacity-80" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 glass-card p-10 rounded-[2.5rem] max-w-lg shadow-2xl border border-emerald-400/20"
        >
          <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center mb-6">
            <BrandLogo className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 leading-snug">End-to-End Privacy Protection</h3>
          <p className="text-emerald-100/70 text-sm leading-relaxed">
            SwasthyaVault encrypts your medical records and enforces strict authorization. Only you and doctors with active consent can view your history.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
