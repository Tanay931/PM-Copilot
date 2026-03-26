import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PM Copilot — BNGAI",
  description: "A day-to-day assistant for Product Managers to automate PRD and prototyping tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full flex bg-offwhite">
        <Providers>
          <Sidebar />
          <main className="flex-1 ml-60 min-h-screen overflow-y-auto">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
