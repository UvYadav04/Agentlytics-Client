import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/site";

export const metadata: Metadata = privatePageMetadata("Profile");

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
