"use client";

import { useEffect, useState } from "react";
import type { FileItem } from "@/lib/types";
import { useDeleteFileMutation, useGetFilesQuery } from "@/lib/api/apiSlice";
import { useFileUploads } from "@/hooks/use-file-uploads";
import UploadModal from "./UploadModal";
import SidebarSection from "./SidebarSection";

const STATUS_LABEL: Record<FileItem["status"], string> = {
  pending_upload: "Uploading",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<FileItem["status"], string> = {
  pending_upload: "bg-gold/20 text-gold",
  processing: "bg-gold/20 text-gold",
  ready: "bg-accent-soft text-accent-dark",
  failed: "bg-rust/15 text-rust",
  cancelled: "bg-border text-muted",
};

const PROCESSING_STATUSES = new Set<FileItem["status"]>(["pending_upload", "processing"]);

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function FilesPanel({
  workspaceId,
  open,
  onToggle,
}: {
  workspaceId: string;
  open: boolean;
  onToggle: () => void;
}) {
  const [showUpload, setShowUpload] = useState(false);
  // Starts true so a freshly-opened panel polls until we actually know
  // nothing's processing; RTK Query re-evaluates pollingInterval every
  // render, so this settles down automatically once files load.
  const [poll, setPoll] = useState(true);

  const { data: files = [] } = useGetFilesQuery(workspaceId, {
    pollingInterval: poll ? 3000 : 0,
  });
  const [deleteFile] = useDeleteFileMutation();
  const { uploads, startUploads, cancelUpload } = useFileUploads(workspaceId);

  useEffect(() => {
    setPoll(files.some((f) => PROCESSING_STATUSES.has(f.status)));
  }, [files]);

  // While a local upload is active its backend row (status "pending_upload")
  // has no real-time percentage, so hide it in favor of the progress bar
  // below - once the upload settles it's removed from `uploads` and the
  // polled row (by then "processing"/"ready"/"failed") takes over.
  const activeUploadFileIds = new Set(
    uploads.map((u) => u.fileId).filter((id): id is string => !!id)
  );
  const visibleFiles = files.filter((f) => !activeUploadFileIds.has(f.id));

  return (
    <>
      <SidebarSection
        title="Files"
        count={files.length}
        dotColor="bg-accent"
        open={open}
        onToggle={onToggle}
      >
        <button
          onClick={() => setShowUpload(true)}
          className="mb-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-dark"
        >
          + Add file
        </button>

        <ul className="max-h-64 space-y-1.5 overflow-y-auto">
          {uploads.length === 0 && visibleFiles.length === 0 && (
            <li className="py-2 text-xs text-muted">No files yet.</li>
          )}

          {uploads.map((u) => (
            <li
              key={u.id}
              className="rounded-lg border border-border bg-bg/60 px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm" title={u.file.name}>
                    {u.file.name}
                  </div>
                  <div className="text-[11px] text-muted">{formatBytes(u.file.size)}</div>
                </div>
                {u.status === "uploading" && (
                  <button
                    className="shrink-0 text-[11px] text-muted hover:text-rust"
                    onClick={() => cancelUpload(u.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full transition-all ${
                    u.status === "error"
                      ? "bg-rust"
                      : u.status === "done"
                        ? "bg-accent-dark"
                        : "bg-accent"
                  }`}
                  style={{ width: `${u.status === "done" ? 100 : u.progress}%` }}
                />
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                {u.status === "uploading" && `${u.progress}%`}
                {u.status === "confirming" && (
                  <>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                    Processing...
                  </>
                )}
                {u.status === "done" && (
                  <span className="font-medium text-accent-dark">Uploaded</span>
                )}
                {u.status === "error" && (
                  <span className="font-medium text-rust">Failed</span>
                )}
                {u.status === "cancelled" && "Cancelled"}
              </div>
            </li>
          ))}

          {visibleFiles.map((f) => (
            <li
              key={f.id}
              className="group flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-bg"
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  f.status === "ready"
                    ? "bg-accent"
                    : f.status === "failed"
                      ? "bg-rust"
                      : PROCESSING_STATUSES.has(f.status)
                        ? "animate-pulse bg-gold"
                        : "bg-border"
                }`}
              />
              <span className="flex-1 truncate text-sm" title={f.filename}>
                {f.filename}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLOR[f.status]}`}
                >
                  {STATUS_LABEL[f.status]}
                </span>
                <button
                  className="hidden h-4 w-4 items-center justify-center rounded-full text-[10px] text-muted hover:bg-rust/15 hover:text-rust group-hover:flex"
                  title="Delete"
                  onClick={() => deleteFile({ fileId: f.id, workspaceId })}
                >
                  &times;
                </button>
              </span>
            </li>
          ))}
        </ul>
      </SidebarSection>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onConfirm={(fs) => startUploads(fs)} />
      )}
    </>
  );
}
