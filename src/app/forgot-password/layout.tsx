import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/site";

export const metadata: Metadata = privatePageMetadata("Reset your password", { follow: true });

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
