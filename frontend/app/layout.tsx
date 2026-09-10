import "./globals.css";
import "../styles/landing.css";

export const metadata = {
  title: "SwasthyaVault",
  description: "AI Healthcare Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}