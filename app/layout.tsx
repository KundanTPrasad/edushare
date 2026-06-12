import type { Metadata, Viewport } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthContext";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "EduShare-Academic Resource Ecosystem",
  description:
    "Find and download Notes and previous year question papers for engineering colleges.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${mono.variable}`}>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          margin: 0,
          maxWidth: "100%",
          overflowX: "hidden",
          backgroundColor: "#0f0a14",
          backgroundImage: `
            radial-gradient(ellipse 80% 55% at -5% -5%, rgba(192,80,140,0.35) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 100% 0%, rgba(251,146,60,0.2) 0%, transparent 50%),
            radial-gradient(ellipse 70% 60% at 50% 100%, rgba(139,80,220,0.2) 0%, transparent 60%)
          `,
          backgroundAttachment: "scroll",
        }}
      >
        <AuthProvider>
          <Navbar />

          <main style={{ flex: 1 }}>
            {children}
          </main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
