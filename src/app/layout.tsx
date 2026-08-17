import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import Navbar from "@/components/Navbar";
import CanvasCursor from "@/components/cursor/CanvasCursor";

export const metadata: Metadata = {
  title: "Agentlytics — Multi-Agent AI Data Analyzer",
  description:
    "Ask questions across your CSVs, spreadsheets, PDFs, and documents in plain English. Specialized AI agents investigate your files and answer with evidence traced back to the exact row or page it came from.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
       <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_CONTENT} />
      </head>
      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        <ReduxProvider>
          <CanvasCursor />
          <Navbar />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
