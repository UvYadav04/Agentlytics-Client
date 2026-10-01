import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/site";

export const metadata: Metadata = privatePageMetadata("Shared dashboard");

export default function SharedDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
