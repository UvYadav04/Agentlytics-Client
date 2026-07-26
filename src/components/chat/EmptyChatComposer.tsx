"use client";

import { useState } from "react";

/**
 * Shown when a chat exists but hasn't received its first message yet (e.g.
 * right after "+ New chat"). Visually identical to ChatLanding's centered,
 * oversized input - the idea is that "no messages yet" always looks the
 * same regardless of whether a chat row exists in the DB, so the composer
 * never demotes itself to the small docked bar until there's something to
 * scroll back to. Once the first message lands, the parent swaps this out
 * for MessageList + the compact InputBar.
 */
export default function EmptyChatComposer({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: (content: string) => void;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || submitting) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
        <span className="h-3 w-3 rounded-full bg-accent" />
      </div>

      <div className="max-w-lg">
        <h2 className="text-xl font-semibold">Talk to your data files.</h2>
        <p className="mt-1.5 text-sm text-muted">
          Ask a real question - an agent reads the file and shows its work.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <div className="flex items-end gap-3 rounded-card border border-border bg-card px-4 py-3 shadow-card transition-shadow focus-within:border-accent focus-within:shadow-[0_0_25px_-10px_rgba(204,120,92,0.5)]">
          <textarea
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={3}
            disabled={submitting}
            placeholder="e.g. What were our top-performing products last quarter, and why?"
            className="flex-1 resize-none bg-transparent py-1 text-base outline-none placeholder:text-muted disabled:opacity-60"
          />
          <button
            onClick={submit}
            disabled={!value.trim() || submitting}
            className="shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-accent-dark hover:shadow-[0_0_20px_-6px_rgba(204,120,92,0.7)] disabled:opacity-40 disabled:hover:shadow-none"
          >
            {submitting ? "Sending..." : <>Send &#8594;</>}
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted">
          Enter to send &middot; Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
