"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FileItem } from "@/lib/types";
import { useGetFilesQuery } from "@/lib/api/apiSlice";

/**
 * Typing "@" opens an autocomplete of the current workspace's files (ready
 * ones only - matches what the orchestrator's FileCatalog actually accepts,
 * see worker_service/tasks/investigation.py's _build_catalog). Picking one
 * inserts "@filename " into the text and adds the file to `mentionedFiles`,
 * whose ids are sent alongside the message as `file_ids` - see onSend.
 */
export default function InputBar({
  workspaceId,
  disabled,
  busy,
  onSend,
  onStop,
}: {
  workspaceId: string;
  disabled: boolean;
  busy: boolean;
  onSend: (content: string, fileIds: string[]) => void;
  onStop: () => void;
}) {
  const [value, setValue] = useState("");
  const [mentionedFiles, setMentionedFiles] = useState<FileItem[]>([]);
  // null = the "@..." autocomplete isn't currently open.
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: files = [] } = useGetFilesQuery(workspaceId, { skip: !workspaceId });
  const readyFiles = useMemo(() => files.filter((f) => f.status === "ready"), [files]);

  const suggestions = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return readyFiles
      .filter((f) => f.filename.toLowerCase().includes(q))
      .filter((f) => !mentionedFiles.some((m) => m.id === f.id))
      .slice(0, 8);
  }, [mentionQuery, readyFiles, mentionedFiles]);

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions.length, mentionQuery]);

  function updateMentionState(text: string, cursor: number) {
    const uptoCursor = text.slice(0, cursor);
    const at = uptoCursor.lastIndexOf("@");
    if (at === -1) {
      setMentionQuery(null);
      setMentionStart(null);
      return;
    }
    const between = uptoCursor.slice(at + 1);
    // A space/newline between "@" and the cursor means we've moved past the
    // mention token - stop treating it as an active autocomplete.
    if (/\s/.test(between)) {
      setMentionQuery(null);
      setMentionStart(null);
      return;
    }
    setMentionQuery(between);
    setMentionStart(at);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setValue(text);
    updateMentionState(text, e.target.selectionStart ?? text.length);
  }

  function selectFile(file: FileItem) {
    if (mentionStart === null) return;
    const cursor = textareaRef.current?.selectionStart ?? value.length;
    const before = value.slice(0, mentionStart);
    const after = value.slice(cursor);
    const inserted = `@${file.filename} `;
    setValue(`${before}${inserted}${after}`);
    setMentionedFiles((prev) => (prev.some((f) => f.id === file.id) ? prev : [...prev, file]));
    setMentionQuery(null);
    setMentionStart(null);

    requestAnimationFrame(() => {
      const pos = before.length + inserted.length;
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(pos, pos);
    });
  }

  function removeMentionedFile(id: string) {
    setMentionedFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(
      trimmed,
      mentionedFiles.map((f) => f.id)
    );
    setValue("");
    setMentionedFiles([]);
    setMentionQuery(null);
    setMentionStart(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery !== null && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectFile(suggestions[activeIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionQuery(null);
        setMentionStart(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-border bg-card px-6 py-4">
      {mentionedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {mentionedFiles.map((f) => (
            <span
              key={f.id}
              className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-dark"
            >
              {f.filename}
              <button
                onClick={() => removeMentionedFile(f.id)}
                className="ml-0.5 text-accent-dark/70 hover:text-accent-dark"
                title="Remove"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative flex items-end gap-2 rounded-card border border-border bg-bg px-3 py-2 shadow-card transition-shadow focus-within:border-accent focus-within:shadow-[0_0_25px_-10px_rgba(204,120,92,0.5)]">
        {mentionQuery !== null && suggestions.length > 0 && (
          <ul className="absolute bottom-full left-0 z-10 mb-1.5 max-h-48 w-72 overflow-y-auto rounded-card border border-border bg-card py-1 shadow-card">
            {suggestions.map((f, i) => (
              <li key={f.id}>
                <button
                  onMouseDown={(e) => {
                    // Prevent the textarea from blurring before onClick fires.
                    e.preventDefault();
                    selectFile(f);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                    i === activeIndex ? "bg-accent-soft text-accent-dark" : "hover:bg-bg"
                  }`}
                >
                  <span className="truncate">{f.filename}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask a question about your data... (@ to reference a file)"
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
        Enter to send &middot; Shift+Enter for a new line &middot; @ to reference a file
      </p>
    </div>
  );
}
