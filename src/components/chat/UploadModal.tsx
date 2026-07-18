"use client";

import { useRef, useState } from "react";
import { useConfirmUploadMutation, usePresignUploadMutation } from "@/lib/api/apiSlice";

type UploadStatus =
  | "uploading"
  | "confirming"
  | "done"
  | "error"
  | "cancelled";

type UploadState = {
  file: File;
  progress: number;
  status: UploadStatus;
  xhr?: XMLHttpRequest;
};

export default function UploadModal({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [presignUpload] = usePresignUploadMutation();
  const [confirmUpload] = useConfirmUploadMutation();

  function patch(idx: number, patch: Partial<UploadState>) {
    setUploads((prev) => prev.map((u, i) => (i === idx ? { ...u, ...patch } : u)));
  }

  async function startUpload(file: File) {
    const idx = uploads.length;
    setUploads((prev) => [...prev, { file, progress: 0, status: "uploading" }]);

    try {
      // Invalidates the workspace's File list tag - the pending_upload row
      // shows up in FilesPanel immediately, no manual refresh needed.
      const presign = await presignUpload({
        workspaceId,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      }).unwrap();

      const xhr = new XMLHttpRequest();
      patch(idx, { xhr });

      await new Promise<void>((resolve, reject) => {
        xhr.open("PUT", presign.upload_url);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            patch(idx, { progress: Math.round((evt.loaded / evt.total) * 100) });
          }
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload failed (${xhr.status})`));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.onabort = () => reject(new Error("cancelled"));
        xhr.send(file);
      });

      patch(idx, { status: "confirming" });
      // Invalidates File tags again - status flips from pending_upload to
      // processing, and FilesPanel's polling takes over from there.
      await confirmUpload({ fileId: presign.file_id, workspaceId }).unwrap();
      patch(idx, { status: "done" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "error";
      patch(idx, { status: message === "cancelled" ? "cancelled" : "error" });
    }
  }

  function cancelUpload(idx: number) {
    uploads[idx]?.xhr?.abort();
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach(startUpload);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-card border border-border bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Upload files</h2>
          <button onClick={onClose} className="text-muted hover:text-text">
            &times;
          </button>
        </div>

        <div
          className="cursor-pointer rounded-card border-2 border-dashed border-border p-8 text-center text-sm text-muted transition-colors hover:border-accent"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          Drag &amp; drop files here, or click to browse
          <div className="mt-1 text-xs">.csv, .json, .pdf, .xlsx, .docx, .txt</div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept=".csv,.json,.pdf,.xlsx,.docx,.txt"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {uploads.length > 0 && (
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {uploads.map((u, i) => (
              <li key={i} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="truncate">{u.file.name}</span>
                  {u.status === "uploading" && (
                    <button
                      className="text-xs text-muted hover:text-text"
                      onClick={() => cancelUpload(i)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-full ${u.status === "error" ? "bg-rust" : "bg-accent"}`}
                    style={{ width: `${u.status === "done" ? 100 : u.progress}%` }}
                  />
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  {u.status === "uploading" && `${u.progress}%`}
                  {u.status === "confirming" && "Processing..."}
                  {u.status === "done" && "Uploaded"}
                  {u.status === "error" && "Failed"}
                  {u.status === "cancelled" && "Cancelled"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
