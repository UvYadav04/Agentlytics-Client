import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import Navbar from "@/components/Navbar";
import CanvasCursor from "@/components/cursor/CanvasCursor";

export const metadata: Metadata = {
  title: "Agentlytics — Multi-Agent AI Data Analyzer",
  description:
    "Ask questions across your CSVs, spreadsheets, PDFs, and documents in plain English. Specialized AI agents investigate your files and answer with evidence traced back to the exact row or page it came from.",

  verification: {
    google: "Xgxg9B9QJwE4dxfDf9xFqf6ie7tQetaLg0M2robno4k",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
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
