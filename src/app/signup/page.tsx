"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useSignupMutation } from "@/lib/api/apiSlice";
import { useRedirectIfAuthed } from "@/lib/hooks/useRedirectIfAuthed";

function extractErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: unknown } | undefined)?.data as
    | { detail?: string | { msg?: string }[] }
    | undefined;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg as string;
  return fallback;
}

export default function SignupPage() {
  const redirecting = useRedirectIfAuthed();
  const [signup, { isLoading }] = useSignupMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  if (redirecting) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signup({ name, email, password, confirm_password: confirmPassword }).unwrap();
      setSubmittedEmail(email);
    } catch (err) {
      setError(extractErrorMessage(err, "Something went wrong. Try again."));
    }
  }

  // Signup never logs the user in - it just kicks off email verification. Swap the form out
  // for a "check your inbox" state instead of redirecting, since there's nowhere to redirect
  // TO yet (see api_service/routers/auth.py's signup docstring).
  if (submittedEmail) {
    return (
      <AuthLayout centered>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
          <MailCheck className="h-5 w-5 text-accent-dark" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Check your email</h2>
        <p className="mt-2 text-sm text-muted">
          We sent a verification link to <strong className="text-text">{submittedEmail}</strong>.
          Click it to activate your account, then come back and log in.
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
    <AuthLayout centered>
      <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
      <p className="mt-1.5 text-sm text-muted">Free to start - no card required.</p>

      <div className="mt-6">
        <GoogleLoginButton
          label="Continue with Google"
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-text shadow-card transition-colors hover:border-accent hover:text-accent-dark"
        />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="text-xs font-medium text-muted">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

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

        <div>
          <label htmlFor="password" className="text-xs font-medium text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
          <p className="mt-1 text-[11px] text-muted">At least 8 characters.</p>
        </div>

        <div>
          <label htmlFor="confirm_password" className="text-xs font-medium text-muted">
            Confirm password
          </label>
          <input
            id="confirm_password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent-dark hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
