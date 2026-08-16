"use client";

import { useRef, useState } from "react";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// Instant client-side feedback only - the real, authoritative limit is enforced server-side in
// api_service/routers/files.py's presign_upload (shared/upload_limits.py, MAX_DOCUMENT_UPLOAD_MB,
// default 25MB) since this constant could drift or be bypassed entirely. PDF/txt specifically
// because they're read in full for RAG, unlike CSV/XLSX which stream more incrementally.
const LIMITED_TYPE_MB: Record<string, number> = { pdf: 25, txt: 25 };

// Kept in sync with Server/analyzerEngine/ingestion/file_types/pdf/pdf_ingestor.py's
// MAX_PDF_PAGES, which re-checks this server-side (this client check can be skipped entirely by
// calling the API directly). A page count this high is also what tends to push a single PDF's
// chunks past what the vector store will accept in one upsert - see PDFIngestor.ingest().
const MAX_PDF_PAGES = 30;

function fileKey(f: File) {
  return `${f.name}-${f.size}-${f.lastModified}`;
}

function sizeReason(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const limitMb = ext ? LIMITED_TYPE_MB[ext] : undefined;
  if (!limitMb) return null;
  const limitBytes = limitMb * 1024 * 1024;
  if (file.size <= limitBytes) return null;
  return `Exceeds the ${limitMb}MB limit for .${ext} files`;
}

/**
 * Selection-only step. Picking files here doesn't upload anything - it just
 * stages metadata (name, size) for the user to confirm or cancel. Actual
 * upload only starts once they hit "Upload", at which point this modal
 * closes and hands the files off to the parent (FilesPanel), which tracks
 * progress in the sidebar via useFileUploads.
 */
export default function UploadModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (files: File[]) => void;
}) {
  const [selected, setSelected] = useState<File[]>([]);
  // PDF page counts, read asynchronously via pdf-lib as files are added. "checking" while the
  // read is in flight, "error" if the PDF couldn't be parsed at all (blocked either way, same as
  // an oversized file - safer than silently letting an unreadable PDF through).
  const [pdfPageCounts, setPdfPageCounts] = useState<Record<string, number | "checking" | "error">>({});
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setSelected((prev) => [...prev, ...files]);

    files.forEach((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (ext !== "pdf") return;
      const key = fileKey(f);
      setPdfPageCounts((prev) => ({ ...prev, [key]: "checking" }));
      f.arrayBuffer()
        .then(async (buf) => {
          const { PDFDocument } = await import("pdf-lib");
          const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
          setPdfPageCounts((prev) => ({ ...prev, [key]: doc.getPageCount() }));
        })
        .catch(() => {
          setPdfPageCounts((prev) => ({ ...prev, [key]: "error" }));
        });
    });
  }

  function removeFile(idx: number) {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  }

  function blockingReason(file: File): string | null {
    const sizeIssue = sizeReason(file);
    if (sizeIssue) return sizeIssue;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") return null;

    const count = pdfPageCounts[fileKey(file)];
    if (count === "checking") return "Checking page count...";
    if (count === "error") return "Couldn't read this PDF";
    if (typeof count === "number" && count > MAX_PDF_PAGES) {
      return `Too large - ${count} pages exceeds the ${MAX_PDF_PAGES}-page limit for PDFs`;
    }
    return null;
  }

  const hasBlocking = selected.some((f) => blockingReason(f) !== null);

  function confirm() {
    if (selected.length === 0 || hasBlocking) return;
    onConfirm(selected);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-accent/20 bg-card p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Upload files</h2>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-bg hover:text-text"
          >
            &times;
          </button>
        </div>

        <div
          className="cursor-pointer rounded-card border-2 border-dashed border-border bg-bg/50 p-8 text-center text-sm text-muted transition-colors hover:border-accent hover:bg-accent-soft/30 hover:text-accent-dark"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
        >
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          </div>
          <span className="font-medium text-text">Drag &amp; drop files here</span>, or click to
          browse
          <div className="mt-1 text-xs">.csv, .xlsx, .pdf, .txt</div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept=".csv,.xlsx,.pdf,.txt"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {selected.length > 0 && (
          <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
            {selected.map((f, i) => {
              const reason = blockingReason(f);
              const isChecking = reason === "Checking page count...";
              return (
                <li
                  key={`${f.name}-${f.size}-${i}`}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                    reason && !isChecking
                      ? "border-rust/40 bg-rust/5"
                      : "border-border bg-bg/60"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{f.name}</div>
                    <div className={`text-xs ${reason && !isChecking ? "text-rust" : "text-muted"}`}>
                      {reason ?? formatBytes(f.size)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted hover:bg-rust/15 hover:text-rust"
                    title="Remove"
                  >
                    &times;
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-1.5 text-xs font-medium text-muted hover:bg-bg hover:text-text"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={selected.length === 0 || hasBlocking}
            title={hasBlocking ? "Remove or wait on flagged files before uploading" : undefined}
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-accent-dark hover:shadow-[0_0_20px_-6px_rgba(204,120,92,0.7)] disabled:opacity-40 disabled:hover:shadow-none"
          >
            {selected.length > 0
              ? `Upload ${selected.length} file${selected.length > 1 ? "s" : ""}`
              : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
