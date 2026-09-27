import type { Metadata } from "next";
import { Inter, Playfair_Display, Sora, Montserrat, Cutive_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "500", "600", "700"] });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["400", "500", "600", "700"] });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["400", "500", "600", "700"] });
const cutiveMono = Cutive_Mono({ subsets: ["latin"], variable: "--font-cutive", weight: ["400"] });

export const metadata: Metadata = {
  title: "SwasthyaVault | AI-Powered Digital Health Locker",
  description: "Premium healthcare management powered by AI. Securely store, analyze, and share your medical records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${sora.variable} ${montserrat.variable} ${cutiveMono.variable} min-h-screen bg-background font-sans antialiased text-slate-800`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
