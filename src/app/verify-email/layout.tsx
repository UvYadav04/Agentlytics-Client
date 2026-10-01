import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/site";

export const metadata: Metadata = privatePageMetadata("Verify your email", { follow: true });

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
