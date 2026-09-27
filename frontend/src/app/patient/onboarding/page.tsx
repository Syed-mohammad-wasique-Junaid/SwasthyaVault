"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { AtmosphericBackground } from "@/components/shared/AtmosphericBackground";
import { ArrowRight, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import axios from "axios";

const formSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  blood_group: z.string().min(1, "Blood group is required"),
  height: z.string().optional(),
  weight: z.string().optional(),
  abha_id: z.string().min(1, "ABHA ID is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  ayush_status: z.string().optional(),
});

export default function PatientOnboarding() {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
        full_name: "", dob: "", gender: "Male", blood_group: "O+", 
        height: "", weight: "", abha_id: "", phone: "", address: "", ayush_status: "No AYUSH information" 
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");
    try {
      if (typeof window !== "undefined" && values.full_name) {
        localStorage.setItem("patient_name", values.full_name.trim());
      }
      await api.post("/patient/profile", values);
      router.push("/patient/dashboard");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          const backendMessage = err.response.data?.detail;
          if (typeof backendMessage === "string") {
            setError(backendMessage);
          } else {
            setError("Invalid request. Please check your data.");
          }
        } else if (err.code === "ERR_NETWORK" || !err.response) {
          setError("Unable to connect to the server.");
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Authentication session expired. Please log in again.");
        } else if (err.response?.status === 422) {
          setError("Please check the information entered.");
        } else if (err.response?.status >= 500) {
          setError("Unable to save your profile. Please try again.");
        } else {
          const backendMessage = err.response?.data?.detail;
          if (typeof backendMessage === "string") {
            setError(backendMessage);
          } else {
            setError("Failed to save profile. Please try again.");
          }
        }
      } else {
        setError(err?.message || "An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen flex relative selection:bg-emerald-500/30 selection:text-white pb-12">
      <AtmosphericBackground />

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-16 md:px-24 lg:px-32 relative z-10 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl mx-auto glass-card p-10 rounded-[2.5rem] shadow-2xl border border-emerald-400/20"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight font-heading">Complete Your Profile</h2>
              <p className="text-emerald-200/70 text-sm">Please provide your medical details to set up your locker.</p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-emerald-100 font-medium text-sm">Full Name</Label>
                  <Input id="full_name" placeholder="Rahul Sharma" {...form.register("full_name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-emerald-100 font-medium text-sm">Date of Birth</Label>
                  <Input id="dob" type="date" {...form.register("dob")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-emerald-100 font-medium text-sm">Gender</Label>
                  <select id="gender" className="flex h-11 w-full rounded-xl border border-emerald-500/20 bg-[#06241e]/90 px-3 py-2 text-sm text-white placeholder:text-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50" {...form.register("gender")}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood_group" className="text-emerald-100 font-medium text-sm">Blood Group</Label>
                  <select id="blood_group" className="flex h-11 w-full rounded-xl border border-emerald-500/20 bg-[#06241e]/90 px-3 py-2 text-sm text-white placeholder:text-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50" {...form.register("blood_group")}>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-emerald-100 font-medium text-sm">Height (cm)</Label>
                  <Input id="height" placeholder="175" {...form.register("height")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-emerald-100 font-medium text-sm">Weight (kg)</Label>
                  <Input id="weight" placeholder="70" {...form.register("weight")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abha_id" className="text-emerald-100 font-medium text-sm">ABHA ID</Label>
                  <Input id="abha_id" placeholder="91-XXXX-XXXX" {...form.register("abha_id")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-emerald-100 font-medium text-sm">Phone Number</Label>
                  <Input id="phone" placeholder="+91 9876543210" {...form.register("phone")} />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-emerald-100 font-medium text-sm">Address</Label>
              <Input id="address" placeholder="123 Health Street" {...form.register("address")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ayush_status" className="text-emerald-100 font-medium text-sm">AYUSH Category (Optional)</Label>
              <select id="ayush_status" className="flex h-11 w-full rounded-xl border border-emerald-500/20 bg-[#06241e]/90 px-3 py-2 text-sm text-white placeholder:text-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50" {...form.register("ayush_status")}>
                <option value="No AYUSH information">No AYUSH information</option>
                <option value="Ayurveda">Ayurveda</option>
                <option value="Yoga & Naturopathy">Yoga & Naturopathy</option>
                <option value="Unani">Unani</option>
                <option value="Siddha">Siddha</option>
                <option value="Homoeopathy">Homoeopathy</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-12 rounded-xl text-base mt-4 transition-all duration-300" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Saving Profile..." : <span className="flex items-center gap-2">Complete Setup <ArrowRight className="w-4 h-4"/></span>}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
