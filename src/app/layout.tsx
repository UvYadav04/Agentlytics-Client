import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import Navbar from "@/components/Navbar";
import CanvasCursor from "@/components/cursor/CanvasCursor";

export const metadata: Metadata = {
  title: "Agentlytics",
  description: "Ask questions about your data, backed by real evidence.",
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
