import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/site";

export const metadata: Metadata = privatePageMetadata("Log in", { follow: true });

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
