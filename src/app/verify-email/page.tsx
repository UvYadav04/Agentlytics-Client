"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { useLazyVerifyEmailQuery } from "@/lib/api/apiSlice";

function extractErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: unknown } | undefined)?.data as { detail?: string } | undefined;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

// The route the emailed verification link points to (see shared/email.py's
// send_verification_email) - reachable any number of times with the same token. The backend
// (GET /auth/verify-email) never clears the token on success, so clicking the same link twice,
// or re-opening an old email, both land here and both call the same endpoint - it just reports
// "already verified" instead of erroring the second time.
function VerifyEmailInner() {
  const token = useSearchParams().get("token");
  const [verifyEmail, { data, error, isFetching }] = useLazyVerifyEmailQuery();

  useEffect(() => {
    if (token) verifyEmail(token);
  }, [token, verifyEmail]);

  let body: React.ReactNode;
  if (!token) {
    body = (
      <>
        <XCircle className="h-8 w-8 text-rust" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Missing verification link</h2>
        <p className="mt-2 text-sm text-muted">
          This page needs a verification token - open the link from your email again.
        </p>
      </>
    );
  } else if (isFetching) {
    body = (
      <>
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Verifying...</h2>
      </>
    );
  } else if (error) {
    body = (
      <>
        <XCircle className="h-8 w-8 text-rust" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Couldn&apos;t verify email</h2>
        <p className="mt-2 text-sm text-muted">
          {extractErrorMessage(error, "This link is invalid or has expired.")}
        </p>
      </>
    );
  } else if (data) {
    body = (
      <>
        <CheckCircle2 className="h-8 w-8 text-accent" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          {data.message.startsWith("Your email is already") ? "Already verified" : "Email verified"}
        </h2>
        <p className="mt-2 text-sm text-muted">{data.message}</p>
      </>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col">
        {body}
        <Link
          href="/login"
          className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-dark"
        >
          Go to login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
