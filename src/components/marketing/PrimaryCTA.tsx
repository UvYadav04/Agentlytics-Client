"use client";

import Link from "next/link";
import { useGetMeQuery } from "@/lib/api/apiSlice";

const BASE_CLASS =
  "inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-medium text-white shadow-card transition-all hover:bg-accent-dark hover:shadow-[0_0_40px_-8px_rgba(204,120,92,0.6)]";

export default function PrimaryCTA({
  guestLabel = "Get started free",
  memberLabel = "My Workspace",
  memberHref = "/chat",
  className = "",
}: {
  guestLabel?: string;
  memberLabel?: string;
  memberHref?: string;
  className?: string;
}) {
  const { data: user } = useGetMeQuery();
  return (
    <Link href={user ? memberHref : "/get-started"} className={`${BASE_CLASS} ${className}`}>
      {user ? memberLabel : guestLabel}
    </Link>
  );
}
