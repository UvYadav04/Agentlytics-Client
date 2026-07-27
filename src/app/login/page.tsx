"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useLoginMutation, useResendVerificationMutation } from "@/lib/api/apiSlice";
import { useRedirectIfAuthed } from "@/lib/hooks/useRedirectIfAuthed";

// FastAPI/pydantic validation errors arrive as {detail: [{msg, ...}]}; our own
// HTTPException(...) errors arrive as {detail: "plain string"} - handle both so every error
// path (signup/login/forgot-password/change-password) can share this one helper.
function extractErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: unknown } | undefined)?.data as
    | { detail?: string | { msg?: string }[] }
    | undefined;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg as string;
  return fallback;
}

function isUnverifiedError(err: unknown): boolean {
  return (err as { status?: number } | undefined)?.status === 403;
}

export default function LoginPage() {
  const router = useRouter();
  const redirecting = useRedirectIfAuthed();
  const [login, { isLoading }] = useLoginMutation();
  const [resendVerification, { isLoading: resending, isSuccess: resent }] = useResendVerificationMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

  if (redirecting) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setShowResend(false);
    try {
      await login({ email, password }).unwrap();
      router.push("/chat");
    } catch (err) {
      setError(extractErrorMessage(err, "Something went wrong. Try again."));
      setShowResend(isUnverifiedError(err));
    }
  }

  return (
    <AuthLayout centered>
      <h2 className="text-2xl font-bold tracking-tight w-full text-center">Welcome back</h2>
      {/* <p className="mt-1.5 text-sm text-muted w-full">Log in to your workspace.</p> */}

      <div className="mt-6 w-full">
        <GoogleLoginButton
          label="Continue with Google"
          className="w-full rounded-full bg-accent border border-border bg-card px-4 py-2.5 text-sm font-medium text-text shadow-card transition-colors hover:border-accent hover:text-accent-dark"
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
            {showResend && (
              <button
                type="button"
                onClick={() => resendVerification(email)}
                disabled={resending || resent}
                className="ml-1 font-medium underline underline-offset-2 disabled:no-underline"
              >
                {resent ? "Link sent - check your inbox" : resending ? "Sending..." : "Resend verification email"}
              </button>
            )}
          </div>
        )}

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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-muted">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-accent-dark hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-accent-dark hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
