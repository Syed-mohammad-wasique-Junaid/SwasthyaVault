

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Principles from "@/components/landing/Principles";
import Features from "@/components/landing/Features";
import Workflow from "@/components/landing/Workflow";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Principles />
      <Features />
      <Workflow />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}