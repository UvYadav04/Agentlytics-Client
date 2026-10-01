import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/site";

export const metadata: Metadata = privatePageMetadata("Chart");

export default function ChartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
