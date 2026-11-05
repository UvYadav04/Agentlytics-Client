import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Sign Up Free - AI Data Analyzer",
  description:
    "Create a free Quarry account to analyze CSV, Excel, PDF and text files or PostgreSQL and MongoDB databases with AI agents that cite their sources.",
  path: "/signup",
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
