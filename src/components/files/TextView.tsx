"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, WrapText } from "lucide-react";
import { useLazyGetFileTextChunkQuery } from "@/lib/api/apiSlice";
import type { FileViewInfo } from "@/lib/types";
import { ViewerMessage } from "./TableView";
import { formatBytes, viewerErrorMessage } from "./viewerUtils";

export default function TextView({ info, onUnavailable }: { info: FileViewInfo; onUnavailable?: () => void }) {
  const [chunks, setChunks] = useState<string[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [totalBytes, setTotalBytes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wrap, setWrap] = useState(true);
  const [fetchChunk, { isFetching }] = useLazyGetFileTextChunkQuery();
  const startedRef = useRef(false);

  async function loadMore(offset: number) {
    setError(null);
    try {
      const chunk = await fetchChunk({ fileId: info.id, offset }).unwrap();
      setChunks((current) => [...current, chunk.text]);
      setNextOffset(chunk.next_offset);
      setTotalBytes(chunk.total_bytes);
    } catch (err) {
      setError(viewerErrorMessage(err, "This file couldn't be previewed."));
    }
  }

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    loadMore(0);
  });

  const lines = useMemo(() => {
    const text = chunks.join("");
    const split = text.split(/\r\n|\n|\r/);
    if (split.length > 1 && split[split.length - 1] === "" && nextOffset === null) split.pop();
    return split;
  }, [chunks, nextOffset]);

  if (error && chunks.length === 0) {
    return <ViewerMessage message={error} onDownload={onUnavailable} />;
  }

  if (chunks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading text...
      </div>
    );
  }

  const loadedBytes = nextOffset ?? totalBytes ?? 0;
  const gutter = String(lines.length).length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto bg-card">
        <div className="py-2 font-mono text-xs leading-5">
          {lines.map((line, index) => (
            <div key={index} className="flex hover:bg-accent-soft/30">
              <span
                aria-hidden="true"
                className="sticky left-0 shrink-0 select-none border-r border-border bg-bg px-3 text-right text-muted"
                style={{ width: `calc(${gutter}ch + 1.5rem + 1px)` }}
              >
                {index + 1}
              </span>
              <span className={`px-4 text-text ${wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"}`}>
                {line || " "}
              </span>
            </div>
          ))}
        </div>
        {nextOffset !== null && (
          <div className="flex justify-center border-t border-border py-3">
            <button
              type="button"
              disabled={isFetching}
              onClick={() => loadMore(nextOffset)}
              className="flex items-center gap-2 rounded-full border border-border bg-bg px-4 py-1.5 text-xs font-medium text-text hover:border-accent hover:text-accent-dark disabled:opacity-50"
            >
              {isFetching && <Loader2 className="size-3.5 animate-spin" />}
              Load more
            </button>
          </div>
        )}
        {error && <p className="px-4 pb-3 text-center text-xs text-rust">{error}</p>}
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-border bg-bg px-4 py-2 text-xs text-muted">
        <span>
          {lines.length.toLocaleString()} lines
          {totalBytes ? ` · ${formatBytes(Math.min(loadedBytes, totalBytes))} of ${formatBytes(totalBytes)} loaded` : ""}
        </span>
        <button
          type="button"
          aria-pressed={wrap}
          onClick={() => setWrap((w) => !w)}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${wrap ? "bg-accent-soft text-accent-dark" : "hover:bg-card hover:text-text"}`}
        >
          <WrapText className="size-3.5" />
          Wrap lines
        </button>
      </div>
    </div>
  );
}
