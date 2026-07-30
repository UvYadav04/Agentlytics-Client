"use client";

import { useState } from "react";
import type { Chat } from "@/lib/types";

/**
 * Shown whenever there's no active chat - on first load, and again whenever
 * a workspace is created or switched (selecting a workspace resets chatId
 * to null). Rather than telling the user to go find "New chat" in the
 * sidebar, this puts a message box front and center: typing and sending
 * silently creates a chat and sends the message in one step. The row of
 * chat pills below covers "I want to go back to an existing chat" without
 * making the user hunt in a collapsed accordion section.
 */
export default function ChatLanding({
  chats,
  submitting,
  onStartChat,
  onSelectChat,
  onNewChat,
}: {
  chats: Chat[];
  submitting: boolean;
  onStartChat: (content: string) => void;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || submitting) return;
    onStartChat(trimmed);
    setValue("");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
        <span className="h-3 w-3 rounded-full bg-accent" />
      </div>

      {/* <div className="max-w-lg">
        <h2 className="text-xl font-semibold">Talk to your data files.</h2>
        <p className="mt-1.5 text-sm text-muted">
          Ask a real question - an agent reads the file and shows its work.
        </p>
      </div> */}

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
            {submitting ? "Starting..." : <>Send &#8594;</>}
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted">
          Enter to send &middot; Shift+Enter for a new line
        </p>
      </div>

      {/* {chats.length > 0 && (
        <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-2">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-dark"
          >
            + New chat
          </button>
          {chats.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectChat(c.id)}
              className="max-w-[160px] truncate rounded-full border border-border bg-card px-3 py-1.5 text-xs text-text transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-dark"
              title={c.title}
            >
              {c.title}
            </button>
          ))}
        </div>
      )} */}

      {/* {chats.length === 0 && (
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-dark"
        >
          + Start a blank chat instead
        </button>
      )} */}
    </div>
  );
}
