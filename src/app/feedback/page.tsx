"use client";

import { useState } from "react";
import { useGetMeQuery, useSubmitFeedbackMutation } from "@/lib/api/apiSlice";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function FeedbackPage() {
  const { data: user, isLoading: loading } = useGetMeQuery();
  const [submitFeedback, { isLoading: sending }] = useSubmitFeedbackMutation();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <div className="p-10 text-center text-muted">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted">Sign in to send feedback.</p>
        <GoogleLoginButton />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">Feedback</h1>
      <p className="text-muted text-sm mb-6">
        Something confusing, broken, or missing? Tell us about it.
      </p>

      {sent ? (
        <div className="rounded-card border border-border bg-card p-6 shadow-card text-sm">
          Thanks - your feedback was sent.
        </div>
      ) : (
        <form
          className="rounded-card border border-border bg-card p-6 shadow-card"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!message.trim()) return;
            setError(null);
            try {
              await submitFeedback(message.trim()).unwrap();
              setSent(true);
            } catch {
              setError("Couldn't send feedback - try again in a moment.");
            }
          }}
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="What's on your mind?"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent resize-none"
          />
          {error && <p className="mt-2 text-sm text-rust">{error}</p>}
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-40"
          >
            {sending ? "Sending..." : "Send feedback"}
          </button>
        </form>
      )}
    </main>
  );
}
