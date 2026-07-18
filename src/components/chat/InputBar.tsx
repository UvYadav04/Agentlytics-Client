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
      <div className="flex items-end gap-2 rounded-card border border-border bg-bg px-3 py-2 focus-within:border-accent">
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
            className="shrink-0 rounded-full bg-rust px-4 py-1.5 text-xs font-medium text-white hover:bg-rust/90 transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-40"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
