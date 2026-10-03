"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import MoreMenu, { type MoreMenuItem } from "@/components/ui/MoreMenu";
import { useSetMessageFeedbackMutation } from "@/lib/api/apiSlice";
import { RETRY_MODE_LABEL, RETRY_OPTIONS } from "@/lib/messageFeedback";
import type { ChatMessage, FeedbackRating, MessageFeedback, RetryMode } from "@/lib/types";
import FeedbackDialog from "./FeedbackDialog";

function errorMessage(err: unknown, fallback: string) {
  const data = (err as { data?: { detail?: unknown } } | undefined)?.data;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

const ICON_BUTTON =
  "flex size-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40";

export default function MessageActions({
  message,
  canRetry,
  retryDisabled,
  onRetry,
}: {
  message: ChatMessage;
  canRetry: boolean;
  retryDisabled: boolean;
  onRetry: (mode: RetryMode) => void;
}) {
  const [feedback, setFeedback] = useState<MessageFeedback | null>(message.feedback ?? null);
  const [dialogRating, setDialogRating] = useState<FeedbackRating | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [saveFeedback, { isLoading: saving }] = useSetMessageFeedbackMutation();

  useEffect(() => {
    setFeedback(message.feedback ?? null);
  }, [message.feedback]);

  const rating = feedback?.rating ?? null;

  async function persist(next: { rating: FeedbackRating | null; reasons: string[]; comment: string | null }) {
    const previous = feedback;
    setError(null);
    setFeedback(
      next.rating || next.reasons.length || next.comment
        ? { ...next, updated_at: new Date().toISOString() }
        : null
    );
    try {
      const saved = await saveFeedback({ messageId: message.id, chatId: message.chat_id, ...next }).unwrap();
      setFeedback(saved);
      return true;
    } catch (err) {
      setFeedback(previous);
      setError(errorMessage(err, "Couldn't save your feedback. Please try again."));
      return false;
    }
  }

  function rate(next: FeedbackRating) {
    if (rating === next) {
      persist({ rating: null, reasons: [], comment: feedback?.comment ?? null });
      return;
    }
    persist({ rating: next, reasons: [], comment: feedback?.comment ?? null });
    if (next === "dislike") setDialogRating("dislike");
  }

  const retryItems: MoreMenuItem[] = [
    {
      key: RETRY_OPTIONS[0].mode,
      label: RETRY_OPTIONS[0].label,
      hint: RETRY_OPTIONS[0].hint,
      icon: RotateCcw,
      onSelect: () => onRetry(RETRY_OPTIONS[0].mode),
    },
    "separator",
    ...RETRY_OPTIONS.slice(1).map((option) => ({
      key: option.mode,
      label: option.label,
      hint: option.hint,
      onSelect: () => onRetry(option.mode),
    })),
  ];

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-0.5 text-muted">
        <button
          type="button"
          aria-label="Good answer"
          title="Good answer"
          aria-pressed={rating === "like"}
          onClick={() => rate("like")}
          className={`${ICON_BUTTON} ${rating === "like" ? "bg-teal/10 text-teal" : "hover:bg-border/60 hover:text-text"}`}
        >
          <ThumbsUp className="size-3.5" fill={rating === "like" ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          aria-label="Bad answer"
          title="Bad answer"
          aria-pressed={rating === "dislike"}
          onClick={() => rate("dislike")}
          className={`${ICON_BUTTON} ${rating === "dislike" ? "bg-rust/10 text-rust" : "hover:bg-border/60 hover:text-text"}`}
        >
          <ThumbsDown className="size-3.5" fill={rating === "dislike" ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          aria-label="Give feedback"
          title="Give feedback"
          onClick={() => setDialogRating(rating)}
          className={`${ICON_BUTTON} ${
            feedback?.comment || feedback?.reasons.length ? "text-accent-dark" : ""
          } hover:bg-border/60 hover:text-text`}
        >
          <MessageSquareText className="size-3.5" />
        </button>
        {canRetry && (
          <MoreMenu
            items={retryItems}
            label="Retry"
            icon={RotateCcw}
            align="start"
            disabled={retryDisabled}
            buttonClassName="size-7"
          />
        )}
        {(message.version ?? 1) > 1 && (
          <span className="ml-1.5 rounded-full bg-border/60 px-2 py-0.5 text-[10px] font-medium text-muted">
            {message.retry_mode ? RETRY_MODE_LABEL[message.retry_mode] : "Regenerated"}
            {(message.version ?? 1) > 2 ? ` · v${message.version}` : ""}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] text-rust">{error}</p>}
      {dialogRating !== undefined && (
        <FeedbackDialog
          initial={feedback}
          initialRating={dialogRating}
          saving={saving}
          error={error}
          onClose={() => {
            setDialogRating(undefined);
            setError(null);
          }}
          onSubmit={async (value) => {
            const ok = await persist({ ...value, comment: value.comment || null });
            if (ok) setDialogRating(undefined);
          }}
        />
      )}
    </div>
  );
}
