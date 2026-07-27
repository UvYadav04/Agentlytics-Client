"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { useForgotPasswordMutation } from "@/lib/api/apiSlice";
import { useRedirectIfAuthed } from "@/lib/hooks/useRedirectIfAuthed";

export default function ForgotPasswordPage() {
  const redirecting = useRedirectIfAuthed();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (redirecting) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Fire-and-forget on purpose: the API always returns the same generic message regardless
    // of whether the email is registered (see api_service/routers/auth.py's forgot_password),
    // so there's nothing here worth branching on beyond "the request went out".
    await forgotPassword(email);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
          <MailCheck className="h-5 w-5 text-accent-dark" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Check your email</h2>
        <p className="mt-2 text-sm text-muted">
          If <strong className="text-text">{email}</strong> is registered, we&apos;ve sent a new
          password to it. You can change it any time from your profile once you&apos;re logged in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-dark"
        >
          Back to login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold tracking-tight">Forgot your password?</h2>
      <p className="mt-1.5 text-sm text-muted">
        Enter your email and we&apos;ll send you a new temporary password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="text-xs font-medium text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isLoading ? "Sending..." : "Send new password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-accent-dark hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
