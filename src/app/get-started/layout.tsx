import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Get Started - Analyze Your Data with AI",
  description:
    "Create a free workspace, upload CSV, Excel, PDF or TXT files or connect PostgreSQL and MongoDB, and get charts, reports and dashboards from questions.",
  path: "/get-started",
});

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
