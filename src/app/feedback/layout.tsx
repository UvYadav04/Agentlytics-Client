import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Feedback",
  description:
    "Share feedback, feature requests or bug reports about Agentlytics, the AI data analyzer for files and databases.",
  path: "/feedback",
});

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
