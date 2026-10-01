import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/site";

export const metadata: Metadata = privatePageMetadata("Workspace");

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
