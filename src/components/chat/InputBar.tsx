"use client";

import { useState } from "react";

export default function InputBar({
  disabled,
  busy,
  onSend,
  onStop,
}: {
  disabled: boolean;
  busy: boolean;
  onSend: (content: string) => void;
  onStop: () => void;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-t border-border bg-card px-6 py-4">
      <div className="flex items-end gap-2 rounded-card border border-border bg-bg px-3 py-2 shadow-card transition-shadow focus-within:border-accent focus-within:shadow-[0_0_25px_-10px_rgba(204,120,92,0.5)]">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Ask a question about your data..."
          className="flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted"
        />
        {busy ? (
          <button
            onClick={onStop}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-rust px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rust/90"
          >
            <span className="h-2 w-2 rounded-[2px] bg-white" />
            Stop
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-accent-dark hover:shadow-[0_0_20px_-6px_rgba(204,120,92,0.7)] disabled:opacity-40 disabled:hover:shadow-none"
          >
            Send &#8594;
          </button>
        )}
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-muted">
        Enter to send &middot; Shift+Enter for a new line
      </p>
    </div>
  );
}
