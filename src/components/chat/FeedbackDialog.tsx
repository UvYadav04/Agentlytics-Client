"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ThumbsDown, ThumbsUp, X } from "lucide-react";
import type { FeedbackRating, MessageFeedback } from "@/lib/types";
import { MAX_FEEDBACK_COMMENT, reasonsFor } from "@/lib/messageFeedback";

export default function FeedbackDialog({
  initial,
  initialRating,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  initial: MessageFeedback | null;
  initialRating: FeedbackRating | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (value: { rating: FeedbackRating | null; reasons: string[]; comment: string }) => void;
}) {
  const [rating, setRating] = useState<FeedbackRating | null>(initialRating);
  const [reasons, setReasons] = useState<string[]>(
    initial && initial.rating === initialRating ? initial.reasons : []
  );
  const [comment, setComment] = useState(initial?.comment ?? "");
  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const options = reasonsFor(rating);
  const canSubmit = !saving && (rating !== null || reasons.length > 0 || comment.trim().length > 0);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    textareaRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  function chooseRating(next: FeedbackRating) {
    const value = rating === next ? null : next;
    setRating(value);
    const allowed = new Set(reasonsFor(value).map((r) => r.key));
    setReasons((current) => current.filter((r) => allowed.has(r)));
  }

  function toggleReason(key: string) {
    setReasons((current) => (current.includes(key) ? current.filter((r) => r !== key) : [...current, key]));
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-text/30 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-dialog-title"
        className="w-full max-w-md rounded-card border border-border bg-card shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 id="feedback-dialog-title" className="text-sm font-semibold">
              Share feedback
            </h2>
            <p className="mt-0.5 text-xs text-muted">Your feedback helps us improve the answers.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-md text-muted hover:bg-bg hover:text-text"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          className="space-y-4 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) onSubmit({ rating, reasons, comment: comment.trim() });
          }}
        >
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={rating === "like"}
              onClick={() => chooseRating("like")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                rating === "like"
                  ? "border-teal bg-teal/10 text-teal"
                  : "border-border text-muted hover:border-teal/50 hover:text-text"
              }`}
            >
              <ThumbsUp className="size-3.5" />
              Good answer
            </button>
            <button
              type="button"
              aria-pressed={rating === "dislike"}
              onClick={() => chooseRating("dislike")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                rating === "dislike"
                  ? "border-rust bg-rust/10 text-rust"
                  : "border-border text-muted hover:border-rust/50 hover:text-text"
              }`}
            >
              <ThumbsDown className="size-3.5" />
              Bad answer
            </button>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-text">
              {rating === "like" ? "What was good?" : rating === "dislike" ? "What went wrong?" : "What stood out?"}
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {options.map((option) => {
                const selected = reasons.includes(option.key);
                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleReason(option.key)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      selected
                        ? "border-accent bg-accent-soft text-accent-dark"
                        : "border-border bg-bg text-muted hover:border-accent/50 hover:text-text"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="feedback-comment" className="mb-1.5 block text-xs font-medium text-text">
              Anything else? <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="feedback-comment"
              ref={textareaRef}
              value={comment}
              maxLength={MAX_FEEDBACK_COMMENT}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell us what you expected, or what should be different."
              className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            <div className="mt-1 text-right text-[10px] text-muted">
              {comment.length}/{MAX_FEEDBACK_COMMENT}
            </div>
          </div>

          {error && <p className="text-xs text-rust">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-1.5 text-xs font-medium text-muted hover:text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white shadow-card transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Sending..." : "Send feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
