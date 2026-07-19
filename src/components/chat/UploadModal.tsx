"use client";

import { useRef, useState } from "react";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
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
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setSelected((prev) => [...prev, ...Array.from(fileList)]);
  }

  function removeFile(idx: number) {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  }

  function confirm() {
    if (selected.length === 0) return;
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
          <div className="mt-1 text-xs">.csv, .json, .pdf, .xlsx, .docx, .txt</div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept=".csv,.json,.pdf,.xlsx,.docx,.txt"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {selected.length > 0 && (
          <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
            {selected.map((f, i) => (
              <li
                key={`${f.name}-${f.size}-${i}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-bg/60 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{f.name}</div>
                  <div className="text-xs text-muted">{formatBytes(f.size)}</div>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted hover:bg-rust/15 hover:text-rust"
                  title="Remove"
                >
                  &times;
                </button>
              </li>
            ))}
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
            disabled={selected.length === 0}
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
