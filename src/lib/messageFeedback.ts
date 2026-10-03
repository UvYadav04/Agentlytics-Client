import type { FeedbackRating, RetryMode } from "@/lib/types";

export const POSITIVE_REASONS: { key: string; label: string }[] = [
  { key: "accurate", label: "Accurate" },
  { key: "helpful", label: "Helpful" },
  { key: "clear", label: "Clear and easy to follow" },
  { key: "good_visuals", label: "Useful charts" },
];

export const NEGATIVE_REASONS: { key: string; label: string }[] = [
  { key: "incorrect", label: "Incorrect answer" },
  { key: "incomplete", label: "Incomplete" },
  { key: "irrelevant", label: "Didn't answer my question" },
  { key: "wrong_data", label: "Used the wrong file or data" },
  { key: "hard_to_understand", label: "Hard to understand" },
  { key: "too_long", label: "Too long" },
  { key: "too_short", label: "Too short" },
  { key: "chart_issue", label: "Problem with a chart" },
  { key: "slow", label: "Too slow" },
  { key: "other", label: "Something else" },
];

export function reasonsFor(rating: FeedbackRating | null) {
  if (rating === "like") return POSITIVE_REASONS;
  if (rating === "dislike") return NEGATIVE_REASONS;
  return [...NEGATIVE_REASONS, ...POSITIVE_REASONS];
}

export const RETRY_OPTIONS: { mode: RetryMode; label: string; hint: string }[] = [
  { mode: "regenerate", label: "Try again", hint: "Generate a fresh answer to the same question" },
  { mode: "think_harder", label: "Think more", hint: "Investigate more thoroughly and double-check the numbers" },
  { mode: "show_reasoning", label: "Show reasoning", hint: "Explain the steps, data and calculations behind the answer" },
  { mode: "more_detail", label: "Longer answer", hint: "Add more detail, numbers and context" },
  { mode: "more_concise", label: "Shorter answer", hint: "Get straight to the point" },
  { mode: "simpler", label: "Simpler language", hint: "Explain it without jargon" },
];

export const RETRY_MODE_LABEL: Record<RetryMode, string> = {
  regenerate: "Regenerated",
  think_harder: "Thought more",
  show_reasoning: "With reasoning",
  more_detail: "Longer answer",
  more_concise: "Shorter answer",
  simpler: "Simpler language",
};

export const MAX_FEEDBACK_COMMENT = 2000;
