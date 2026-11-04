"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, FileSpreadsheet, FileText, FileType2, Loader2, Table2, X } from "lucide-react";
import { useGetFileDownloadUrlMutation, useGetFileViewQuery } from "@/lib/api/apiSlice";
import PdfView from "./PdfView";
import TableView, { ViewerMessage } from "./TableView";
import TextView from "./TextView";
import { formatBytes, viewerErrorMessage } from "./viewerUtils";

const TYPE_ICON = { csv: Table2, xlsx: FileSpreadsheet, pdf: FileText, txt: FileType2 } as const;

export default function FileViewerModal({ fileId, onClose }: { fileId: string; onClose: () => void }) {
  const { data: info, error, isLoading } = useGetFileViewQuery(fileId);
  const [getDownloadUrl, { isLoading: downloading }] = useGetFileDownloadUrlMutation();
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  async function download() {
    setDownloadError(null);
    try {
      const { url } = await getDownloadUrl(fileId).unwrap();
      const link = document.createElement("a");
      link.href = url;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setDownloadError(viewerErrorMessage(err, "Couldn't download the file."));
    }
  }

  const Icon = info ? TYPE_ICON[info.file_type as keyof typeof TYPE_ICON] ?? FileText : FileText;
  const canDownload = !!info && !info.dummy;
  const onUnavailable = canDownload ? download : undefined;

  let body;
  if (isLoading) {
    body = (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Opening file...
      </div>
    );
  } else if (error || !info) {
    body = <ViewerMessage message={viewerErrorMessage(error, "This file couldn't be opened.")} />;
  } else if (info.kind === "table") {
    body = <TableView info={info} onUnavailable={onUnavailable} />;
  } else if (info.kind === "text") {
    body = <TextView info={info} onUnavailable={onUnavailable} />;
  } else {
    body = <PdfView info={info} onUnavailable={onUnavailable} />;
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-text/40 p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-viewer-title"
        className="flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-card border border-border bg-card shadow-[0_24px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-dark">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="file-viewer-title" className="truncate text-sm font-semibold">
              {info?.filename ?? "Loading..."}
            </h2>
            <p className="text-[11px] text-muted">
              {info
                ? `${info.file_type.toUpperCase()}${info.size_bytes ? ` · ${formatBytes(info.size_bytes)}` : ""}${
                    info.dummy ? " · Sample file" : ""
                  } · View only`
                : ""}
            </p>
          </div>
          {downloadError && <span className="hidden text-[11px] text-rust sm:inline">{downloadError}</span>}
          {info?.kind === "pdf" && info.url && (
            <a
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text hover:border-accent hover:text-accent-dark sm:flex"
            >
              <ExternalLink className="size-3.5" />
              Open in new tab
            </a>
          )}
          {canDownload && (
            <button
              type="button"
              onClick={download}
              disabled={downloading}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text hover:border-accent hover:text-accent-dark disabled:opacity-50"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-bg hover:text-text"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1">{body}</div>
      </div>
    </div>,
    document.body
  );
}
