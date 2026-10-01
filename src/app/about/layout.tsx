import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "How the AI Data Analyzer Works",
  description:
    "How Agentlytics turns CSV, Excel, PDF, TXT files and databases into verified answers: isolated AI agents, deterministic tools and source citations.",
  path: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
